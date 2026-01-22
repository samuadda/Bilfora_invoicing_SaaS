import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getInvoiceForPdf } from "@/services/invoice-service";
import { generateInvoiceHtml } from "@/lib/pdf/templates/invoice-html";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function readFontBase64(filename: string) {
    const fontPath = path.join(process.cwd(), "public", "fonts", filename);
    return fs.readFileSync(fontPath).toString("base64");
}

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ debug?: string }>;

export default async function InvoicePreviewPage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const supabase = await createClient();

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) redirect("/login");

    const invoiceId = params.id;

    // Secure fetch (verifies ownership inside service)
    const data = await getInvoiceForPdf(invoiceId, user.id);
    if (!data) redirect("/404"); // Or return notFound() which typically renders the 404 page

    const { invoice, client, items, seller } = data;

    // Load fonts server-side (same method as route.ts)
    let fonts = undefined;
    try {
        fonts = {
            regular: readFontBase64("Cairo-Regular.ttf"),
            bold: readFontBase64("Cairo-Bold.ttf"),
        };
    } catch (e) {
        console.error("Preview: Failed to load fonts", e);
    }

    const html = generateInvoiceHtml(invoice, client, items, fonts, seller);

    // Optional: overlay debug outlines via a tiny injected style tag.
    const debug = searchParams.debug === "1";
    const withDebug = debug
        ? html.replace(
            "</style>",
            `
/* Debug overlay */
* { outline: 1px dashed rgba(127,45,251,0.25); outline-offset: -1px; }
</style>`
        )
        : html;

    return (
        <div style={{ minHeight: "100vh", background: "#0b1220" }}>
            {/* Simple top bar for convenience */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    padding: "10px 14px",
                    background: "rgba(11,18,32,0.85)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "system-ui, -apple-system, Segoe UI, Arial",
                }}
            >
                <div style={{ fontWeight: 700 }}>
                    Invoice Preview — {invoice.invoice_number}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    {/* Using standard a tags for navigation to ensure full reload/isolation if needed, 
                though Link would work too. Keeping it simple as per request. */}
                    <a
                        href={`/dashboard/invoices/${invoiceId}`}
                        style={{ color: "white", textDecoration: "none", opacity: 0.9, padding: "8px 12px" }}
                    >
                        Back
                    </a>
                    <a
                        href={`/dashboard/invoices/${invoiceId}/preview?debug=${debug ? "0" : "1"}`}
                        style={{ color: "white", textDecoration: "none", opacity: 0.9, padding: "8px 12px" }}
                    >
                        {debug ? "Debug: Off" : "Debug: On"}
                    </a>
                    <a
                        href={`/api/invoices/${invoiceId}/pdf?download=1`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            background: "#7f2dfb",
                            padding: "8px 12px",
                            borderRadius: 10,
                            fontWeight: 700,
                        }}
                    >
                        Download PDF
                    </a>
                </div>
            </div>

            {/* Render the invoice HTML inside an iframe so it looks exactly like a real page */}
            <div style={{ padding: 18 }}>
                <div
                    style={{
                        maxWidth: 900,
                        margin: "0 auto",
                        background: "white",
                        borderRadius: 14,
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    }}
                >
                    <iframe
                        title="Invoice Preview"
                        style={{ width: "100%", height: "90vh", border: "0" }}
                        srcDoc={withDebug}
                    />
                </div>
            </div>
        </div>
    );
}
