"use client";

import { Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
    Heading,
    Button,
    Input,
    Select,
} from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import type { CreateInvoiceItemInput, Product } from "@/types/database";

interface InvoiceItemsTableProps {
    items: CreateInvoiceItemInput[];
    products: Product[];
    onItemChange: (index: number, field: keyof CreateInvoiceItemInput, value: string | number) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    formatCurrency: (val: number) => string;
}

export function InvoiceItemsTable({
    items,
    products,
    onItemChange,
    onAddItem,
    onRemoveItem,
    formatCurrency,
}: InvoiceItemsTableProps) {
    return (
        <div className={layout.stack.standard}>
            <div className="flex items-center justify-between">
                <Heading variant="h3-subsection">عناصر الفاتورة</Heading>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onAddItem}
                    className="text-brand-primary hover:bg-purple-50"
                >
                    <Plus size={16} />
                    إضافة عنصر
                </Button>
            </div>

            <div className={layout.stack.standard}>
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group relative"
                    >
                        <button
                            type="button"
                            onClick={() => onRemoveItem(index)}
                            className="absolute -left-2 -top-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
                            disabled={items.length === 1}
                            title="حذف العنصر"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="col-span-12 md:col-span-5 space-y-1">
                            <label className="text-xs font-medium text-gray-500">
                                المنتج / الوصف
                            </label>
                            <div className={layout.stack.tight}>
                                <Select
                                    onChange={(e) => {
                                        const p = products.find((pr) => pr.id === e.target.value);
                                        if (p) {
                                            onItemChange(index, "description", p.name);
                                            onItemChange(index, "unit_price", p.unit_price);
                                        }
                                    }}
                                    className="text-xs"
                                >
                                    <option value="">اختر منتجاً (اختياري)</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.unit_price} ريال)
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    value={item.description}
                                    onChange={(e) =>
                                        onItemChange(index, "description", e.target.value)
                                    }
                                    placeholder="وصف العنصر"
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-span-4 md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">الكمية</label>
                            <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                    onItemChange(
                                        index,
                                        "quantity",
                                        parseInt(e.target.value) || 1
                                    )
                                }
                                className="text-center"
                                required
                            />
                        </div>

                        <div className="col-span-4 md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">سعر الوحدة</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) =>
                                    onItemChange(
                                        index,
                                        "unit_price",
                                        parseFloat(e.target.value) || 0
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="col-span-4 md:col-span-3 space-y-1">
                            <label className="text-xs font-medium text-gray-500">الإجمالي</label>
                            <div className="w-full h-[38px] flex items-center px-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700">
                                {formatCurrency(
                                    (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
