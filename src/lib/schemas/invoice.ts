import { z } from "zod";

export const itemSchema = z.object({
    description: z.string().min(1, "الوصف مطلوب"),
    quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
    unit_price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
});

export const invoiceSchema = z.object({
    client_id: z.string().uuid("العميل غير صالح"),

    order_id: z.string().uuid().nullable().optional().or(z.literal("")),

    invoice_type: z.enum(["standard_tax", "simplified_tax", "non_tax"], {
        message: "نوع الفاتورة مطلوب",
    }),

    document_kind: z.enum(["invoice", "credit_note", "debit_note"]).optional(),

    issue_date: z.string().min(1, "تاريخ الإصدار مطلوب"),
    issue_time: z.string().optional(),
    due_date: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
    status: z.enum(["draft", "sent", "paid", "cancelled"]),
    tax_rate: z.coerce.number().min(0).max(100),
    notes: z.string().optional(),
    items: z.array(itemSchema).min(1, "يجب إضافة عنصر واحد على الأقل"),
});

export type CreateInvoiceSchema = z.infer<typeof invoiceSchema>;
