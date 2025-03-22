import Examiner from "../models/Examiner.js";

export async function addExaminer(req, res) {
  try {
    const data = req.body;

    // Count existing examiners to generate a unique ID
    const count = await Examiner.countDocuments();
    data.id = `EX${count + 1}`;

    const newExaminer = new Examiner(data);
    await newExaminer.save();

    res.status(201).json({ message: "Examiner added successfully", examiner: newExaminer });
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


  
