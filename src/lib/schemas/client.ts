import { z } from "zod";

// ── ZATCA Tax Number Validation ─────────────────────────────────────────────
export const ZATCA_TAX_NUMBER_REGEX = /^3\d{13}3$/;

// ── Shared Client Schemas ───────────────────────────────────────────────────

export const addressSchema = z.object({
    country: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    district: z.string().optional().or(z.literal("")),
    street: z.string().optional().or(z.literal("")),
    building_no: z.string().optional().or(z.literal("")),
    postal_code: z.string().optional().or(z.literal("")),
});

// Base schema for common fields
const baseClientSchema = z.object({
    name: z.string().min(2, "الاسم قصير جداً"),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
});

// Individual Client Schema
export const individualClientSchema = baseClientSchema.extend({
    client_type: z.literal("individual"),
    // Individual can have tax number but it's optional usually, but sticking to request requirement:
    // Request says: If Individual -> Hide Tax Number. So we make it optional/nullable.
    tax_number: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")), // Simplified address for inline form or optional
});

// Organization Client Schema
export const organizationClientSchema = baseClientSchema.extend({
    client_type: z.literal("organization"),
    tax_number: z
        .string()
        .refine(
            (val) => ZATCA_TAX_NUMBER_REGEX.test(val),
            "الرقم الضريبي غير صحيح (يجب أن يتكون من 15 رقم ويبدأ وينتهي بـ 3)"
        ),
    address: z.string().min(5, "العنوان الوطني مطلوب للمنشآت"), // Required for organization
});

// Discriminated Union for Form Validation
export const clientSchema = z.discriminatedUnion("client_type", [
    individualClientSchema,
    organizationClientSchema,
]);

export type ClientFormValues = z.infer<typeof clientSchema>;
