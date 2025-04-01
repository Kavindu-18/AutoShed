import Presentation from "../models/Presentation.js";

export const bookPresentation = async (req, res) => {
  try {
    const { examinerId, date, time } = req.body;

    // Check for conflicts
    const existingPresentation = await Presentation.findOne({ examinerId, date, time });
    if (existingPresentation) {
      return res.status(400).json({ error: "Examiner is already booked at this time" });
    }

    const presentation = new Presentation({ examinerId, date, time });
    await presentation.save();

    res.status(201).json({ message: "Presentation scheduled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reschedule a presentation
export const reschedulePresentation = async (req, res) => {
  try {
    const { date, time } = req.body;
    const presentation = await Presentation.findById(req.params.id);

    if (!presentation) {
      return res.status(404).json({ error: "Presentation not found" });
    }

    presentation.date = date;
    presentation.time = time;
    await presentation.save();

    res.json({ message: "Presentation rescheduled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find();
    res.json(presentations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
