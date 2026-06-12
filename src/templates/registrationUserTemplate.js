export const registrationUserTemplate = (application, meeting = null) => {
  return `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">

  <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Meet Connect Network</h1>
    <p style="color: #d4f5d4; margin: 6px 0 0;">Registration Received</p>
  </div>

  <p>Hello <strong>${application.fullName}</strong>,</p>
  <p>Thank you for registering with <strong>Meet Connect Network (MCN)</strong>. We have successfully received your registration and will review it shortly.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <h3 style="color: #0C831F;">Registration Details</h3>

  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 40%;">Registration Type</td>
      <td style="padding: 10px;">${application.registrationType}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Full Name</td>
      <td style="padding: 10px;">${application.fullName}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Mobile</td>
      <td style="padding: 10px;">${application.mobile}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Email</td>
      <td style="padding: 10px;">${application.email}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Company</td>
      <td style="padding: 10px;">${application.companyName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold;">Business Category</td>
      <td style="padding: 10px;">${application.businessCategory}</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Chapter</td>
      <td style="padding: 10px;">${application.chapterName || "—"}</td>
    </tr>
    ${application.website ? `
    <tr>
      <td style="padding: 10px; font-weight: bold;">Website</td>
      <td style="padding: 10px;"><a href="${application.website}" style="color: #0C831F;">${application.website}</a></td>
    </tr>` : ""}
    ${application.referredBy ? `
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Referred By</td>
      <td style="padding: 10px;">${application.referredBy}</td>
    </tr>` : ""}
    ${application.utrNumber ? `
    <tr>
      <td style="padding: 10px; font-weight: bold;">UTR Number</td>
      <td style="padding: 10px;">${application.utrNumber}</td>
    </tr>` : ""}
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Submitted On</td>
      <td style="padding: 10px;">${new Date().toLocaleString("en-IN")}</td>
    </tr>
  </table>

  ${meeting ? `
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <h3 style="color: #0C831F;">Upcoming Meeting Details</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold; width: 40%;">Meeting</td>
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
      <td style="padding: 10px; font-weight: bold;">Venue</td>
      <td style="padding: 10px;">${meeting.address}</td>
    </tr>
    ${meeting.meetingFee ? `
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; font-weight: bold;">Registration Fee</td>
      <td style="padding: 10px; color: #0C831F; font-weight: bold;">₹${meeting.meetingFee}</td>
    </tr>` : ""}
  </table>` : ""}

  ${application.socialProfiles && 
  Array.isArray(application.socialProfiles) && 
  application.socialProfiles.length > 0 ? `
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <h3 style="color: #0C831F;">Social Profiles</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    ${application.socialProfiles.map((link, i) => `
    <tr ${i % 2 === 0 ? 'style="background: #f9f9f9;"' : ""}>
      <td style="padding: 10px; font-weight: bold; width: 40%;">${link.platform}</td>
      <td style="padding: 10px;">
        <a href="${link.url}" style="color: #0C831F;">${link.url}</a>
      </td>
    </tr>`).join("")}
  </table>` : ""}

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <p>${application.registrationType === "VISITOR"
    ? "Your visitor profile has been created. Our team will be in touch with meeting details soon."
    : "Your application will be reviewed by the MCN team. We will notify you once it is processed."
  }</p>

  <p>Thank you for choosing Meet Connect Network.</p>

  <p>Regards,<br/><strong>Meet Connect Network Team</strong></p>

</div>
`;
};