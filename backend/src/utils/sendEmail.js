import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Kala Bazaar" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email - Kala Bazaar',
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password - Kala Bazaar',
    html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 10 minutes.</p>`,
  });
};

export const sendSellerApprovalEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Congratulations! You are now a verified artisan - Kala Bazaar',
    html: `<p>Dear ${name},</p><p>Your seller account has been approved. You can now start listing products.</p>`,
  });
};

export const sendOrderConfirmationEmail = async (email, order) => {
  await sendEmail({
    to: email,
    subject: `Order confirmed #${order._id} - Kala Bazaar`,
    html: `<p>Your order has been confirmed.</p><p>Total: Rs. ${order.total}</p>`,
  });
};
