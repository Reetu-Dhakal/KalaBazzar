import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[Email skipped — no SMTP credentials] To: ${options.to}, Subject: ${options.subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Kala Bazaar <noreply@kalabazaar.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  private getTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      const templatePath = join(__dirname, '..', 'templates', `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf-8');
      
      for (const [key, value] of Object.entries(variables)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      
      return template;
    } catch {
      return this.getDefaultTemplate(templateName, variables);
    }
  }

  private getDefaultTemplate(name: string, vars: Record<string, string>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1917; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #FAFAF9; border-radius: 16px; padding: 40px; border: 1px solid #E7E5E4;">
            <h1 style="color: #7C2D12; margin-bottom: 24px; font-family: 'Cormorant Garamond', Georgia, serif;">${vars.title || 'Kala Bazaar'}</h1>
            <p style="color: #1C1917; margin-bottom: 16px;">${vars.message || ''}</p>
            ${vars.ctaUrl ? `<a href="${vars.ctaUrl}" style="display: inline-block; background: #7C2D12; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">${vars.ctaText || 'Click Here'}</a>` : ''}
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;">
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Kala Bazaar Nepal',
      html: this.getTemplate('welcome', { firstName, title: 'Welcome to Kala Bazaar' }),
    });
  }

  async sendEmailVerification(to: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await this.sendEmail({
      to,
      subject: 'Verify your email address',
      html: this.getTemplate('verify-email', {
        firstName,
        title: 'Verify Your Email',
        message: 'Please click the button below to verify your email address.',
        ctaUrl: verificationUrl,
        ctaText: 'Verify Email',
      }),
    });
  }

  async sendPasswordResetEmail(to: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await this.sendEmail({
      to,
      subject: 'Reset your password',
      html: this.getTemplate('reset-password', {
        firstName,
        title: 'Reset Your Password',
        message: 'Click the button below to reset your password. This link expires in 1 hour.',
        ctaUrl: resetUrl,
        ctaText: 'Reset Password',
      }),
    });
  }

  async sendOrderConfirmation(to: string, orderNumber: string, firstName: string, total: number): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order Confirmed - ${orderNumber}`,
      html: this.getTemplate('order-confirmation', {
        firstName,
        title: 'Order Confirmed',
        message: `Thank you for your order! Your order number is <strong>${orderNumber}</strong>. Total: NPR ${total.toLocaleString()}`,
        ctaUrl: `${process.env.CLIENT_URL}/orders/${orderNumber}`,
        ctaText: 'View Order',
      }),
    });
  }

  async sendOrderStatusUpdate(to: string, orderNumber: string, status: string, firstName: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is being processed.',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.',
    };
    
    await this.sendEmail({
      to,
      subject: `Order Update - ${orderNumber}`,
      html: this.getTemplate('order-status', {
        firstName,
        title: 'Order Status Update',
        message: `Your order <strong>${orderNumber}</strong> is now <strong>${status}</strong>. ${statusMessages[status] || ''}`,
        ctaUrl: `${process.env.CLIENT_URL}/orders/${orderNumber}`,
        ctaText: 'Track Order',
      }),
    });
  }

  async sendSellerApplicationReceived(to: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Seller Application Received',
      html: this.getTemplate('seller-application', {
        firstName,
        title: 'Application Received',
        message: 'We\'ve received your seller application. Our team will review it within 3-5 business days.',
        ctaUrl: `${process.env.CLIENT_URL}/seller/dashboard`,
        ctaText: 'View Dashboard',
      }),
    });
  }

  async sendSellerApprovalEmail(to: string, firstName: string, status: 'approved' | 'rejected' | 'needs_more_info', reason?: string): Promise<void> {
    const messages = {
      approved: 'Congratulations! Your seller application has been approved. You can now start adding products.',
      rejected: `Unfortunately, your application was not approved. Reason: ${reason || 'Not specified'}`,
      needs_more_info: `We need more information to process your application. ${reason || ''}`,
    };

    await this.sendEmail({
      to,
      subject: `Seller Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: this.getTemplate('seller-decision', {
        firstName,
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: messages[status],
        ctaUrl: `${process.env.CLIENT_URL}/seller/dashboard`,
        ctaText: 'View Dashboard',
      }),
    });
  }

  async sendLowStockAlert(to: string, productName: string, quantity: number, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Low Stock Alert: ${productName}`,
      html: this.getTemplate('low-stock', {
        firstName,
        title: 'Low Stock Alert',
        message: `Product <strong>${productName}</strong> has only <strong>${quantity}</strong> items left in stock.`,
        ctaUrl: `${process.env.CLIENT_URL}/seller/products`,
        ctaText: 'Manage Inventory',
      }),
    });
  }

  async sendNewReviewNotification(to: string, productName: string, rating: number, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `New Review for ${productName}`,
      html: this.getTemplate('new-review', {
        firstName,
        title: 'New Review Received',
        message: `You received a ${rating}-star review for <strong>${productName}</strong>.`,
        ctaUrl: `${process.env.CLIENT_URL}/seller/reviews`,
        ctaText: 'View Reviews',
      }),
    });
  }
}

export const emailService = new EmailService();