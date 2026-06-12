import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
      //use this if the email service is gmail  service: "gmail",
      // service: gmail,+

       host: process.env.SMTP_HOST,
       port: process.env.SMTP_PORT,
       secure: true,
   
            
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/*transporter.verify((error, success) => {
  if (error) {
    console.log("EMAIL ERROR:", error);
  } else {
    console.log("EMAIL SERVER READY");
  }
});
*/
export default transporter;