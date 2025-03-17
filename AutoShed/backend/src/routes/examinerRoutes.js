import express from "express";
import{addExaminer, getExaminers, DeleteExaminer, UpdateExaminer} from "../controllers/examinerController.js";

const examinersrouter = express.Router();

examinersrouter.post("/", addExaminer);
examinersrouter.get("/", getExaminers);
examinersrouter.delete("/:id", DeleteExaminer);
examinersrouter.put("/:id", UpdateExaminer);

export default examinersrouter;
