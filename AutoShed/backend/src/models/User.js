import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    Email:{
        type: String, 
        required: true, 
        unique: true, 
    },
    Password:{
        type: String, 
        required: true, 
        
    },
    Role:{
        type: String, 
        required: true
    },
    FirstName:{
        type: String, 
        required: true, 
    }

})
const User = mongoose.model("Users",UserSchema);

export default User;
