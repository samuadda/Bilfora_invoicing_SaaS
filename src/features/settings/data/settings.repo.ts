import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import {
  invoiceSettingsInputSchema,
  invoiceSettingsSchema,
  InvoiceSettings,
  InvoiceSettingsInput,
} from '../schemas/invoiceSettings.schema';

type DbClient = SupabaseClient<Database>;
const TABLE = 'invoice_settings';

export async function getInvoiceSettings(
  supabase: DbClient,
  userId: string,
): Promise<InvoiceSettings | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return invoiceSettingsSchema.parse(data);
}

export async function upsertInvoiceSettings(
  supabase: DbClient,
  userId: string,
  payload: InvoiceSettingsInput,
): Promise<InvoiceSettings> {
  let validated;
  try {
    validated = invoiceSettingsInputSchema.parse(payload);
  } catch (zodErr) {
    console.error("Zod input parse error:", zodErr);
    throw zodErr;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { ...validated, user_id: userId } as unknown as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) {
    console.error("Supabase settings upsert error:", error);
    throw error;
  }
  
  try {
    return invoiceSettingsSchema.parse(data);
  } catch(zodReturnErr) {
    console.error("Zod return parse error:", zodReturnErr);
    throw zodReturnErr;
  }
}

