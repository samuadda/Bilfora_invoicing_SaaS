"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { Button, Input, Select, Label } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters";
import { recordPaymentAction } from "@/actions/payments";
import { useToast } from "@/components/ui/use-toast";

interface PaymentRecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
    totalAmount: number;
    outstandingAmount: number;
    onSuccess?: () => void;
}

export function PaymentRecordingModal({
    isOpen,
    onClose,
    invoiceId,
    totalAmount,
    outstandingAmount,
    onSuccess,
}: PaymentRecordingModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        amount: outstandingAmount.toString(),
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "transfer",
        reference_number: "",
        notes: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await recordPaymentAction({
                invoice_id: invoiceId,
                amount: Number(formData.amount),
                payment_date: formData.payment_date,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payment_method: formData.payment_method as any,
                reference_number: formData.reference_number,
                notes: formData.notes,
            });

            if (!result.success) {
                toast({
                    title: "فشل التسجيل",
                    description: result.error,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "تم التسجيل بنجاح",
                description: "تم تسجيل الدفعة وتحديث حالة الفاتورة",
                // variant: "success", // Removed success variant to standard behavior or just use default
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            toast({
                title: "خطأ غير متوقع",
                description: "حدث خطأ أثناء تسجيل الدفعة",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg animate-in fade-in-0 zoom-in-95">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-right">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            تسجيل دفعة جديدة
                        </Dialog.Title>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex justify-between">
                            <span>إجمالي الفاتورة:</span>
                            <span className="font-bold">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-sm text-orange-700 flex justify-between">
                            <span>المبلغ المستحق:</span>
                            <span className="font-bold">{formatCurrency(outstandingAmount)}</span>
                        </div>

                        <div className="space-y-2">
                            <Label>مبلغ الدفعة</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleChange("amount", e.target.value)}
                                required
                                max={outstandingAmount + 1}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>تاريخ الدفع</Label>
                                <Input
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) => handleChange("payment_date", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>طريقة الدفع</Label>
                                <Select
                                    value={formData.payment_method}
                                    onChange={(e) => handleChange("payment_method", e.target.value)}
                                >
                                    <option value="cash">نقداً</option>
                                    <option value="transfer">تحويل بنكي</option>
                                    <option value="card">بطاقة</option>
                                    <option value="check">شيك</option>
                                    <option value="other">أخرى</option>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>رقم المرجع (اختياري)</Label>
                            <Input
                                placeholder="مثال: رقم الحوالة"
                                value={formData.reference_number}
                                onChange={(e) => handleChange("reference_number", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>ملاحظات (اختياري)</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                                تسجيل الدفعة
                            </Button>
                        </div>
                    </form>

                    <Dialog.Close className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
