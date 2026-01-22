"use client";

import {
    Input,
    Field,
    FormRow,
    Button,
} from "@/components/ui";
import type { CreateInvoiceInput, InvoiceType } from "@/types/database";
import { labelByInvoiceType } from "@/lib/invoiceTypeLabels";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/custom-select";

interface InvoiceDetailsFormProps {
    formData: CreateInvoiceInput;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onTypeChange: (type: InvoiceType) => void;
    onDateChange?: (field: "issue_date" | "due_date", date: Date | undefined) => void;
}

export function InvoiceDetailsForm({
    formData,
    onChange,
    onTypeChange,
    onDateChange,
}: InvoiceDetailsFormProps) {
    // Helper to safely parse YYYY-MM-DD string to Date without timezone shifts
    const parseDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return undefined;
        const parts = dateStr.split("-");
        if (parts.length !== 3) return undefined;
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    return (
        <FormRow columns={3} gap="large">
            <Field label="نوع الفاتورة" required>
                <Select
                    value={formData.invoice_type || "standard_tax"}
                    onValueChange={(val) => onTypeChange(val as InvoiceType)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الفاتورة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="standard_tax">{labelByInvoiceType.standard_tax}</SelectItem>
                        <SelectItem value="simplified_tax">{labelByInvoiceType.simplified_tax}</SelectItem>
                        <SelectItem value="non_tax">{labelByInvoiceType.non_tax}</SelectItem>
                    </SelectContent>
                </Select>
            </Field>

            <Field label="تاريخ الإصدار" required>
                {onDateChange ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                className={cn(
                                    "w-full justify-end text-right font-normal bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-none flex-row-reverse",
                                    !formData.issue_date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="ml-2 h-4 w-4 text-gray-500" />
                                {formData.issue_date ? format(parseDate(formData.issue_date)!, "dd/MM/yyyy") : <span>اختر تاريخ</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={parseDate(formData.issue_date)}
                                onSelect={(date) => onDateChange("issue_date", date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Input
                        name="issue_date"
                        type="date"
                        value={formData.issue_date}
                        onChange={onChange}
                        required
                    />
                )}
            </Field>

            <Field label="تاريخ الاستحقاق" required>
                {onDateChange ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                className={cn(
                                    "w-full justify-end text-right font-normal bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-none flex-row-reverse",
                                    !formData.due_date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="ml-2 h-4 w-4 text-gray-500" />
                                {formData.due_date ? format(parseDate(formData.due_date)!, "dd/MM/yyyy") : <span>اختر تاريخ</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={parseDate(formData.due_date)}
                                onSelect={(date) => onDateChange("due_date", date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Input
                        name="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={onChange}
                        required
                    />
                )}
            </Field>

            <Field label="الحالة">
                <Select
                    value={formData.status}
                    onValueChange={(val) => onChange({ target: { name: 'status', value: val } } as React.ChangeEvent<HTMLInputElement>)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="sent">مرسلة</SelectItem>
                        <SelectItem value="paid">مدفوعة</SelectItem>
                        <SelectItem value="cancelled">ملغية</SelectItem>
                    </SelectContent>
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
