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
