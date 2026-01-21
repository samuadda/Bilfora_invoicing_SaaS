"use client";

import { useState } from "react";
import { User, Phone, Mail, Loader2, Building2 } from "lucide-react";
import { m } from "framer-motion";
import {
    Heading,
    Card,
    Button,
    Input,
    Field,
    FormRow,
} from "@/components/ui";
import { Combobox } from "@/components/ui/combobox";
import { layout } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface InvoiceClientSectionProps {
    clients: Client[];
    selectedClientId: string;
    onClientChange: (clientId: string) => void;
    onClientCreated: (client: Client) => void;
}

export function InvoiceClientSection({
    clients,
    selectedClientId,
    onClientChange,
    onClientCreated,
}: InvoiceClientSectionProps) {
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [newCustomerError, setNewCustomerError] = useState<string | null>(null);
    const [newCustomerData, setNewCustomerData] = useState({
        name: "",
        email: "",
        phone: "",
        company_name: "",
        tax_number: "",
    });

    const toggleNewCustomerForm = () => {
        setShowNewCustomerForm(!showNewCustomerForm);
        if (!showNewCustomerForm) {
            setNewCustomerData({
                name: "",
                email: "",
                phone: "",
                company_name: "",
                tax_number: "",
            });
            setNewCustomerError(null);
        }
    };

    const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCustomerData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateNewCustomer = async () => {
        try {
            setSavingCustomer(true);
            setNewCustomerError(null);

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            if (!newCustomerData.name?.trim()) {
                setNewCustomerError("اسم العميل مطلوب");
                return;
            }
            if (!newCustomerData.phone?.trim()) {
                setNewCustomerError("رقم الجوال مطلوب");
                return;
            }

            const { data: customerData, error: customerError } = await supabase
                .from("clients")
                .insert({
                    user_id: user.id,
                    name: newCustomerData.name.trim(),
                    email: newCustomerData.email?.trim() || null,
                    phone: newCustomerData.phone.trim(),
                    company_name: newCustomerData.company_name?.trim() || null,
                    tax_number: newCustomerData.tax_number?.trim() || null,
                    status: "active",
                })
                .select()
                .single();

            if (customerError) {
                console.error("Error creating customer:", customerError);
                setNewCustomerError("فشل في إنشاء العميل");
                return;
            }

            onClientCreated(customerData);
            setShowNewCustomerForm(false);

            // Select the new client
            onClientChange(customerData.id);

        } catch (err) {
            console.error("Unexpected error creating customer:", err);
            setNewCustomerError("حدث خطأ غير متوقع");
        } finally {
            setSavingCustomer(false);
        }
    };

    return (
        <Card background="subtle" padding="large">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={cn(
                        "flex items-center text-gray-900 font-semibold",
                        layout.gap.tight
                    )}
                >
                    <User size={20} className="text-[#7f2dfb]" />
                    <Heading variant="h3-subsection">بيانات العميل</Heading>
                </div>
                <button
                    type="button"
                    onClick={toggleNewCustomerForm}
                    className="text-[#7f2dfb] hover:text-[#6a25d1] text-sm font-medium transition-colors"
                >
                    {showNewCustomerForm ? "اختيار عميل موجود" : "+ عميل جديد"}
                </button>
            </div>

            {!showNewCustomerForm ? (
                <Combobox
                    options={clients.map((c) => ({
                        value: c.id,
                        label: c.name + (c.company_name ? ` (${c.company_name})` : ""),
                        icon: c.company_name ? <Building2 size={14} /> : <User size={14} />,
                    }))}
                    value={selectedClientId}
                    onChange={(val) => onClientChange(val)}
                    placeholder="اختر العميل"
                    searchPlaceholder="بحث عن عميل..."
                    emptyText="لا يوجد عملاء بهذا الاسم"
                />
            ) : (
                <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card padding="standard">
                        {newCustomerError && (
                            <div className="mb-4 text-sm text-red-600 font-medium">
                                {newCustomerError}
                            </div>
                        )}
                        <FormRow columns={2} gap="standard">
                            <Field label="الاسم الكامل" required>
                                <Input
                                    name="name"
                                    value={newCustomerData.name}
                                    onChange={handleNewCustomerChange}
                                    placeholder="مثال: محمد السعدي"
                                    required
                                />
                            </Field>
                            <Field label="رقم الجوال" required>
                                <div className="relative">
                                    <Phone
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={16}
                                    />
                                    <Input
                                        name="phone"
                                        value={newCustomerData.phone}
                                        onChange={handleNewCustomerChange}
                                        className="pr-9"
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </Field>
                        </FormRow>

                        <Field label="البريد الإلكتروني" description="(اختياري)">
                            <div className="relative">
                                <Mail
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                                <Input
                                    name="email"
                                    type="email"
                                    value={newCustomerData.email}
                                    onChange={handleNewCustomerChange}
                                    className="pr-9"
                                    placeholder="example@domain.com"
                                    dir="ltr"
                                />
                            </div>
                        </Field>

                        <FormRow columns={2} gap="standard">
                            <Field label="اسم الشركة" description="(اختياري)">
                                <Input
                                    name="company_name"
                                    value={newCustomerData.company_name}
                                    onChange={handleNewCustomerChange}
                                    placeholder="مثال: شركة الريّان"
                                />
                            </Field>
                            <Field label="الرقم الضريبي" description="(اختياري)">
                                <Input
                                    name="tax_number"
                                    value={newCustomerData.tax_number}
                                    onChange={handleNewCustomerChange}
                                    placeholder="مثال: 310xxxxxxx"
                                    dir="ltr"
                                />
                            </Field>
                        </FormRow>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={handleCreateNewCustomer}
                                disabled={savingCustomer}
                            >
                                {savingCustomer && <Loader2 size={16} className="animate-spin ml-2" />}
                                حفظ العميل
                            </Button>
                        </div>
                    </Card>
                </m.div>
            )}
        </Card>
    );
}
