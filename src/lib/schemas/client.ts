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

const SA_PHONE_REGEX = /^05\d{8}$/; // Starts with 05, followed by 8 digits (Total 10)

const phoneSchema = z.string().refine((val) => {
    if (!val) return true; // Optional
    return SA_PHONE_REGEX.test(val);
}, "رقم الجوال يجب أن يتكون من 10 أرقام ويبدأ بـ 05");

// Base schema for common fields
const baseClientSchema = z.object({
    name: z.string().min(2, "الاسم قصير جداً"),
    phone: phoneSchema.optional().or(z.literal("")),
    landline: z.string().optional().or(z.literal("")),
    email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
});

// Individual Client Schema
export const individualClientSchema = baseClientSchema.extend({
    client_type: z.literal("individual"),
    tax_number: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
});

// Organization Client Schema
export const organizationClientSchema = baseClientSchema.extend({
    client_type: z.literal("organization"),
    tax_number: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine(
            (val) => !val || ZATCA_TAX_NUMBER_REGEX.test(val),
            "الرقم الضريبي غير صحيح (يجب أن يتكون من 15 رقم ويبدأ وينتهي بـ 3)"
        ),
    address: z.string().min(5, "العنوان الوطني مطلوب للمنشآت"),
});

// Discriminated Union for Form Validation
export const clientSchema = z.discriminatedUnion("client_type", [
    individualClientSchema,
    organizationClientSchema,
]);

export type ClientFormValues = z.infer<typeof clientSchema>;
