import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import healthRouter from "./health";
import familyLawRouter from "./family-law/index";
import premiumRouter from "./family-law/premium";
import seoRouter from "./seo";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/family-law", familyLawRouter);
router.use("/family-law/premium", premiumRouter);
router.use(seoRouter);

router.get("/ui-review", (_req, res) => {
  const filePath = path.resolve(process.cwd(), "../../screenshots/UI_Review.html");
  if (!fs.existsSync(filePath)) { res.status(404).send("Not found."); return; }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="UI_Review.html"');
  res.sendFile(filePath);
});

router.get("/presentation", (_req, res) => {
  const filePath = path.resolve(process.cwd(), "../../screenshots/Ontario_Family_Law_App_Presentation.html");
  if (!fs.existsSync(filePath)) {
    res.status(404).send("Presentation file not found.");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="Ontario_Family_Law_App_Presentation.html"');
  res.sendFile(filePath);
});

export default router;
