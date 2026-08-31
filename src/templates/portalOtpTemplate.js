export const portalOtpTemplate = (name, code) => {
  return `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">

  <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">MCN - Muslim Community Network</h1>
    <p style="color: #d4f5d4; margin: 6px 0 0;">Portal Login Code</p>
  </div>

  <p>Hello <strong>${name || "there"}</strong>,</p>
  <p>Use the code below to log in to your MCN member portal. This code is valid for 10 minutes.</p>

  <div style="text-align: center; margin: 32px 0;">
    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0C831F; background: #f0fdf4; border: 1px solid #d4f5d4; border-radius: 8px; padding: 16px 24px;">
      ${code}
    </span>
  </div>

  <p style="font-size: 13px; color: #666;">If you didn't request this code, you can safely ignore this email — no one can access your account without it.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <p>Regards,<br/><strong>Muslim Community Network Team</strong></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #888; margin-top: 20px; font-style: italic;">
    Beautifully developed and maintained by <a href="https://inspiringinfosys.com" style="color: #0C831F; text-decoration: none; font-weight: bold;">Inspiring Infosys</a>
  </div>

</div>
`;
};
