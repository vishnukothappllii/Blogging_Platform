import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER || "chodvadiyafenil@gmail.com",       // your gmail address
    pass: process.env.MAIL_PASSWORD || "ohsublrduqznqdji"      // app password from Google
  }
});

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Blogging Platform" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html
  });
};

export {sendMail}
