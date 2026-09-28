import { Resend } from 'resend';
import { env } from '@/lib/env';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(msg: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(msg: EmailMessage) {
    console.log('[EMAIL console]', {
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
  }
}

class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    if (!env.EMAIL_API_KEY) {
      throw new Error('EMAIL_API_KEY not configured');
    }

    this.client = new Resend(env.EMAIL_API_KEY);
  }

  async send(msg: EmailMessage) {
    const { data, error } = await this.client.emails.send({
      from: 'Vitota Technologies <onboarding@resend.dev>',
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      ...(msg.text ? { text: msg.text } : {}),
    });

    if (error) {
      console.error('[Resend] send failed:', error);
      throw new Error(error.message);
    }

    console.log('[Resend] Email sent:', data?.id);
  }
}

function getProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case 'api':
      return new ResendEmailProvider();

    default:
      return new ConsoleEmailProvider();
  }
}

export const emailService = {
  async send(msg: EmailMessage) {
    try {
      await getProvider().send(msg);
    } catch (err) {
      console.error('[emailService] send failed', err);
      throw err;
    }
  },

  async sendVerificationEmail(to: string, otp: string) {
    await this.send({
      to,
      subject: 'Verify your Vitota Technologies email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Vitota Technologies</h2>
          <p>Your email verification code is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 24px 0;
          ">
            ${otp}
          </div>

          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
      text: `Your Vitota Technologies email verification code is ${otp}. It expires in 10 minutes.`,
    });
  },

  async sendPasswordResetEmail(to: string, otp: string) {
    await this.send({
      to,
      subject: 'Reset your Vitota Technologies password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Vitota Technologies</h2>
          <p>Your password reset code is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 24px 0;
          ">
            ${otp}
          </div>

          <p>This code expires in 10 minutes.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
      text: `Your Vitota Technologies password reset code is ${otp}. It expires in 10 minutes.`,
    });
  },

  async sendNotificationEmail(to: string, title: string, message: string) {
    await this.send({
      to,
      subject: title,
      html: `<p>${message}</p>`,
      text: message,
    });
  },
};