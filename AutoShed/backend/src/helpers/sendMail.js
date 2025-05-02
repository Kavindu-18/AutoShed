import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: "kanishkawijekoon2@gmail.com",
    pass: "qhkvdbdypgpaknsg",
  },
});

export async function sendmail(to, subject, text, html) {
  const info = await transporter.sendMail({
    from: 'kanishkawijekoon2@gmail.com',
    to,
    subject,
    text,
    html
  });
}
