import { z } from 'zod';

const vatMax = 1;

export const invoiceSettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  seller_name: z.string().min(1),
  vat_number: z.string().min(1),
  cr_number: z.string().min(1).nullable(),
  address_line1: z.string().min(1).nullable(),
  city: z.string().min(1).nullable(),
  logo_url: z.string().url().nullable(),
  iban: z.string().min(1).nullable(),
  invoice_footer: z.string().min(1).nullable(),
  default_vat_rate: z.coerce.number().min(0).max(vatMax),
  currency: z.literal('SAR'),
  timezone: z.string().min(1),
  numbering_prefix: z.string().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export const invoiceSettingsInputSchema = z
  .object({
    seller_name: z.string().min(1),
    vat_number: z.string().min(1),
    cr_number: z.string().min(1).optional().nullable(),
    address_line1: z.string().min(1).optional().nullable(),
    city: z.string().min(1).optional().nullable(),
    logo_url: z.string().url().optional().nullable(),
    iban: z.string().min(1).optional().nullable(),
    invoice_footer: z.string().min(1).optional().nullable(),
    default_vat_rate: z.coerce.number().min(0).max(vatMax).default(0.15),
    currency: z.literal('SAR').default('SAR'),
    timezone: z.string().min(1).default('Asia/Riyadh'),
    numbering_prefix: z.string().min(1).default('BLF-'),
  })
  .strict();

export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>;
export type InvoiceSettingsInput = z.infer<typeof invoiceSettingsInputSchema>;

