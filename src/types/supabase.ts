export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "12.2.12 (cd3cf9e)"
    }
    public: {
        Tables: {
            clients: {
                Row: {
                    address: string | null
                    city: string | null
                    commercial_registration: string | null
                    company_name: string | null
                    created_at: string
                    deleted_at: string | null
                    email: string | null
                    id: string
                    name: string
                    notes: string | null
                    phone: string | null
                    status: string
                    tax_number: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    address?: string | null
                    city?: string | null
                    commercial_registration?: string | null
                    company_name?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    notes?: string | null
                    phone?: string | null
                    status?: string
                    tax_number?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    address?: string | null
                    city?: string | null
                    commercial_registration?: string | null
                    company_name?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    notes?: string | null
                    phone?: string | null
                    status?: string
                    tax_number?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "clients_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invoice_items: {
                Row: {
                    description: string
                    id: string
                    invoice_id: string
                    quantity: number
                    total: number
                    unit_price: number
                }
                Insert: {
                    description: string
                    id?: string
                    invoice_id: string
                    quantity: number
                    total: number
                    unit_price: number
                }
                Update: {
                    description?: string
                    id?: string
                    invoice_id?: string
                    quantity?: number
                    total?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "invoice_items_invoice_id_fkey"
                        columns: ["invoice_id"]
                        isOneToOne: false
                        referencedRelation: "invoices"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invoice_sequences: {
                Row: {
                    next_number: number
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    next_number?: number
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    next_number?: number
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "invoice_sequences_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invoice_settings: {
                Row: {
                    address_line1: string | null
                    city: string | null
                    created_at: string
                    currency: string
                    default_vat_rate: number
                    email: string
                    iban: string | null
                    id: string
                    invoice_footer: string | null
                    logo_url: string | null
                    name: string
                    numbering_prefix: string
                    phone: string
                    tax_number: string
                    timezone: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    address_line1?: string | null
                    city?: string | null
                    created_at?: string
                    currency?: string
                    default_vat_rate?: number
                    email: string
                    iban?: string | null
                    id?: string
                    invoice_footer?: string | null
                    logo_url?: string | null
                    name: string
                    numbering_prefix?: string
                    phone: string
                    tax_number: string
                    timezone?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    address_line1?: string | null
                    city?: string | null
                    created_at?: string
                    currency?: string
                    default_vat_rate?: number
                    email?: string
                    iban?: string | null
                    id?: string
                    invoice_footer?: string | null
                    logo_url?: string | null
                    name?: string
                    numbering_prefix?: string
                    phone?: string
                    tax_number?: string
                    timezone?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "invoice_settings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invoices: {
                Row: {
                    client_id: string
                    created_at: string
                    document_kind: string
                    due_date: string
                    id: string
                    invoice_number: string
                    invoice_type: string
                    issue_date: string
                    issue_time: string | null
                    notes: string | null
                    order_id: string | null
                    related_invoice_id: string | null
                    status: string
                    subtotal: number
                    tax_amount: number
                    tax_rate: number
                    total_amount: number
                    type: string | null
                    updated_at: string
                    user_id: string
                    vat_amount: number
                }
                Insert: {
                    client_id: string
                    created_at?: string
                    document_kind?: string
                    due_date: string
                    id?: string
                    invoice_number: string
                    invoice_type: string
                    issue_date: string
                    issue_time?: string | null
                    notes?: string | null
                    order_id?: string | null
                    related_invoice_id?: string | null
                    status: string
                    subtotal: number
                    tax_amount: number
                    tax_rate?: number
                    total_amount: number
                    type?: string | null
                    updated_at?: string
                    user_id: string
                    vat_amount: number
                }
                Update: {
                    client_id?: string
                    created_at?: string
                    document_kind?: string
                    due_date?: string
                    id?: string
                    invoice_number?: string
                    invoice_type?: string
                    issue_date?: string
                    issue_time?: string | null
                    notes?: string | null
                    order_id?: string | null
                    related_invoice_id?: string | null
                    status?: string
                    subtotal?: number
                    tax_amount?: number
                    tax_rate?: number
                    total_amount?: number
                    type?: string | null
                    updated_at?: string
                    user_id?: string
                    vat_amount?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "invoices_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "invoices_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "invoices_related_invoice_id_fkey"
                        columns: ["related_invoice_id"]
                        isOneToOne: false
                        referencedRelation: "invoices"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "invoices_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    description: string
                    id: string
                    order_id: string
                    quantity: number
                    total: number
                    unit_price: number
                }
                Insert: {
                    description: string
                    id?: string
                    order_id: string
                    quantity: number
                    total: number
                    unit_price: number
                }
                Update: {
                    description?: string
                    id?: string
                    order_id?: string
                    quantity?: number
                    total?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    client_id: string
                    created_at: string
                    id: string
                    notes: string | null
                    order_number: string
                    status: string
                    total_amount: number
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    client_id: string
                    created_at?: string
                    id?: string
                    notes?: string | null
                    order_number: string
                    status: string
                    total_amount: number
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    client_id?: string
                    created_at?: string
                    id?: string
                    notes?: string | null
                    order_number?: string
                    status?: string
                    total_amount?: number
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    active: boolean
                    category: string | null
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    unit: string | null
                    unit_price: number
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    active: boolean
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    unit?: string | null
                    unit_price: number
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    active?: boolean
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    unit?: string | null
                    unit_price?: number
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    account_type: string
                    address: string | null
                    avatar_url: string | null
                    city: string | null
                    company_name: string | null
                    created_at: string
                    dob: string
                    full_name: string
                    gender: string | null
                    id: string
                    phone: string
                    tax_number: string | null
                    updated_at: string
                }
                Insert: {
                    account_type: string
                    address?: string | null
                    avatar_url?: string | null
                    city?: string | null
                    company_name?: string | null
                    created_at?: string
                    dob: string
                    full_name: string
                    gender?: string | null
                    id: string
                    phone: string
                    tax_number?: string | null
                    updated_at?: string
                }
                Update: {
                    account_type?: string
                    address?: string | null
                    avatar_url?: string | null
                    city?: string | null
                    company_name?: string | null
                    created_at?: string
                    dob?: string
                    full_name?: string
                    gender?: string | null
                    id?: string
                    phone?: string
                    tax_number?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            create_invoice_with_items: {
                Args: {
                    p_client_id: string
                    p_document_kind: string
                    p_due_date: string
                    p_invoice_type: string
                    p_issue_date: string
                    p_items: Json
                    p_notes: string
                    p_order_id: string | null
                    p_status: string
                    p_tax_rate: number
                }
                Returns: {
                    id: string
                    invoice_number: string
                }[]
            }
        }
        Enums: {
            document_kind: "invoice" | "credit_note"
            invoice_type: "standard_tax" | "simplified_tax" | "non_tax"
            invoice_type_v2: "standard" | "simplified" | "regular"
            invoice_type_v3: "standard_tax" | "simplified_tax" | "non_tax"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database["public"]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: "public" },
    TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: "public" },
    TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: "public" },
    TableName extends PublicTableNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: "public" }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: "public" },
    EnumName extends PublicEnumNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: "public" }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: "public" },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: "public" }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: "public" }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
