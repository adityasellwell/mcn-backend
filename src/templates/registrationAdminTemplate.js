export const registrationAdminTemplate = (application) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">MCN - Muslim Community Network</h1>
        <p style="color: #d4f5d4; margin: 6px 0 0;">New Registration Application</p>
      </div>

      <p>A new registration application has been received. Details are below:</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px;">
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px; font-weight: bold; width: 40%;">Full Name</td>
          <td style="padding: 10px;">${application.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Registration Type</td>
          <td style="padding: 10px;">${application.registrationType}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px; font-weight: bold;">Email</td>
          <td style="padding: 10px;">${application.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Mobile</td>
          <td style="padding: 10px;">${application.mobile}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px; font-weight: bold;">Company</td>
          <td style="padding: 10px;">${application.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Business Category</td>
          <td style="padding: 10px;">${application.businessCategory}</td>
        </tr>
        ${application.chapterName ? `
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px; font-weight: bold;">Chapter</td>
          <td style="padding: 10px;">${application.chapterName}</td>
        </tr>` : ""}
        ${application.venue ? `
        <tr>
          <td style="padding: 10px; font-weight: bold;">Venue</td>
          <td style="padding: 10px;">${application.venue}</td>
        </tr>` : ""}
      </table>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <div style="text-align: center; font-size: 11px; color: #888; margin-top: 20px; font-style: italic;">
        Beautifully developed and maintained by <a href="https://inspiringinfosys.com" style="color: #0C831F; text-decoration: none; font-weight: bold;">Inspiring Infosys</a>
      </div>
    </div>
  `;
};