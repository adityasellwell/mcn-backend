// ─── Sends mail via Hostinger's Mail API (token-based REST API) from a real
// mcnmumbai.com mailbox, instead of the old SMTP relay from an unrelated
// domain (arogyagramin.com) that Gmail was rejecting outright. Every
// existing caller uses the same sendEmail({to, subject, html}) signature,
// so nothing else in the codebase needs to change. ───

const MAIL_API_BASE = "https://api.mail.hostinger.com";

// ─── Very small HTML→text fallback for the required `text` field — good
// enough for a fallback, not meant to be a full HTML parser. ───
const stripHtml = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sendEmail = async ({ to, subject, html, text }) => {
  const token = process.env.MAIL_API_TOKEN;
  const mailboxId = process.env.MAIL_API_MAILBOX_ID;

  if (!token || !mailboxId) {
    throw new Error(
      "MAIL_API_TOKEN / MAIL_API_MAILBOX_ID are not configured"
    );
  }

  const toList = Array.isArray(to) ? to : [to];

  const res = await fetch(
    `${MAIL_API_BASE}/api/v1/mailboxes/${mailboxId}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: toList,
        displayName: "MCN - Muslim Community Network",
        subject,
        html,
        text: text || stripHtml(html || ""),
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Mail API send failed (${res.status} ${res.statusText}): ${body}`
    );
  }

  return { success: true, status: res.status };
};
