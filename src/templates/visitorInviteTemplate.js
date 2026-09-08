/**
 * Branded HTML email template sent to an invited visitor.
 * @param {string} inviterName  — full name of the MCN member who sent the invite
 * @param {string} visitorName  — first name of the invited visitor
 * @returns {string} HTML string
 */
export const visitorInviteTemplate = (inviterName, visitorName) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0C831F;padding:28px 32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:0.5px;">Muslim Community Network</h1>
              <p style="color:#d4f5d4;margin:6px 0 0;font-size:13px;">MCN — Building Business Together</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="font-size:16px;color:#333333;margin:0 0 16px;">
                Dear <strong>${visitorName}</strong>,
              </p>
              <p style="font-size:15px;color:#555555;line-height:1.7;margin:0 0 20px;">
                You have been personally invited to join
                <strong style="color:#0C831F;">Muslim Community Network (MCN)</strong>
                by <strong>${inviterName}</strong>, a valued member of our community.
              </p>
              <p style="font-size:15px;color:#555555;line-height:1.7;margin:0 0 28px;">
                MCN is a professional networking community of Muslim business owners and
                professionals who believe in growing together through trust, collaboration,
                and referrals.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="background:#0C831F;border-radius:8px;">
                    <a href="https://mcnmumbai.com/register?type=VISITOR"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:0.3px;">
                      Register as a Visitor →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#888888;text-align:center;margin:0 0 8px;">
                Or copy this link into your browser:
              </p>
              <p style="font-size:13px;color:#0C831F;text-align:center;word-break:break-all;margin:0 0 28px;">
                https://mcnmumbai.com/register?type=VISITOR
              </p>

              <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px;" />

              <p style="font-size:13px;color:#aaaaaa;text-align:center;margin:0;">
                If you have any questions, reply to this email or reach out to us at
                <a href="mailto:support@mcnmumbai.com" style="color:#0C831F;text-decoration:none;">support@mcnmumbai.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:18px 32px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="font-size:11px;color:#bbbbbb;margin:0;">
                © ${new Date().getFullYear()} Muslim Community Network · Mumbai
              </p>
              <p style="font-size:10px;color:#cccccc;margin:6px 0 0;font-style:italic;">
                Developed by <a href="https://inspiringinfosys.com" style="color:#0C831F;text-decoration:none;">Inspiring Infosys</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
