import express from "express";

import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer, getExaminerById,LoginExaminer} from "../controllers/examinerController.js";

import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer, getExaminerById} from "../controllers/examinerController.js";


const examinersrouter = express.Router();


examinersrouter.post("/", addExaminer);
examinersrouter.get("/", getExaminers);
examinersrouter.get("/:id", getExaminerById);
examinersrouter.delete("/:id", DeleteExaminer);
examinersrouter.put("/:id", UpdateExaminer);
examinersrouter.post("/login", LoginExaminer);

export default examinersrouter;


router.post("/", addExaminer);
router.get("/", getExaminers);
router.get("/:id", getExaminerById);
router.delete("/:id", DeleteExaminer);
router.put("/:id", UpdateExaminer);

export default router;

