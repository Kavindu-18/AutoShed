import Examiner from "../models/Examiner.js";

// ✅ Add new examiner
export const addExaminer = async (req, res) => {
  try {
    const { name, availability, maxDailySlots } = req.body;
    const examiner = new Examiner({ name, availability, maxDailySlots });
    await examiner.save();
    res.status(201).json({ message: "Examiner added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get available examiners
export const getAvailableExaminers = async (req, res) => {
  try {
    const examiners = await Examiner.find();
    res.json(examiners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
