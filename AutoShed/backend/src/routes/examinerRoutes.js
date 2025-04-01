import express from "express";
import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer, getExaminerById} from "../controllers/examinerController.js";

const router = express.Router();

router.post("/", addExaminer);
router.get("/", getExaminers);
router.get("/:id", getExaminerById);
router.delete("/:id", DeleteExaminer);
router.put("/:id", UpdateExaminer);

export default router;