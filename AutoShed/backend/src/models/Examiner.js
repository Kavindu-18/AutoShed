import mongoose from "mongoose";

const examinerSchema = mongoose.Schema({
  id: { type: String, required: true ,unique: true},
  email:{ type: String, required: true,unique: true},
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  courses: { type: Array, required: true },
  modules: { type: Array, required: true },
  availability: { type: String, required: true,default:true },
  salary: { type: Number, required: true },
  profilephoto: { type: [String], required: true,default:["https://t3.ftcdn.net/jpg/04/35/70/87/360_F_435708711_CnUzPzFgXeZCtYsFtCnKzjyqCtFgCqFg.jpg"] }
});

const Examiner = mongoose.model("Examiner", examinerSchema);
export default Examiner;
