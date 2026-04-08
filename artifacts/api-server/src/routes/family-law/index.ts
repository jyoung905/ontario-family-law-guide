import { Router } from "express";
import multer from "multer";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const openai = new OpenAI({
  apiKey: process.env["familylawapi"],
});

const SYSTEM_PROMPT = `You are a plain-language Ontario family law information assistant. You help people understand Ontario family court procedures, forms, and timelines.

IMPORTANT RULES:
- You are NOT a lawyer and cannot give legal advice
- Always remind users to consult a licensed lawyer or duty counsel for case-specific advice
- Use plain, accessible English — avoid legal jargon or define it clearly when necessary
- Be warm, empathetic, and supportive — many users are in stressful situations
- When discussing forms, always mention the form number (e.g., Form 8, Form 10, Form 14B)
- Always mention key deadlines when relevant (e.g., 30 days to file Form 10 Answer)
- Keep responses concise and well-organized — mobile-friendly

KEY ONTARIO FAMILY LAW FORMS & PROCEDURES:
- Form 8/8A: Application (starts a family court case)
- Form 10: Answer (response to Form 8, usually 30 days to file)
- Form 14/14A/14B: Motion forms (urgent requests or changing orders)
- Form 15/15A/15B: Response to motion or change
- Form 35.1: Parenting Affidavit (for custody/access matters)
- Form 13/13.1: Financial Statement (for support or property matters)
- "Noted in default": what happens if you miss the deadline to respond
- Case conference: meeting with judge before a hearing
- Settlement conference: attempt to settle before trial
- Family Responsibility Office (FRO): enforces child and spousal support orders

DEFINITIONS TO USE:
- Affidavit: a written statement you swear is true
- Serve/Service: officially delivering documents to the other person
- Case conference: a meeting with a judge to discuss your case before a full hearing

RESOURCES TO MENTION WHEN APPROPRIATE:
- Legal Aid Ontario: 1-800-668-8258 or legalaid.on.ca
- Duty Counsel: free same-day legal help at courthouses
- Family Law Information Centre: at most Ontario courthouses
- Steps to Justice: stepstojustice.ca

Always end responses with a brief, one-sentence reminder to seek legal advice for their specific situation.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

router.post("/chat", async (req, res) => {
  const { messages, systemContext } = req.body as {
    messages: ChatMessage[];
    systemContext?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const systemMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (systemContext) {
    systemMessages.push({ role: "system", content: systemContext });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [...systemMessages, ...messages],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
    res.end();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

router.post("/upload-document", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { originalname, mimetype, buffer } = req.file;
  const userRole = (req.body.userRole as string) || undefined;

  let documentText = "";

  try {
    if (mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdfParse(buffer);
      documentText = parsed.text;
      console.log(`[upload-document] PDF extracted — pages: ${parsed.numpages}, chars: ${documentText.length}`);
    } else if (
      mimetype.startsWith("text/") ||
      originalname.match(/\.(txt|md|rtf)$/i)
    ) {
      documentText = buffer.toString("utf-8");
      console.log(`[upload-document] Text file read — chars: ${documentText.length}`);
    } else {
      res.status(400).json({ error: `Unsupported file type: ${mimetype}. Please upload a PDF or text file.` });
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "File read error";
    console.error("[upload-document] Parse error:", message);
    res.status(500).json({ error: `Could not read the file: ${message}` });
    return;
  }

  if (documentText.trim().length < 20) {
    res.status(400).json({ error: "The file appears to be empty or image-only (scanned). Please try a text-based PDF." });
    return;
  }

  const analysisSystemPrompt = `You are an Ontario family court document analyst. Analyze the provided text from an Ontario family court document and return a JSON object with these exact fields:

{
  "documentType": "the specific form name or document type",
  "deadline": "the most critical deadline or action required as a plain-language sentence (or 'No deadline detected' if none found)",
  "confidence": "high, medium, or low",
  "summary": "2-3 plain-language sentences explaining what this document means for the person reading it",
  "nextSteps": ["3-4 specific next actions the reader should take, in priority order"]
}

Context: user role is "${userRole || "not specified"}"
Return ONLY the JSON object.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: analysisSystemPrompt },
        { role: "user", content: `Analyze this document:\n\n${documentText.slice(0, 6000)}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(raw);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const confidence = String(result.confidence ?? "low");
    const documentType = String(result.documentType ?? "Document not recognized");

    if (confidence === "low" || documentType === "Document not recognized") {
      console.warn(`[upload-document] LOW CONFIDENCE — "${documentType}", chars: ${documentText.length}`);
    } else {
      console.log(`[upload-document] OK — "${documentType}", confidence: ${confidence}`);
    }

    res.json({ ...result, extractedChars: documentText.length, fileName: originalname });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[upload-document] AI error:", message);
    res.status(500).json({ error: message });
  }
});

router.post("/analyze-document", async (req, res) => {
  const { documentText, userRole } = req.body as {
    documentText: string;
    userRole?: string;
  };

  if (!documentText || documentText.trim().length < 20) {
    res.status(400).json({ error: "documentText must be at least 20 characters" });
    return;
  }

  const systemPrompt = `You are an Ontario family court document analyst. Analyze the provided text from an Ontario family court document and return a JSON object with these exact fields:

{
  "documentType": "the specific form name or document type (e.g., Form 8 Application, Form 10 Answer, Temporary Order, Case Conference Notice, Endorsement)",
  "deadline": "the most critical deadline or action required, as a plain-language sentence (or 'No deadline detected' if none found)",
  "confidence": "high, medium, or low — based on how clearly the document text identifies itself",
  "summary": "2-3 plain-language sentences explaining what this document means for the person reading it",
  "nextSteps": ["array of 3-4 specific next actions the reader should take, in priority order"]
}

IMPORTANT:
- If the document is unclear or not an Ontario family court document, set confidence to "low" and documentType to "Document not recognized"
- Use plain language throughout — no legal jargon without explanation
- Always consider the reader is self-represented and stressed
- Context: user role is "${userRole || "not specified"}"

Return ONLY the JSON object, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this document text:\n\n${documentText.slice(0, 4000)}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(raw);
    } catch {
      console.error("[analyze-document] JSON parse failed:", raw);
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const confidence = String(result.confidence ?? "low");
    const documentType = String(result.documentType ?? "Document not recognized");

    if (confidence === "low" || documentType === "Document not recognized") {
      console.warn(`[analyze-document] LOW CONFIDENCE / TEMPLATE FALLBACK — documentType: "${documentType}", input length: ${documentText.length}`);
    } else {
      console.log(`[analyze-document] OK — documentType: "${documentType}", confidence: ${confidence}`);
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze-document] Error:", message);
    res.status(500).json({ error: message });
  }
});

export default router;
