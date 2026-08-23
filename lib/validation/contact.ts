import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please tell us a bit more (at least 10 characters).').max(4000),
  // Honeypot: real users never fill this in; bots often do.
  website: z.string().max(0, 'Spam check failed.').optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
