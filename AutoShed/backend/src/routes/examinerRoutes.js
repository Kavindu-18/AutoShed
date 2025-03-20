import express from "express";
import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer, getExaminerById} from "../controllers/examinerController.js";

const examinersrouter = express.Router();

examinersrouter.post("/", addExaminer);
examinersrouter.get("/", getExaminers);
examinersrouter.get("/:id", getExaminerById);
examinersrouter.delete("/:id", DeleteExaminer);
examinersrouter.put("/:id", UpdateExaminer);

export default examinersrouter;

