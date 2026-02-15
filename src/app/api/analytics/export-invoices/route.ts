export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query with date filters
    let query = supabase
      .from('invoices')
      .select(`
        invoice_number,
        total_amount,
        status,
        issue_date,
        due_date,
        tax_amount,
        subtotal,
        created_at,
        clients!inner(name)
      `)
      .eq('user_id', user.id);

    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    // Transform data for export
    const exportData = data?.map(invoice => {
      // clients is returned as object with inner join - cast through unknown for safety
      const clientData = invoice.clients as unknown as { name: string } | null;
      return {
        invoice_number: invoice.invoice_number,
        client_name: clientData?.name || 'غير محدد',
        total_amount: invoice.total_amount || 0,
        status: invoice.status,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        tax_amount: invoice.tax_amount || 0,
        subtotal: invoice.subtotal || 0,
        created_at: invoice.created_at || invoice.issue_date
      };
    }) || [];

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
