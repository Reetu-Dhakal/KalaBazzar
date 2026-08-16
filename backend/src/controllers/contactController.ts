import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { emailService } from '../services/emailService';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json(ApiResponse.error('Name, email and message are required', 400));
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json(ApiResponse.error('A valid email is required', 400));
    return;
  }

  emailService
    .sendContactFormNotification({ name, email, subject: subject || '', message })
    .catch(err => console.error('Failed to send contact notification email:', err));

  res.json(ApiResponse.success(null, 'Message sent successfully'));
});