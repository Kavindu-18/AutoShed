import Examiner from "../models/Examiner.js";

export function addExaminer(req, res) {
  const data=req.body;
  const newexaminer = new Examiner(data);
  newexaminer
    .save()
    .then((result) => {
      res.status(201).json({ message: "Examiner added successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message:"Examiner adding failed" });
    })
}

export async function getExaminers(req, res) {
  try {
    const examiners = await Examiner.find();
    res.json(examiners);
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


  
