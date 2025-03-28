import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    email:{
        type: String, 
        required: true, 
        unique: true, 
    },
    password:{
        type: String, 
        required: true, 
        
    },
    role:{
        type: String, 
        required: true
    },
    firstname:{
        type: String, 
        required: true, 
    }

})
const User = mongoose.model("Users",UserSchema);

export default User;
