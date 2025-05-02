import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from  "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function registerUser(req,res){
    
    const Data = req.body;

    Data.password = bcrypt.hashSync(Data.password,10);
    const newUser = new User(Data);

    newUser.save().then(()=>{
        res.json({Message:"User registered successfully"});
    }).catch((error)=>{
        res.status(500).json({Message:"Error in registering user"});
    })

}

export async function getAllUsers(req, res) {
    try {
      const user = await User.find();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
    }
  }

export function Loginuser(req,res){
    const Data = req.body;

    User.findOne({
        email : Data.email 
    }).then(
        (user)=>{
            if(user==null){
                res.status(404).json({error:"User Not Found"});
            }else{
                

                const ispasswordCorrect =bcrypt.compareSync(Data.password,user.password);

                if(ispasswordCorrect){

                    const token =jwt.sign({
                        firstname       : user.firstname,
                        email           : user.email,
                        role            : user.role
                    },process.env.JWT_SECRET);

                    res.json({Message:"Login successful",token:token,user:user});
                    
                }else{
                    res.status(404).json({error:"Login failed"});
                }
            }
        }
    )
}

export  function isitAdmin(req,res){
    
    let isadmin = false;

    if(req.user != null && req.user.role == "admin") {
        isadmin = true;
    }
    return isadmin;
}

export  function isitStudent(req){
    
    let isitStudent = false;

    if(req.user != null && req.user.role == "student") {
        isitStudent = true;
    }
    return isitStudent;
}
