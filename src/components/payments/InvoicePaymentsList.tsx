"use client";

import { formatCurrency, formatDate } from "@/lib/formatters";

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string | null;
    notes?: string | null;
}

interface InvoicePaymentsListProps {
    payments: Payment[];
}

const methodLabels: Record<string, string> = {
    cash: "نقداً",
    transfer: "تحويل بنكي",
    card: "بطاقة",
    check: "شيك",
    other: "أخرى",
};

export function InvoicePaymentsList({ payments }: InvoicePaymentsListProps) {
    if (payments.length === 0) {
        return <div className="text-sm text-gray-500 text-center py-4">لا توجد دفعات مسجلة</div>;
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-right">التاريخ</th>
                            <th className="px-4 py-3 text-right">المبلغ</th>
                            <th className="px-4 py-3 text-right">الطريقة</th>
                            <th className="px-4 py-3 text-right">المرجع</th>
                            <th className="px-4 py-3 text-right">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(payment.payment_date)}</td>
                                <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(payment.amount)}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                        {methodLabels[payment.payment_method] || payment.payment_method}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {payment.reference_number || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={payment.notes || ""}>
                                    {payment.notes || "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
