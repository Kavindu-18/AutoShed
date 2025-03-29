import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNo: { type: String, required: true },
  faculty: { type: String, required: true },
  specialization: { type: String, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;
