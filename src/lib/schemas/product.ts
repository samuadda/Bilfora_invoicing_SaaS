import { z } from "zod";

export const productSchema = z.object({
    // Type is required for logic but might not be in the form input directly if handled via state, 
    // but good to have in schema.
    type: z.enum(["service", "product"]),

    name: z.string().min(1, "اسم المنتج مطلوب").max(255, "اسم المنتج طويل جداً"),

    unit_price: z
        .number()
        .min(0, "سعر البيع لا يمكن أن يكون سالباً"),

    cost_price: z
        .number()
        .min(0, "سعر التكلفة لا يمكن أن يكون سالباً")
        .default(0),

    unit: z.string().max(50, "الوحدة طويلة جداً").optional(),

    description: z.string().max(1000, "الوصف طويل جداً").optional(),

    category: z.string().max(100, "الفئة طويلة جداً").optional(),

    price_includes_vat: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;
