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
  const validated = invoiceSettingsInputSchema.parse(payload);

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      // Cast to any to work around schema mismatch - the validated data matches
      // the actual database schema, but the generated types may be out of sync
      { ...validated, user_id: userId } as unknown as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw error;
  return invoiceSettingsSchema.parse(data);
}

