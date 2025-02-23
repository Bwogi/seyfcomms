interface EmailTemplateProps {
  url: string;
  appName?: string;
}

export const emailTemplates = {
  resetPassword: ({ url, appName = 'SeyfComms' }: EmailTemplateProps) => ({
    subject: `Reset your ${appName} password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          You recently requested to reset your password for your ${appName} account. Click the button below to reset it.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
            Reset Password
          </a>
        </div>
        <p style="color: #4a4a4a; font-size: 14px;">
          If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        <p style="color: #4a4a4a; font-size: 14px;">
          This password reset link is only valid for the next hour.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email from ${appName}. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  verifyEmail: ({ url, appName = 'SeyfComms' }: EmailTemplateProps) => ({
    subject: `Verify your ${appName} email address`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">Verify Your Email</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          Thank you for registering with ${appName}. To complete your registration and verify your email address, 
          please click the button below.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
            Verify Email
          </a>
        </div>
        <p style="color: #4a4a4a; font-size: 14px;">
          If you did not create an account with ${appName}, please ignore this email.
        </p>
        <p style="color: #4a4a4a; font-size: 14px;">
          This verification link is only valid for the next 24 hours.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email from ${appName}. Please do not reply to this email.
        </p>
      </div>
    `
  })
}
