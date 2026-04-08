import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env["familylawapi"],
});

const DISCLAIMER = `\n\n---\n**Important:** This is a draft for your review only. It does not constitute legal advice. Review carefully, fill in all placeholders, and consult a licensed lawyer before filing or using any document.`;

router.post("/draft-document", async (req, res) => {
  const { formType, userFacts, userRole } = req.body as {
    formType: string;
    userFacts: string;
    userRole?: string;
  };

  if (!formType || !userFacts) {
    res.status(400).json({ error: "formType and userFacts are required" });
    return;
  }

  const systemPrompt = `You are an Ontario family law document assistant. Generate a structured draft of the requested Ontario court form based on the user's facts. 

IMPORTANT:
- Use plain, clear language
- Mark all fields needing user input as [PLACEHOLDER: description]
- Mark any field you cannot fill as [UNKNOWN - please fill in]
- Always include a note that this is a draft for review only
- Structure the output clearly with section headers
- Reference correct Ontario form numbers and field names
- Do NOT provide legal advice — only information and drafts

The user's role is: ${userRole || "not specified"}`;

  const userPrompt = `Please draft a ${formType} for Ontario family court based on these facts:

${userFacts}

Provide the draft with clear section headings, placeholder markers for missing information, and a brief explanation of what each section means.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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

    const finalContent = fullResponse + DISCLAIMER;
    res.write(`data: ${JSON.stringify({ done: true, fullContent: finalContent })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

router.post("/affidavit", async (req, res) => {
  const { facts, userRole } = req.body as { facts: string; userRole?: string };

  if (!facts) {
    res.status(400).json({ error: "facts is required" });
    return;
  }

  const systemPrompt = `You are an Ontario family law affidavit drafting assistant. Create a structured affidavit outline based on the facts provided.

IMPORTANT:
- Structure the affidavit properly: deponent info, numbered paragraphs, exhibits
- Each paragraph should address one distinct fact
- Mark uncertain or missing information as [PLACEHOLDER: description]
- Remind the user that affidavits must be sworn before a commissioner of oaths
- Keep language factual, first-person, and past tense
- Do NOT include legal argument — only facts
- Reference Form 14A (Affidavit) conventions for Ontario Superior Court of Justice, Family Court`;

  const userPrompt = `Draft an affidavit outline for Ontario Family Court based on these facts:

${facts}

The deponent's role: ${userRole || "not specified"}

Provide numbered paragraphs, suggest relevant exhibits, and note what additional information is needed.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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

    const finalContent = fullResponse + DISCLAIMER;
    res.write(`data: ${JSON.stringify({ done: true, fullContent: finalContent })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

router.post("/coach-message", async (req, res) => {
  const { situation, mode, draftMessage } = req.body as {
    situation: string;
    mode?: string;
    draftMessage?: string;
  };

  if (!situation) {
    res.status(400).json({ error: "situation is required" });
    return;
  }

  if (mode !== undefined && mode !== "draft" && mode !== "review") {
    res.status(400).json({ error: "mode must be 'draft' or 'review'" });
    return;
  }

  const systemPrompt = `You are a family law communication coach for Ontario family court matters. Help users communicate professionally and effectively with the other party.

RULES:
- Messages must be polite, factual, and business-like
- Avoid emotional language, accusations, or anything that could be used against the user in court
- Focus on child welfare when children are involved
- Flag any language that could harm the user's case (mark as ⚠️ FLAG: reason)
- Provide suggested alternative phrasing for flagged sections
- Remind user that all written communication may be entered as evidence in court`;

  const userPrompt = draftMessage
    ? `Situation: ${situation}\n\nDraft message to review:\n"${draftMessage}"\n\nPlease review this message, flag any problematic language, and suggest an improved version.`
    : `Situation: ${situation}\n\nPlease draft a professional message I can send to the other party regarding this situation.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

export default router;
