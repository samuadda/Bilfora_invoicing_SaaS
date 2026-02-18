"use client";

import { useState } from "react";
import { User, Phone, Mail, Loader2, Building2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import {
    Heading,
    Card,
    Button,
    Input,
    Field,
} from "@/components/ui";
import { Combobox } from "@/components/ui/combobox";
import { layout } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { clientSchema } from "@/lib/schemas/client";
import { IS_ZATCA_ENABLED } from "@/config/features";

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

    // Form State
    const [clientType, setClientType] = useState<"individual" | "organization">("individual");
    const [newCustomerData, setNewCustomerData] = useState({
        name: "",
        email: "",
        phone: "",
        landline: "",
        tax_number: "",
        address: "",
    });

    const isOrganization = clientType === "organization";

    const toggleNewCustomerForm = () => {
        setShowNewCustomerForm(!showNewCustomerForm);
        if (!showNewCustomerForm) {
            setNewCustomerData({
                name: "",
                email: "",
                phone: "",
                landline: "",
                tax_number: "",
                address: "",
            });
            setClientType("individual");
            setNewCustomerError(null);
        }
    };

    const handleNewCustomerChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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

            // Validation using Zod Schema
            // Construct the object to match the schema
            const clientPayload = {
                client_type: clientType,
                name: newCustomerData.name,
                phone: newCustomerData.phone,
                landline: newCustomerData.landline,
                email: newCustomerData.email || undefined, // Zod optional expects undefined or missing, but empty string handled by .or(z.literal("")) in schema if set up that way.
                // My schema: email: z.string().email().optional().or(z.literal(""))
                // So empty string is fine.
                tax_number: newCustomerData.tax_number,
                address: newCustomerData.address,
            };

            const result = clientSchema.safeParse(clientPayload);

            if (!result.success) {
                const firstError = result.error.issues[0]?.message;
                setNewCustomerError(firstError || "يرجى التحقق من البيانات المدخلة");
                return;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Prepare DB Payload
            const dbPayload = {
                user_id: user.id,
                name: newCustomerData.name.trim(),
                email: newCustomerData.email?.trim() || null,
                phone: newCustomerData.phone?.trim() || null,
                // If organization, company_name is the name. If individual, company_name is null usually,
                // BUT the previous code mapped company_name field.
                // QuickClientModal logic: company_name: isOrganization ? data.name : null
                company_name: isOrganization ? newCustomerData.name.trim() : null,
                tax_number: isOrganization && newCustomerData.tax_number ? newCustomerData.tax_number.trim() : null,
                address: isOrganization ? newCustomerData.address.trim() : (newCustomerData.address?.trim() || null),
                // City is not separated in this inline form, so we leave it null or try to extract?
                // Request said "Make the Address <textarea>...". Inline form won't have city field.
                // QuickClientModal sets city separately. Here we might skip it or just put everything in address.
                // DB has 'address' column text. 'city' column text.
                // I will leave city null for inline creation as it's not explicitly asked and simplifies UI.
                // Map landline to notes
                notes: newCustomerData.landline?.trim() ? `الهاتف: ${newCustomerData.landline.trim()}` : null,
                status: "active",
            };

            const { data: customerData, error: customerError } = await supabase
                .from("clients")
                .insert(dbPayload)
                .select()
                .single();

            if (customerError) {
                console.error("Error creating customer:", customerError);
                setNewCustomerError("فشل في إنشاء المشتري");
                return;
            }

            onClientCreated(customerData);
            setShowNewCustomerForm(false);
            onClientChange(customerData.id);

        } catch (err) {
            console.error("Unexpected error creating customer:", err);
            setNewCustomerError("حدث خطأ غير متوقع");
        } finally {
            setSavingCustomer(false);
        }
    };

    return (
        <Card background="subtle" padding="large" hover={false}>
            <div className="flex items-center justify-between mb-4">
                <div
                    className={cn(
                        "flex items-center text-gray-900 font-semibold",
                        layout.gap.tight
                    )}
                >
                    <User size={20} className="text-[#7f2dfb]" />
                    <Heading variant="h3-subsection">بيانات المشتري</Heading>
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
                    placeholder="اختر المشتري"
                    searchPlaceholder="بحث عن عميل..."
                    emptyText="لا يوجد عملاء بهذا الاسم"
                />
            ) : (
                <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card padding="standard" hover={false}>
                        {newCustomerError && (
                            <div className="mb-4 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <span className="block w-1.5 h-1.5 rounded-full bg-red-600" />
                                {newCustomerError}
                            </div>
                        )}

                        {/* Client Type Toggle (ZATCA only) */}
                        {IS_ZATCA_ENABLED && (
                        <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
                            <button
                                type="button"
                                onClick={() => setClientType("individual")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium",
                                    !isOrganization
                                        ? "bg-white shadow-sm text-[#7f2dfb]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <User size={16} />
                                أفراد
                            </button>
                            <button
                                type="button"
                                onClick={() => setClientType("organization")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium",
                                    isOrganization
                                        ? "bg-white shadow-sm text-[#7f2dfb]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <Building2 size={16} />
                                شركات (مؤسسات)
                            </button>
                        </div>
                        )}

                        <div className="space-y-4">
                            {/* Name Field */}
                            <Field
                                label={isOrganization ? "اسم المنشأة" : "الاسم الكامل"}
                                required
                            >
                                <Input
                                    name="name"
                                    value={newCustomerData.name}
                                    onChange={handleNewCustomerChange}
                                    placeholder={isOrganization ? "مثال: شركة الصفوة" : "مثال: عبدالله محمد"}
                                />
                            </Field>

                            {/* Contact Grid (50/50) */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="رقم الجوال" description="(اختياري)">
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
                                            maxLength={10}
                                        />
                                    </div>
                                </Field>
                                <Field label="رقم الهاتف" description="(اختياري)">
                                    <div className="relative">
                                        <Phone
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={16}
                                        />
                                        <Input
                                            name="landline"
                                            value={newCustomerData.landline}
                                            onChange={handleNewCustomerChange}
                                            className="pr-9"
                                            placeholder="011xxxxxxx"
                                            dir="ltr"
                                        />
                                    </div>
                                </Field>
                                <Field label="البريد الإلكتروني" description="(اختياري)" className="col-span-2">
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
                                            placeholder="mail@ex.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* Organization Only Fields (ZATCA only) */}
                            {IS_ZATCA_ENABLED && (
                            <AnimatePresence>
                                {isOrganization && (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <Field label="العنوان الوطني" required>
                                            <textarea
                                                name="address"
                                                rows={2}
                                                value={newCustomerData.address}
                                                onChange={handleNewCustomerChange}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-4 focus:ring-purple-100 transition-all text-sm resize-none"
                                                placeholder="المدينة، الحي، الشارع..."
                                            />
                                        </Field>

                                        <Field label="الرقم الضريبي" description="(اختياري)">
                                            <Input
                                                name="tax_number"
                                                value={newCustomerData.tax_number}
                                                onChange={handleNewCustomerChange}
                                                placeholder="3xxxxxxxxxxxxxx3"
                                                dir="ltr"
                                                maxLength={15}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">يجب أن يتكون من 15 رقم ويبدأ وينتهي بـ 3 (إذا وجد)</p>
                                        </Field>
                                    </m.div>
                                )}
                            </AnimatePresence>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50 mt-4">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={handleCreateNewCustomer}
                                disabled={savingCustomer}
                                className="w-full sm:w-auto"
                            >
                                {savingCustomer && <Loader2 size={16} className="animate-spin ml-2" />}
                                حفظ المشتري
                            </Button>
                        </div>
                    </Card>
                </m.div>
            )}
        </Card>
    );
}
