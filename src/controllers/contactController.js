import prisma from "../config/prisma.js";
import { sendEmail } from "../utils/sendEmail.js";
import { contactMessageTemplate } from "../templates/contactMessageTemplate.js";

export const handleContactSubmit = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // Find the first active admin's email to route the message to
    const admin = await prisma.admin.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { id: "asc" },
    });

    const recipientEmail = admin?.email || process.env.SMTP_EMAIL;

    if (!recipientEmail) {
      return res.status(500).json({
        success: false,
        message: "SMTP recipient email is not configured",
      });
    }

    await sendEmail({
      to: recipientEmail,
      subject: `New Public Contact Inquiry - ${fullName}`,
      html: contactMessageTemplate({ fullName, email, phone, message }),
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("CONTACT SUBMIT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
