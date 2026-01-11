"use client";

import {
    Input,
    Select,
    Field,
    FormRow,
} from "@/components/ui";
import type { CreateInvoiceInput, InvoiceType } from "@/types/database";
import { labelByInvoiceType } from "@/lib/invoiceTypeLabels";

interface InvoiceDetailsFormProps {
    formData: CreateInvoiceInput;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onTypeChange: (type: InvoiceType) => void;
}

export function InvoiceDetailsForm({
    formData,
    onChange,
    onTypeChange,
}: InvoiceDetailsFormProps) {
    return (
        <FormRow columns={3} gap="large">
            <Field label="نوع الفاتورة" required>
                <Select
                    name="invoice_type"
                    value={formData.invoice_type || "standard_tax"}
                    onChange={(e) => onTypeChange(e.target.value as InvoiceType)}
                    required
                >
                    <option value="standard_tax">{labelByInvoiceType.standard_tax}</option>
                    <option value="simplified_tax">{labelByInvoiceType.simplified_tax}</option>
                    <option value="non_tax">{labelByInvoiceType.non_tax}</option>
                </Select>
            </Field>

            <Field label="تاريخ الإصدار" required>
                <Input
                    name="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={onChange}
                    required
                />
            </Field>

            <Field label="تاريخ الاستحقاق" required>
                <Input
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={onChange}
                    required
                />
            </Field>

            <Field label="الحالة">
                <Select
                    name="status"
                    value={formData.status}
                    onChange={onChange}
                >
                    <option value="draft">مسودة</option>
                    <option value="sent">مرسلة</option>
                    <option value="paid">مدفوعة</option>
                    <option value="cancelled">ملغية</option>
                </Select>
            </Field>

            <Field label="معدل الضريبة (%)">
                <Input
                    name="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                        formData.invoice_type === "non_tax"
                            ? 0
                            : formData.tax_rate ?? 15
                    }
                    onChange={onChange}
                    disabled={formData.invoice_type === "non_tax"}
                />
            </Field>

            <Field label="ملاحظات" className="md:col-span-2">
                <Input
                    name="notes"
                    value={formData.notes ?? ""}
                    onChange={onChange}
                    placeholder="أي ملاحظات إضافية للفاتورة..."
                />
            </Field>
        </FormRow>
    );
}
