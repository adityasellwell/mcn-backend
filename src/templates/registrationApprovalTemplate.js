export const registrationApprovalTemplate = (application, meeting = null) => {
  return `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">

  <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Meet Connect Network</h1>
    <p style="color: #d4f5d4; margin: 6px 0 0;">Application Approved</p>
  </div>

  <p>Hello <strong>${application.fullName}</strong>,</p>
  <p>Congratulations! Your registration application for <strong>Meet Connect Network (MCN)</strong> has been <strong>approved</strong>.</p>
  <p>We are excited to welcome you! Below are the details of the upcoming meeting you registered for. Please make sure to attend as per the schedule.</p>

  ${meeting ? `
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <h3 style="color: #0C831F;">Meeting Details</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 40%;">Meeting Title</td>
      <td style="padding: 10px;">${meeting.title}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Date</td>
      <td style="padding: 10px;">${new Date(meeting.meetingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Time</td>
      <td style="padding: 10px;">${meeting.startTime} – ${meeting.endTime}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Venue Address</td>
      <td style="padding: 10px;">${meeting.address}</td>
    </tr>
    ${meeting.meetingFee ? `
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Registration Fee Paid</td>
      <td style="padding: 10px; color: #0C831F; font-weight: bold;">₹${meeting.meetingFee}</td>
    </tr>` : ""}
  </table>` : ""}

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <p>If you have any questions or need further assistance, please feel free to reach out to us.</p>
  <p>Welcome to the MCN community!</p>

  <p>Regards,<br/><strong>Meet Connect Network Team</strong></p>

</div>
`;
};
