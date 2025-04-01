import express from "express"
import { Loginuser, registerUser } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.post("/",registerUser)

UserRouter.post("/login",Loginuser)


export default UserRouter;