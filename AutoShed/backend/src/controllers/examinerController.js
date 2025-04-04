import Examiner from "../models/Examiner.js";
import { randomBytes } from 'crypto';
import jwt from  "jsonwebtoken";


export async function addExaminer(req, res) {
  try {
    const data = req.body;


    
    const randomPassword = randomBytes(4).toString('hex'); 

    
    data.password = randomPassword;

    

    // Count existing examiners to generate a unique ID
    const count = await Examiner.countDocuments();
    data.id = `EX${count + 1}`;


    const newExaminer = new Examiner(data);
    await newExaminer.save();


    res.status(201).json({ message: "Examiner added successfully", examiner: newExaminer, password: randomPassword });

  } catch (error) {
    res.status(500).json({ message: "Examiner adding failed", error: error.message });
  }
}

export async function getExaminers(req, res) {
  try {
    const examiners = await Examiner.find();
    res.json(examiners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getExaminerById(req, res) {
  try {
    const { id } = req.params;
    const examiner = await Examiner.findOne({ id: id }); // Find by the 'id' field

    if (!examiner) {
      return res.status(404).json({ message: 'Examiner not found' });
    }

    res.json(examiner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export async function DeleteExaminer(req, res) {
  try {
    const { id } = req.params;

    const examiner = await Examiner.findOneAndDelete({ id });

    if (!examiner) {
      return res.status(404).json({ message: "Examiner not found" });
    }

    res.json({ message: "Examiner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function UpdateExaminer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    
    const examiner = await Examiner.findOneAndUpdate(
      { id }, 
      updateData,
      { new: true, runValidators: true } 
    );

    if (!examiner) {
      return res.status(404).json({ message: "Examiner not found" });
    }

    res.json({ message: "Examiner updated successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export async function LoginExaminer(req, res) {
  const Data = req.body;

  Examiner.findOne({
      email : Data.email
  }).then((examiner) => {
      if(examiner){
          if(examiner.password === Data.password){

              const token = jwt.sign({
                  id : examiner.id,
                  email : examiner.email,
                  role : examiner.role
              }, process.env.JWT_SECRET);  
              
              res.send({message : "Login Successful", token: token, examiner : examiner});
              
          }else{
              res.send({message : "Password is incorrect"});
          }
      }else{
          res.send({message : "User not registered"});
      }
  })
}


  

