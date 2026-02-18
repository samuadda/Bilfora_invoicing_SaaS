"use client";

import { Trash2, Plus } from "lucide-react";
import { m } from "framer-motion";
import {
    Heading,
    Button,
    Input,
    Price,
} from "@/components/ui";
import { Combobox } from "@/components/ui/combobox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { layout } from "@/lib/ui/tokens";
import type { CreateInvoiceItemInput, Product } from "@/types/database";
import { IS_ZATCA_ENABLED } from "@/config/features";

interface InvoiceItemsTableProps {
    items: CreateInvoiceItemInput[];
    products: Product[];
    onItemChange: (index: number, field: keyof CreateInvoiceItemInput, value: string | number) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onAddNewProduct?: () => void;
}

export function InvoiceItemsTable({
    items,
    products,
    onItemChange,
    onAddItem,
    onRemoveItem,
    onAddNewProduct,
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
                    <m.div
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
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Combobox
                                            options={products.map((p) => ({
                                                value: p.id,
                                                label: `${p.name} (${p.unit_price} ريال)`,
                                            }))}
                                            value={products.find(p => p.name === item.description)?.id || ""}
                                            onChange={(val) => {
                                                const p = products.find((pr) => pr.id === val);
                                                if (p && p.name !== item.description) {
                                                    onItemChange(index, "description", p.name);
                                                    onItemChange(index, "unit_price", p.unit_price);
                                                }
                                            }}
                                            placeholder="اختر منتجاً (اختياري)"
                                            searchPlaceholder="بحث عن منتج..."
                                            className="text-xs"
                                            emptyText="لا يوجد منتجات"
                                        />
                                    </div>
                                    {onAddNewProduct && (
                                        <TooltipProvider>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={onAddNewProduct}
                                                        className="shrink-0 h-[42px] w-[42px] p-0 flex items-center justify-center bg-purple-50 text-[#7f2dfb] border-purple-100 hover:bg-purple-100"
                                                    >
                                                        <Plus size={20} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    className="bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg shadow-xl border-none"
                                                >
                                                    <p>إضافة منتج جديد</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
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
                                className="nums-eng-center"
                                required
                            />
                        </div>

                        <div className="col-span-4 md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-gray-500">
                                {IS_ZATCA_ENABLED ? "سعر الوحدة (غير شامل)" : "سعر الوحدة"}
                            </label>
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
                            <div className="w-full h-[38px] flex items-center px-3 bg-gray-100 rounded-xl">
                                <Price
                                    amount={(Number(item.quantity) || 0) * (Number(item.unit_price) || 0)}
                                    size="sm"
                                    className="text-gray-700"
                                />
                            </div>
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );
}
