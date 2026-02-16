import { z } from "zod";
import { IS_ZATCA_ENABLED } from "@/config/features";

export const itemSchema = z.object({
    description: z.string().min(1, "وش وصف الصنف؟ اكتب وصف بسيط 📝"),
    quantity: z.coerce.number().min(1, "الكمية لازم تكون 1 على الأقل"),
    unit_price: z.coerce.number().min(0, "السعر ما يكون بالسالب 😅"),
});

// ── ZATCA-enabled schema ────────────────────────────────────────────────────
const zatcaInvoiceSchema = z.object({
    client_id: z.string().uuid("اختر عميل أولاً 😊"),
    order_id: z.string().uuid().nullable().optional().or(z.literal("")),
    invoice_type: z.enum(["standard_tax", "simplified_tax", "non_tax"], {
        message: "حدد نوع الفاتورة عشان نكمل",
    }),
    document_kind: z.enum(["invoice", "credit_note", "debit_note"]).optional(),
    issue_date: z.string().min(1, "حدد تاريخ الإصدار 📅"),
    issue_time: z.string().optional(),
    due_date: z.string().min(1, "حدد تاريخ الاستحقاق 📅"),
    status: z.enum(["draft", "sent", "paid", "cancelled"]),
    tax_rate: z.coerce.number().min(0).max(100),
    notes: z.string().optional(),
    items: z.array(itemSchema).min(1, "أضف صنف واحد على الأقل 📦"),
});

// ── Simple Beta schema (no ZATCA) ───────────────────────────────────────────
const simpleInvoiceSchema = z.object({
    client_id: z.string().uuid("اختر عميل أولاً 😊"),
    order_id: z.string().uuid().nullable().optional().or(z.literal("")),
    invoice_type: z.enum(["standard_tax", "simplified_tax", "non_tax"]).default("simplified_tax"),
    document_kind: z.enum(["invoice", "credit_note", "debit_note"]).optional(),
    issue_date: z.string().min(1, "حدد تاريخ الإصدار 📅"),
    issue_time: z.string().optional(),
    due_date: z.string().min(1, "حدد تاريخ الاستحقاق 📅"),
    status: z.enum(["draft", "sent", "paid", "cancelled"]),
    tax_rate: z.coerce.number().default(0),
    notes: z.string().optional(),
    items: z.array(itemSchema).min(1, "أضف صنف واحد على الأقل 📦"),
});

export const invoiceSchema = IS_ZATCA_ENABLED ? zatcaInvoiceSchema : simpleInvoiceSchema;

export type CreateInvoiceSchema = z.infer<typeof zatcaInvoiceSchema>;
