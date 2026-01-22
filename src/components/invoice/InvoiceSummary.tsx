"use client";

import type { CreateInvoiceItemInput, InvoiceType } from "@/types/database";
import { Price } from "@/components/ui";

interface InvoiceSummaryProps {
    items: CreateInvoiceItemInput[];
    taxRate: number;
    invoiceType: InvoiceType;
}

export function InvoiceSummary({
    items,
    taxRate,
    invoiceType,
}: InvoiceSummaryProps) {
    // Totals calculations
    const calcSubtotal = () =>
        items.reduce(
            (sum, it) =>
                sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
            0
        );

    const calcVat = (subtotal: number) => {
        if (invoiceType === "non_tax") return 0;
        return subtotal * (Number(taxRate || 0) / 100);
    };

    const calcTotal = (subtotal: number, vat: number) => subtotal + vat;

    const subtotal = calcSubtotal();
    const vat = calcVat(subtotal);
    const total = calcTotal(subtotal, vat);

    return (
        <div className="flex flex-col md:flex-row justify-end gap-6 pt-6 border-t border-gray-100">
            <div className="w-full md:w-80 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <Price amount={subtotal} size="sm" className="text-gray-900" />
                </div>
                {invoiceType !== "non_tax" && (
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600">
                            الضريبة ({taxRate}%)
                        </span>
                        <Price amount={vat} size="sm" className="text-gray-900" />
                    </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">الإجمالي</span>
                    <Price amount={total} size="lg" className="text-brand-primary" />
                </div>
            </div>
        </div>
    );
}
