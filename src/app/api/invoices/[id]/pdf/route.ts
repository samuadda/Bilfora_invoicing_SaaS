export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getInvoiceForPdf } from "@/services/invoice-service";
import { generateInvoiceHtml } from "@/lib/pdf/templates/invoice-html";
import { generatePdf } from "@/lib/pdf/puppeteer";
import path from "path";
import fs from "fs";

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, props: Props) {
    const params = await props.params; // Ensure params are awaited
    const invoiceId = params.id;
    const supabase = await createClient();

    // 1. Auth Check
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Data (Secure Service)
    const data = await getInvoiceForPdf(invoiceId, user.id);

    if (!data) {
        // Return 404 to avoid ID probing
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }


    // ... previous imports

    try {
        // Read fonts (cached in memory in production ideally, but FS here is fine for serverless if not exceeding limits)
        const fontPathRegular = path.join(process.cwd(), 'public', 'fonts', 'Cairo-Regular.ttf');
        const fontPathBold = path.join(process.cwd(), 'public', 'fonts', 'Cairo-Bold.ttf');

        let fonts = undefined;
        try {
            if (fs.existsSync(fontPathRegular) && fs.existsSync(fontPathBold)) {
                fonts = {
                    regular: fs.readFileSync(fontPathRegular).toString('base64'),
                    bold: fs.readFileSync(fontPathBold).toString('base64'),
                };
            } else {
                console.warn("Fonts not found at:", fontPathRegular);
            }
        } catch (fontError) {
            console.error("Failed to load fonts:", fontError);
        }

        // 3. Generate HTML
        const html = generateInvoiceHtml(data.invoice, data.client, data.items, fonts);

        // 4. Generate PDF
        const pdfBuffer = await generatePdf(html);

        // 5. Return Response
        const filename = `invoice-${data.invoice.invoice_number || invoiceId}.pdf`;

        // Handle download query param ?download=1
        const { searchParams } = new URL(request.url);
        const forceDownload = searchParams.get('download') === '1';
        const disposition = forceDownload ? 'attachment' : 'inline';

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `${disposition}; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });

    } catch (error) {
        console.error("PDF Generation Detailed Error:", error);
        console.error("PDF Generation Detailed Error:", error);
        if ((error as Error).message) console.error("Error Message:", (error as Error).message);
        return NextResponse.json(
            { error: "Failed to generate PDF", details: String(error) },
            { status: 500 }
        );
    }
}
