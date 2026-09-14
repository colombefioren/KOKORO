/**
 * Email verification utility.
 *
 * To enable email sending in production, add these env vars:
 *   RESEND_API_KEY=re_your_resend_api_key
 *   EMAIL_FROM=noreply@yourdomain.com
 *
 * In development, verification emails are logged to the console.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Kokoro <noreply@kokoro.app>";
const APP_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function sendEmailVerification(
  email: string,
  token: string,
  name?: string,
  url?: string
): Promise<boolean> {
  const verifyUrl = url || `${APP_URL}/api/auth/verify-email?token=${token}`;

  // In development, log the verification link instead of sending email
  if (process.env.NODE_ENV !== "production" || !RESEND_API_KEY) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 EMAIL VERIFICATION (dev mode)");
    console.log(`To: ${email}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return true;
  }

  // Production: send via Resend
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: "Verify your KOKORO account",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070b24; color: #fff; padding: 40px 20px; }
              .container { max-width: 480px; margin: 0 auto; text-align: center; }
              .logo { font-size: 28px; font-weight: bold; color: #287eae; margin-bottom: 24px; }
              .btn { display: inline-block; padding: 14px 32px; background: #287eae; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 24px 0; }
              .btn:hover { background: #1d6a96; }
              .text { color: #8ba3c7; font-size: 14px; line-height: 1.6; margin: 16px 0; }
              .footer { color: #674846; font-size: 12px; margin-top: 40px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">KOKORO</div>
              <h1 style="font-size: 22px; margin-bottom: 8px;">Verify your email</h1>
              <p class="text">
                ${name ? `Hi ${name},` : "Hi there,"}
                <br/>
                Thanks for signing up for KOKORO. Click the button below to verify your email address.
              </p>
              <a href="${verifyUrl}" class="btn">Verify Email</a>
              <p class="text">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p class="footer">
                This verification link expires in 24 hours.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      console.error("[Email] Failed to send verification:", await response.text());
      return false;
    }

    console.log(`[Email] Verification sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[Email] Error sending verification:", err);
    return false;
  }
}
