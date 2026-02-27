// Database Types for Bilfora Application
// These types now alias the auto-generated Supabase types
import { Database, Tables } from "./supabase";

export type Gender = "male" | "female";
export type AccountType = "individual" | "business";
export type ClientStatus = "active" | "inactive";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
// Enum from database
export type InvoiceType = Database["public"]["Enums"]["invoice_type"];
export type DocumentKind = Database["public"]["Enums"]["document_kind"];

// Base database table interfaces aliased from generated types
export type Profile = Tables<"profiles"> & {
	gender: Gender | null; // Casting string to specific union type
	account_type: AccountType; // Casting string to specific union type
};

export type Client = Tables<"clients"> & {
	status: ClientStatus; // Casting string to specific union type
	invoice_count?: number; // Computed field
};

export type Order = Tables<"orders"> & {
	status: OrderStatus;
	total_amount: number; // Numeric comes as number
};

export type OrderItem = Tables<"order_items">;

export type ProductStatus = "active" | "inactive";

export type Product = Tables<"products"> & {
	status?: ProductStatus; // Computed
	sku?: string | null; // UI only
	cost_price?: number; // Added for agency features
	product_type?: "service" | "product" | string; // Added for agency features
};

export type Invoice = Tables<"invoices"> & {
	invoice_type: InvoiceType;
	document_kind?: DocumentKind;
	status: InvoiceStatus;
	// Map database fields to application logic if needed, 
	// but Tables interface should cover most:
	// subtotal, tax_amount etc are all numbers in generated types
	payment_info?: { bank_name?: string | null; iban?: string | null } | null;
};

export type InvoiceItem = Tables<"invoice_items">;

// Extended interfaces with relationships
export interface OrderWithClient extends Order {
	client: Client;
}

export interface OrderWithItems extends Order {
	items: OrderItem[];
}

export interface OrderWithClientAndItems extends Order {
	client: Client;
	items: OrderItem[];
}

export interface InvoiceWithClient extends Invoice {
	client: Client;
}

export interface InvoiceWithItems extends Invoice {
	items: InvoiceItem[];
}

export interface InvoiceWithClientAndItems extends Invoice {
	client: Client;
	items: InvoiceItem[];
}

export interface InvoiceWithOrder extends Invoice {
	order: Order | null;
}

export interface InvoiceWithOrderAndClient extends Invoice {
	order: Order | null;
	client: Client;
}

// Form input types (for creating/updating records)
// These generally map to TablesInsert<"tablename"> but with stricter validation types if needed

export interface CreateProfileInput {
	full_name: string;
	phone: string;
	dob: string;
	gender?: Gender | null;
	account_type: AccountType;
	avatar_url?: string | null;
	company_name?: string | null;
	tax_number?: string | null;
	address?: string | null;
	city?: string | null;
}

export interface UpdateProfileInput extends Partial<CreateProfileInput> {
	id: string;
}

export interface CreateClientInput {
	name: string;
	email: string;
	phone: string;
	company_name?: string | null;
	tax_number?: string | null;
	address?: string | null;
	city?: string | null;
	notes?: string | null;
	status?: ClientStatus;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
	id: string;
}

export interface CreateOrderInput {
	client_id: string;
	status?: OrderStatus;
	notes?: string | null;
	items: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
	description: string;
	quantity: number;
	unit_price: number;
}

export interface UpdateOrderInput {
	id: string;
	client_id?: string;
	status?: OrderStatus;
	notes?: string | null;
}

export interface CreateInvoiceInput {
	client_id: string;
	order_id?: string | null;
	invoice_type: InvoiceType;
	document_kind?: DocumentKind;
	related_invoice_id?: string | null;
	issue_date: string;
	issue_time?: string; // HH:MM:SS
	due_date: string;
	status?: InvoiceStatus;
	tax_rate?: number;
	notes?: string | null;
	payment_info?: { bank_name?: string | null; iban?: string | null } | null;
	items: CreateInvoiceItemInput[];
}

export interface CreateInvoiceItemInput {
	description: string;
	quantity: number;
	unit_price: number;
}

export interface UpdateInvoiceInput {
	id: string;
	client_id?: string;
	order_id?: string | null;
	invoice_type?: InvoiceType; // Invoice type: standard_tax, simplified_tax, or non_tax
	document_kind?: DocumentKind;
	related_invoice_id?: string | null;
	issue_date?: string;
	due_date?: string;
	status?: InvoiceStatus;
	tax_rate?: number; // Forced to 0 for non_tax invoices
	notes?: string | null;
}

// Dashboard statistics types
export interface DashboardStats {
	totalOrders: number;
	pendingOrders: number;
	totalRevenue: number;
	activeCustomers: number;
}

export interface MonthlyData {
	name: string; // Month name in Arabic
	orders: number;
	revenue: number;
}

export interface OrderStatusData {
	name: string; // Status name in Arabic
	value: number;
	color: string;
}

export interface CustomerData {
	name: string; // Customer type name in Arabic
	value: number;
}

// API response types
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	success: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	count: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// Supabase query types
export interface SupabaseQueryOptions {
	page?: number;
	pageSize?: number;
	orderBy?: string;
	orderDirection?: "asc" | "desc";
	filters?: Record<string, unknown>;
}

// Error types
export interface DatabaseError {
	code: string;
	message: string;
	details?: string;
	hint?: string;
}

// Utility types
export type TableName = keyof Database["public"]["Tables"];

export type Insertable<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type Updatable<T> = Partial<
	Omit<T, "id" | "created_at" | "updated_at">
> & { id: string };
