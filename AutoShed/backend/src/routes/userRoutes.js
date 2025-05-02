import express from "express"
import { Loginuser, registerUser, getAllUsers} from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.post("/",registerUser)

UserRouter.post("/login",Loginuser)
UserRouter.get("/",getAllUsers)


export default UserRouter;