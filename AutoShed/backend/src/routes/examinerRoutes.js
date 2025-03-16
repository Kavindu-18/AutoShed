import express from "express";
import{addExaminer} from "../controllers/examinerController.js";

const examinersrouter = express.Router();

examinersrouter.post("/", addExaminer);

export default examinersrouter;
