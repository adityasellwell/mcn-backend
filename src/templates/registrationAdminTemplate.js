export const registrationAdminTemplate = (
  application
) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>New Registration Application</h2>

      <p><strong>Name:</strong> ${application.fullName}</p>

      <p><strong>Type:</strong> ${application.registrationType}</p>

      <p><strong>Email:</strong> ${application.email}</p>

      <p><strong>Mobile:</strong> ${application.mobile}</p>

      <p><strong>Company:</strong> ${application.companyName}</p>

      <p><strong>Business Category:</strong> ${application.businessCategory}</p>

      <p><strong>Venue:</strong> ${application.venue}</p>
    </div>
  `;
};