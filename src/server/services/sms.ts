import { env } from '@/lib/env';

export interface SmsMessage { to: string; body: string; }

export interface SmsProvider { send(msg: SmsMessage): Promise<void>; }

class ConsoleSmsProvider implements SmsProvider {
  async send(msg: SmsMessage) {
    console.log('[SMS console]', { to: msg.to, body: msg.body });
  }
}

class ApiSmsProvider implements SmsProvider {
  async send(msg: SmsMessage) {
    if (!env.SMS_API_KEY) throw new Error('SMS_API_KEY not configured');
    const response = await fetch('https://api.smsprovider.example/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.SMS_API_KEY}`,
      },
      body: JSON.stringify({ from: env.SMS_FROM, to: msg.to, body: msg.body }),
    });
    if (!response.ok) throw new Error(`SMS provider returned ${response.status}`);
  }
}

function getProvider(): SmsProvider {
  switch (env.SMS_PROVIDER) {
    case 'api': return new ApiSmsProvider();
    default: return new ConsoleSmsProvider();
  }
}

export const smsService = {
  async send(msg: SmsMessage) {
    try {
      await getProvider().send(msg);
    } catch (err) {
      console.error('[smsService] send failed', err);
      throw err;
    }
  },
  async sendOtp(to: string, otp: string) {
    await this.send({ to, body: `Your Vitota Technologies verification code is ${otp}. Expires in 10 minutes.` });
  },
};
