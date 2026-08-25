import { z } from 'zod';

export const qualificationSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  country: z.string().trim().min(2, 'Please tell us where you are based.').max(100),
  businessType: z.enum(['saas', 'agency', 'ecommerce', 'digital-product', 'other']),
  businessStage: z.enum(['idea', 'existing-no-us-entity', 'has-us-entity-needs-more']),
  hasUsCompany: z.enum(['yes', 'no']),
  einStatus: z.enum(['yes', 'no', 'not-sure']),
  needsBanking: z.enum(['yes', 'no']),
  needsPayments: z.enum(['yes', 'no']),
  needsWebsite: z.enum(['yes', 'no']),
  expectedMonthlyVolume: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  // Honeypot: real users never fill this in; bots often do.
  website: z.string().max(0, 'Spam check failed.').optional().or(z.literal('')),
});

export type QualificationInput = z.infer<typeof qualificationSchema>;
