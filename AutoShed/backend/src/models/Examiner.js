import mongoose from "mongoose";

const examinerSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email:{ type: String, required: true,},
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  courses: { type: Array, required: true },
  modules: { type: Array, required: true },
  availability: { type: String, default:true },
  salary: { type: Number,default: 0 },
  role: { type: String, default: "examiner" },
  password: { type: String, required: true },
});

const Examiner = mongoose.model("Examiner", examinerSchema);
export default Examiner;