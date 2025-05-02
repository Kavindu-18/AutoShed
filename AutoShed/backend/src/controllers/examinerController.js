import { randomBytes } from 'crypto';
import Examiner from '../models/Examiner.js';
import jwt from  "jsonwebtoken";
import { sendmail } from '../helpers/sendmail.js'; // Adjust path as needed

export async function addExaminer(req, res) {
  try {
    const data = req.body;

    // Generate random password
    const randomPassword = randomBytes(4).toString('hex'); 
    data.password = randomPassword;

    // Generate custom ID
    const count = await Examiner.countDocuments();
    data.id = `EX${count + 1}`;

    // Save to database
    const newExaminer = new Examiner(data);
    await newExaminer.save();

    // Send welcome email
    await sendmail(
      data.email,
      "Welcome to AutoShed!",
      "Your AutoShed login credentials",
      `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; text-align: center;">Welcome to <span style="color: #27ae60;">AutoShed</span>!</h2>
            <p style="font-size: 16px; color: #333;">Hi <strong>${data.fname}</strong>,</p>
            <p style="font-size: 16px; color: #333;">
              You have been successfully registered as an examiner in our system.
            </p>
            <p style="font-size: 16px; color: #333;">
              Here are your login credentials:
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px;"><strong>Email:</strong> ${data.email}</p>
              <p style="font-size: 16px;"><strong>Temporary Password:</strong> <span style="color: #e74c3c;">${randomPassword}</span></p>
            </div>
            <p style="font-size: 16px; color: #333;">
              For security, please log in and change your password as soon as possible.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/login" target="_blank" style="background-color: #27ae60; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
                Visit AutoShed
              </a>
            </div>
            <p style="font-size: 16px; color: #333;">We're excited to have you on board!</p>
            <p style="font-size: 16px; color: #333;">– The AutoShed Team</p>
          </div>
        </div>
      `
    );
    

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

export async function getExaminerByEmail(req, res) {
  try {
    const { email } = req.params;
    const examiner = await Examiner.findOne({ email: email }); // Find by the 'email' field

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