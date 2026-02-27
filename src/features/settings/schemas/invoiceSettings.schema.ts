import { z } from 'zod';

const vatMax = 1;

export const invoiceSettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().catch(''),
  tax_number: z.string().catch(''),
  address_line1: z.string().nullable().catch(null),
  city: z.string().nullable().catch(null),
  logo_url: z.string().url().nullable(),
  iban: z.union([
    z.string().regex(/^SA[A-Z0-9]{22}$/, 'آيبان غير صالح'),
    z.literal(''),
    z.null()
  ]).transform(v => v === '' ? null : v).optional().catch(null),
  iban_2: z.union([
    z.string().regex(/^SA[A-Z0-9]{22}$/, 'آيبان غير صالح'),
    z.literal(''),
    z.null()
  ]).transform(v => v === '' ? null : v).optional().catch(null),
  iban_3: z.union([
    z.string().regex(/^SA[A-Z0-9]{22}$/, 'آيبان غير صالح'),
    z.literal(''),
    z.null()
  ]).transform(v => v === '' ? null : v).optional().catch(null),
  bank_name: z.string().nullable().optional(),
  bank_name_2: z.string().nullable().optional(),
  bank_name_3: z.string().nullable().optional(),
  invoice_footer: z.string().min(1).nullable(),
  default_vat_rate: z.coerce.number().min(0).max(vatMax),
  currency: z.literal('SAR'),
  timezone: z.string().min(1),
  numbering_prefix: z.string().min(1),
  email: z.string().catch(''),
  phone: z.string().catch(''),
  created_at: z.string(),
  updated_at: z.string(),
});

export const invoiceSettingsInputSchema = z
  .object({
    name: z.string().catch(''),
    tax_number: z.string().catch(''),
    address_line1: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    logo_url: z.string().url().optional().nullable(),
    iban: z.union([
      z.string().regex(/^SA[A-Z0-9]{22}$/, 'يجب أن يبدأ الآيبان بـ SA ويتكون من 24 خانة'),
      z.literal(''),
      z.null()
    ]).transform(v => v === '' ? null : v).optional(),
    iban_2: z.union([
      z.string().regex(/^SA[A-Z0-9]{22}$/, 'يجب أن يبدأ الآيبان بـ SA ويتكون من 24 خانة'),
      z.literal(''),
      z.null()
    ]).transform(v => v === '' ? null : v).optional(),
    iban_3: z.union([
      z.string().regex(/^SA[A-Z0-9]{22}$/, 'يجب أن يبدأ الآيبان بـ SA ويتكون من 24 خانة'),
      z.literal(''),
      z.null()
    ]).transform(v => v === '' ? null : v).optional(),
    bank_name: z.string().nullable().optional(),
    bank_name_2: z.string().nullable().optional(),
    bank_name_3: z.string().nullable().optional(),
    invoice_footer: z.string().min(1).optional().nullable(),
    default_vat_rate: z.coerce.number().min(0).max(vatMax).catch(0.15),
    currency: z.literal('SAR').default('SAR'),
    timezone: z.string().min(1).default('Asia/Riyadh'),
    numbering_prefix: z.string().min(1).default('BLF-'),
    email: z.string().email().optional().or(z.literal('')).catch(''),
    phone: z.string().optional().nullable().catch(''),
  })
  .strict();

export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>;
export type InvoiceSettingsInput = z.infer<typeof invoiceSettingsInputSchema>;

