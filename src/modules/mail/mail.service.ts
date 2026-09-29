import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type MailMessage = {
  to: string;
  from: { email: string; name: string };
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private enabled = false;
  private apiKey = '';
  private from: { email: string; name: string };
  private replyTo?: string;
  private appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('BREVO_API_KEY') || '';
    this.enabled = !!this.apiKey;
    this.from = {
      email: this.config.get<string>('MAIL_FROM_EMAIL') || 'noreply@notify.spinproject.ng',
      name: this.config.get<string>('MAIL_FROM_NAME') || 'SPIN GRM',
    };
    this.replyTo = this.config.get<string>('MAIL_REPLY_TO') || undefined;
    this.appUrl = this.config.get<string>('APP_URL') || '';
    if (!this.enabled) this.logger.warn('BREVO_API_KEY not set — emails are disabled');
  }

  private async send(msg: MailMessage): Promise<void> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: msg.from,
        to: [{ email: msg.to }],
        ...(this.replyTo ? { replyTo: { email: this.replyTo } } : {}),
        subject: msg.subject,
        textContent: msg.text,
        htmlContent: msg.html,
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  }

  async sendUserInvite(to: string, name: string, tempPassword: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Email not configured — skipped invite to ${to}`);
      return;
    }
    try {
      await this.send({
        to,
        from: this.from,
        subject: 'Your SPIN Grievance Management System account',
        text: this.inviteText(name, to, tempPassword),
        html: this.inviteHtml(name, to, tempPassword),
      });
      this.logger.log(`Invite sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`Invite to ${to} failed: ${err?.message}`);
    }
  }

  async sendCaseAssigned(to: string, name: string, c: any): Promise<void> {
    if (!this.enabled) return;
    const link = this.appUrl ? `${this.appUrl}/#/cases/${c.id}` : '';
    try {
      await this.send({
        to,
        from: this.from,
        subject: `New grievance assigned to you — ${c.code}`,
        text: [
          `Hello ${name},`,
          ``,
          `A grievance has been assigned to you on the SPIN Grievance Management System.`,
          ``,
          `Reference: ${c.code}`,
          `Category: ${c.category}`,
          `Location: ${c.lga ? c.lga + ', ' : ''}${c.state}`,
          `Priority: ${c.priority}`,
          ``,
          link ? `Open the case: ${link}` : '',
          ``,
          `SPIN Project — Grievance Management`,
        ].join('\n'),
        html: this.caseAssignedHtml(name, c, link),
      });
      this.logger.log(`Assignment email sent to ${to} (${c.code})`);
    } catch (err: any) {
      this.logger.error(`Assignment email to ${to} failed: ${err?.message}`);
    }
  }

  async sendOtp(to: string, name: string, code: string, purposeLabel: string, ttlMinutes: number): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Email not configured — OTP for ${to} not sent`);
      return;
    }
    try {
      await this.send({
        to,
        from: this.from,
        subject: `Your access code: ${code}`,
        text: [
          `Hello ${name},`,
          ``,
          `Your one-time access code for ${purposeLabel} is:`,
          ``,
          `    ${code}`,
          ``,
          `It expires in ${ttlMinutes} minutes and can be used once.`,
          `By entering it you confirm you are personally accountable for the information you are about to view.`,
          ``,
          `If you did not request this, contact your administrator immediately.`,
          ``,
          `SPIN Project — Grievance Management`,
        ].join('\n'),
        html: this.otpHtml(name, code, purposeLabel, ttlMinutes),
      });
      this.logger.log(`OTP sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`OTP to ${to} failed: ${err?.message}`);
    }
  }

  private otpHtml(name: string, code: string, purposeLabel: string, ttlMinutes: number): string {
    const green = '#0c3b2a';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <tr><td style="background:${green};padding:18px 28px;color:#fff;font-size:15px;font-weight:700;">SPIN Grievance Management System</td></tr>
      <tr><td style="padding:26px 28px 6px;">
        <p style="margin:0 0 6px;color:#0f172a;font-size:15px;">Hello ${name},</p>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Use this one-time code to open <strong>${purposeLabel}</strong>.</p>
        <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 0;">
          <div style="font-size:30px;font-weight:800;letter-spacing:8px;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${code}</div>
        </div>
        <p style="margin:14px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">Expires in ${ttlMinutes} minutes · single use. By entering it you confirm you are personally accountable for the information you view. If you did not request this, contact your administrator.</p>
      </td></tr>
      <tr><td style="padding:14px 28px 22px;color:#94a3b8;font-size:11px;border-top:1px solid #eef2f6;">SPIN Project &middot; Grievance Management</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  }

  private caseAssignedHtml(name: string, c: any, link: string): string {
    const green = '#0c3b2a';
    const accent = '#047857';
    const prTone = c.priority === 'high' ? '#b91c1c' : c.priority === 'medium' ? '#b45309' : '#475569';
    const row = (k: string, v: string) =>
      `<tr><td style="padding:9px 16px;border-bottom:1px solid #eef2f6;color:#64748b;font-size:12px;width:34%;">${k}</td>
        <td style="padding:9px 16px;border-bottom:1px solid #eef2f6;color:#0f172a;font-size:13px;font-weight:600;">${v}</td></tr>`;
    const btn = link
      ? `<tr><td style="padding:18px 0 2px;"><a href="${link}" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:6px;">Open the case</a></td></tr>`
      : '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <tr><td style="background:${green};padding:18px 28px;color:#fff;font-size:15px;font-weight:700;">SPIN Grievance Management System</td></tr>
      <tr><td style="padding:26px 28px 8px;">
        <p style="margin:0 0 6px;color:#0f172a;font-size:15px;">Hello ${name},</p>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">A grievance has been assigned to you. The details are below.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
          ${row('Reference', c.code)}
          ${row('Category', c.category)}
          ${row('Location', `${c.lga ? c.lga + ', ' : ''}${c.state}`)}
          <tr><td style="padding:9px 16px;color:#64748b;font-size:12px;">Priority</td>
            <td style="padding:9px 16px;color:${prTone};font-size:13px;font-weight:700;text-transform:capitalize;">${c.priority}</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0">${btn}</table>
      </td></tr>
      <tr><td style="padding:14px 28px 22px;color:#94a3b8;font-size:11px;border-top:1px solid #eef2f6;">SPIN Project &middot; Grievance Management</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  }

  private inviteText(name: string, email: string, password: string): string {
    return [
      `Hello ${name},`,
      ``,
      `An account has been created for you on the SPIN Grievance Management System.`,
      ``,
      `Email: ${email}`,
      `Temporary password: ${password}`,
      ``,
      this.appUrl ? `Sign in: ${this.appUrl}` : '',
      ``,
      `For your security, please change your password after signing in.`,
      ``,
      `SPIN Project — Grievance Management`,
    ]
      .filter((l) => l !== undefined)
      .join('\n');
  }

  private inviteHtml(name: string, email: string, password: string): string {
    const green = '#0c3b2a';
    const accent = '#047857';
    const signInBtn = this.appUrl
      ? `<tr><td style="padding:8px 0 4px;">
           <a href="${this.appUrl}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:6px;">Sign in</a>
         </td></tr>`
      : '';
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:${green};padding:20px 28px;">
          <div style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:.2px;">SPIN Grievance Management System</div>
          <div style="color:#a7f3d0;font-size:11px;margin-top:2px;">Sustainable Power & Irrigation for Nigeria</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 14px;color:#0f172a;font-size:15px;">Hello ${name},</p>
          <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
            An account has been created for you on the SPIN Grievance Management System. Use the credentials below to sign in.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <tr><td style="padding:14px 16px;border-bottom:1px solid #eef2f6;">
              <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.4px;">Email</div>
              <div style="color:#0f172a;font-size:14px;font-weight:600;margin-top:3px;">${email}</div>
            </td></tr>
            <tr><td style="padding:14px 16px;">
              <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.4px;">Temporary password</div>
              <div style="color:#0f172a;font-size:14px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:3px;">${password}</div>
            </td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">${signInBtn}</table>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
            For your security, please change your password after signing in. If you weren&rsquo;t expecting this, contact your administrator.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #eef2f6;color:#94a3b8;font-size:11px;">
          SPIN Project &middot; Grievance Management
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  }
}
