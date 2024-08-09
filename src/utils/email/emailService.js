"use strict";

// $ npm i nodemailer
const nodemailer = require("nodemailer");
const { CustomError } = require("../../errors/customError");
const { getFeedbackHtml } = require("./feedback/feedback");
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } = require("../../../constants");

/* -------------------------------------------------------------------------- */

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});
// console.log(transporter);

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bloggio" <${NODEMAILER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email successfully sent: %s", info.messageId);
  } catch (error) {
    console.error("Email sending error: ", error);
    throw new CustomError("Request failed. Please contact support!");
  }
};

const sendFeedbackEmail = async (name, email, subject, feedback) => {
  try {
    const htmlContent = getFeedbackHtml(name, email, subject, feedback);

    const info = await transporter.sendMail({
      from: `"Bloggio" <${NODEMAILER_EMAIL}>`,
      to: NODEMAILER_EMAIL,
      subject: `Feedback: ${subject}`,
      html: htmlContent,
    });

    console.log("Email successfully sent: %s", info.messageId);
  } catch (error) {
    console.error("Email sending error: ", error);
    throw new CustomError("Failed to send feedback email. Please try again.");
  }
};

module.exports = { sendEmail, sendFeedbackEmail };
