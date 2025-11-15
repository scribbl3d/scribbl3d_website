import sgMail from "@sendgrid/mail";

// Set up SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
  throw new Error("SENDGRID_API_KEY is not set in the environment variables");
}
sgMail.setApiKey(sendGridApiKey);

// Default sender email - must be verified in SendGrid
const DEFAULT_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || "noreply@scribbl3d.com";

export interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams) {
  const { to, from = DEFAULT_FROM_EMAIL, subject, text, html } = params;

  if (!from) {
    throw new Error("From email address is required");
  }

  const msg = {
    to,
    from,
    subject,
    text: text || "",
    html: html || text || "",
  };

  try {
    console.log("Attempting to send email via SendGrid:", {
      to,
      from,
      subject,
    });

    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`, response[0].statusCode);
    return response;
  } catch (error: any) {
    console.error("SendGrid Error:", {
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });

    // If we get a 403 Forbidden error, it's likely a sender verification issue
    if (error.code === 403) {
      throw new Error(
        "Email sending failed: Sender email not verified in SendGrid. Please verify your sender email address."
      );
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendGoogleUserNotification(to: string): Promise<void> {
  const subject = "Account Information - Google Sign-In";
  const text = `You've requested a password reset, but your account uses Google Sign-In. Please use the "Sign in with Google" option on the login page to access your account.`;
  const html = `
    <p>You've requested a password reset, but your account uses Google Sign-In.</p>
    <p>Please use the "Sign in with Google" option on the login page to access your account.</p>
  `;

  try {
    await sendEmail({ to, subject, text, html });
    console.log("Google user notification sent successfully");
  } catch (error) {
    console.error("Error sending Google user notification:", error);
    throw new Error("Failed to send Google user notification");
  }
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    throw new Error(
      "APP_URL or NEXTAUTH_URL is not set in the environment variables"
    );
  }

  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const subject = "Reset Your Password";
  const text = `Click the following link to reset your password: ${resetUrl}`;
  const html = `
    <p>Click the following link to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  try {
    await sendEmail({ to, subject, text, html });
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendOrderConfirmationEmail(order: any) {
  const subject = `Order Confirmed - #${order.id}`;
  const html = `
    <h1>Thank you for your order!</h1>
    <p>Your order #${order.id} has been confirmed and is being processed.</p>
    <h2>Order Details:</h2>
    <ul>
      ${order.items
        .map(
          (item: any) => `
        <li>${item.quantity}x ${item.product.name} - ₹${item.price}</li>
      `
        )
        .join("")}
    </ul>
    <p>Total Amount: ₹${order.totalAmount}</p>
    <p>We'll send you another email when your order ships.</p>
  `;

  try {
    await sendEmail({
      to: order.user.email,
      subject,
      html,
    });
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw new Error("Failed to send order confirmation email");
  }
}
