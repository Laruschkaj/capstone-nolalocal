import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const emailTemplates = {
  welcome: (username: string) => ({
    subject: 'Welcome to NolaLocal! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${username}! 🎉</h2>
              <p>We're excited to have you join the NolaLocal community!</p>
              <p>NolaLocal is your go-to platform for discovering amazing events and local guides in New Orleans. Whether you're looking for live music, food festivals, or hidden gems, we've got you covered.</p>
              <p><strong>Here's what you can do:</strong></p>
              <ul style="color: #6B7280; line-height: 1.8;">
                <li>Discover upcoming events in New Orleans</li>
                <li>Create and share your own events</li>
                <li>Browse local guides from community members</li>
                <li>Save your favorite events to your calendar</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/" class="button">Explore Events</a>
              <p>If you have any questions, feel free to reach out. We're here to help!</p>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
              <p>New Orleans, Louisiana</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  verifyEmail: (username: string, verifyToken: string) => ({
    subject: 'Verify Your NolaLocal Email 📧',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email 📧</h2>
              <p>Hi ${username},</p>
              <p>Thanks for signing up! Please verify your email address to get started with NolaLocal.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}" class="button">Verify Email</a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
              <p>New Orleans, Louisiana</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordReset: (username: string, resetToken: string) => ({
    subject: 'Reset Your NolaLocal Password 🔐',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request 🔐</h2>
              <p>Hi ${username},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}" class="button">Reset Password</a>
              <p>This link will expire in 1 hour for security reasons.</p>
              <div class="warning">
                <p style="margin: 0; color: #991B1B; font-weight: 600;">⚠️ Security Notice</p>
                <p style="margin: 8px 0 0 0; color: #7F1D1D;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
              <p>New Orleans, Louisiana</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  eventSubmitted: (adminName: string, eventTitle: string, userName: string, eventId: string) => ({
    subject: '🎉 New Event Submitted for Review',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .event-box { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>New Event Awaiting Review 🎉</h2>
              <p>Hi ${adminName},</p>
              <p>A new event has been submitted and is waiting for your approval:</p>
              <div class="event-box">
                <p style="margin: 0; color: #1F2937; font-weight: 600; font-size: 18px;">${eventTitle}</p>
                <p style="margin: 8px 0 0 0; color: #6B7280;">Submitted by: ${userName}</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" class="button">Review Event</a>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  eventApproved: (username: string, eventTitle: string, eventId: string) => ({
    subject: '✅ Your Event Has Been Approved!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .success-box { background: #D1FAE5; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #10B981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>Event Approved! ✅</h2>
              <p>Hi ${username},</p>
              <p>Great news! Your event has been approved and is now live on NolaLocal:</p>
              <div class="success-box">
                <p style="margin: 0; color: #065F46; font-weight: 600; font-size: 18px;">${eventTitle}</p>
                <p style="margin: 8px 0 0 0; color: #047857;">Your event is now visible to the community!</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}" class="button">View Your Event</a>
              <p>Thank you for contributing to the NolaLocal community! 🎉</p>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  eventRejected: (username: string, eventTitle: string, reason: string) => ({
    subject: '❌ Event Submission Update',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-family: 'Bebas Neue', sans-serif; font-size: 48px; margin: 0; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1F2937; font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0 0 20px 0; }
            .content p { color: #6B7280; line-height: 1.6; margin: 0 0 15px 0; }
            .error-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOLALOCAL</h1>
            </div>
            <div class="content">
              <h2>Event Update ❌</h2>
              <p>Hi ${username},</p>
              <p>Thank you for submitting your event. Unfortunately, we couldn't approve it at this time:</p>
              <div class="error-box">
                <p style="margin: 0; color: #7F1D1D; font-weight: 600; font-size: 18px;">${eventTitle}</p>
                <p style="margin: 12px 0 0 0; color: #991B1B;"><strong>Reason:</strong> ${reason}</p>
              </div>
              <p>You're welcome to make changes and submit again.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/create" class="button">Create New Event</a>
            </div>
            <div class="footer">
              <p>© 2025 NolaLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Type-safe send functions
export async function sendWelcomeEmail(to: string, username: string) {
  const { subject, html } = emailTemplates.welcome(username);
  return sendEmailHelper(to, subject, html);
}

export async function sendVerifyEmail(to: string, username: string, verifyToken: string) {
  const { subject, html } = emailTemplates.verifyEmail(username, verifyToken);
  return sendEmailHelper(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, username: string, resetToken: string) {
  const { subject, html } = emailTemplates.passwordReset(username, resetToken);
  return sendEmailHelper(to, subject, html);
}

export async function sendEventSubmittedEmail(to: string, adminName: string, eventTitle: string, userName: string, eventId: string) {
  const { subject, html } = emailTemplates.eventSubmitted(adminName, eventTitle, userName, eventId);
  return sendEmailHelper(to, subject, html);
}

export async function sendEventApprovedEmail(to: string, username: string, eventTitle: string, eventId: string) {
  const { subject, html } = emailTemplates.eventApproved(username, eventTitle, eventId);
  return sendEmailHelper(to, subject, html);
}

export async function sendEventRejectedEmail(to: string, username: string, eventTitle: string, reason: string) {
  const { subject, html } = emailTemplates.eventRejected(username, eventTitle, reason);
  return sendEmailHelper(to, subject, html);
}

// Helper function
async function sendEmailHelper(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"NolaLocal" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent: ${subject} to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}