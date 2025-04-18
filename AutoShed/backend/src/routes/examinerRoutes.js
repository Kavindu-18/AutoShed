import express from "express";
import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer, getExaminerById,LoginExaminer,getExaminerByEmail} from "../controllers/examinerController.js";

const examinersrouter = express.Router();

examinersrouter.post("/", addExaminer);
examinersrouter.get("/", getExaminers);
examinersrouter.get("/:id", getExaminerById);
examinersrouter.delete("/:id", DeleteExaminer);
examinersrouter.put("/:id", UpdateExaminer);
examinersrouter.post("/login", LoginExaminer);
examinersrouter.get("/email/:email", getExaminerByEmail);

export default examinersrouter;

