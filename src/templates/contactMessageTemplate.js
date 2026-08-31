export const contactMessageTemplate = (data) => {
  return `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">

  <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">MCN - Muslim Community Network</h1>
    <p style="color: #d4f5d4; margin: 6px 0 0;">New Contact Form Message</p>
  </div>

  <p>Hello Admin,</p>
  <p>You have received a new contact inquiry from the public website.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <h3 style="color: #0C831F;">Sender Details</h3>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 30%;">Full Name</td>
      <td style="padding: 10px;">${data.fullName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Email</td>
      <td style="padding: 10px;"><a href="mailto:${data.email}" style="color: #0C831F;">${data.email}</a></td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Phone</td>
      <td style="padding: 10px;">${data.phone}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Received On</td>
      <td style="padding: 10px;">${new Date().toLocaleString("en-IN")}</td>
    </tr>
  </table>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <h3 style="color: #0C831F;">Message Content</h3>
  <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6; border-left: 4px solid #0C831F;">
    ${data.message.replace(/\n/g, "<br/>")}
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #888; margin-top: 20px; font-style: italic;">
    Beautifully developed and maintained by <a href="https://inspiringinfosys.com" style="color: #0C831F; text-decoration: none; font-weight: bold;">Inspiring Infosys</a>
  </div>

</div>
`;
};
