import nodemailer from 'nodemailer';

// Use SendGrid if we have the API key
const useSendGrid = !!process.env.SENDGRID_API_KEY;

// Create transporter based on configuration
const transporter = nodemailer.createTransport(
  useSendGrid
    ? {
        // Production: SendGrid
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      }
    : {
        // Development: Mailtrap
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '2525'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
);

// Determine production URLs
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://nolalocal.vercel.app' : 'http://localhost:3000';

// Send welcome email
export async function sendWelcomeEmail(to: string, username: string) {
  const fromEmail = useSendGrid
    ? process.env.SENDGRID_FROM_EMAIL || 'hello.nolalocal@gmail.com'
    : process.env.SMTP_FROM_EMAIL || 'NolaLocal <notifications@nolalocal.com>';

  const mailOptions = {
    from: fromEmail,
    to,
    subject: 'Welcome to NolaLocal!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 48px;
            margin: 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #333333;
            font-size: 28px;
            margin-bottom: 20px;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background-color: #667eea;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NOLALOCAL</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${username}! 🎉</h2>
            <p>Thanks for joining NolaLocal - your go-to platform for discovering amazing events and local guides in New Orleans!</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Discover upcoming events in New Orleans</li>
              <li>Explore local guides from insiders</li>
              <li>Save your favorite events</li>
              <li>Create and share your own events</li>
            </ul>
            <a href="${baseUrl}/events" class="button">Explore Events</a>
          </div>
          <div class="footer">
            <p>NolaLocal - Discover New Orleans Like a Local</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send verification email
export async function sendVerifyEmail(to: string, username: string, token: string) {
  const fromEmail = useSendGrid
    ? process.env.SENDGRID_FROM_EMAIL || 'hello.nolalocal@gmail.com'
    : process.env.SMTP_FROM_EMAIL || 'NolaLocal <notifications@nolalocal.com>';

  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: fromEmail,
    to,
    subject: 'Verify Your NolaLocal Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 48px;
            margin: 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h2 {
            color: #333333;
            font-size: 28px;
            margin-bottom: 20px;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background-color: #667eea;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NOLALOCAL</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hi ${username}!</p>
            <p>Thanks for signing up! Click the button below to verify your email and start exploring New Orleans:</p>
            <a href="${verifyUrl}" class="button">Verify Email</a>
            <p style="font-size: 14px; color: #999999; margin-top: 30px;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>NolaLocal - Discover New Orleans Like a Local</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, username: string, token: string) {
  const fromEmail = useSendGrid
    ? process.env.SENDGRID_FROM_EMAIL || 'hello.nolalocal@gmail.com'
    : process.env.SMTP_FROM_EMAIL || 'NolaLocal <notifications@nolalocal.com>';

  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: fromEmail,
    to,
    subject: 'Reset Your NolaLocal Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 48px;
            margin: 0;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content h2 {
            color: #333333;
            font-size: 28px;
            margin-bottom: 20px;
          }
          .content p {
            color: #666666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background-color: #667eea;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999999;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NOLALOCAL</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi ${username}!</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="font-size: 14px; color: #999999; margin-top: 30px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>NolaLocal - Discover New Orleans Like a Local</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}