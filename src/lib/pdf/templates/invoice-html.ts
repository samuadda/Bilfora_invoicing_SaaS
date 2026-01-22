import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { SellerProfile } from "@/services/invoice-service";

// Simple sanitization
function safe(str?: string | null) {
    if (!str) return "";
    const normalized = str.replace(/\s+/g, ' ').trim();
    return normalized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// SAR Symbol SVG as Base64 Data URI (inline for PDF rendering)
// SVG uses currentColor, but since we embed via img, we hardcode the fill color
const SAR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1124.14 1256.39" fill="%23COLOR%"><path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/></svg>`;

function getSarIconDataUri(color: string = "0f172a") {
    const svg = SAR_ICON_SVG.replace("%23COLOR%", `%23${color}`);
    return `data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22")}`;
}

function formatCurrency(amount: number, large = false) {
    const val = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    // Icon sizes: 12px for regular, 18px for large total
    const iconSize = large ? "18px" : "12px";
    const iconColor = large ? "0f172a" : "94a3b8"; // Primary for large, muted for regular
    const iconDataUri = getSarIconDataUri(iconColor);

    // Icon on LEFT of number (symbol first, then value)
    if (large) {
        return `<span style="display:inline-flex;align-items:center;gap:6px;direction:ltr;"><img src="${iconDataUri}" style="width:${iconSize};height:auto;vertical-align:middle;" alt="SAR"/><span class="total-amount">${val}</span></span>`;
    }
    return `<span style="display:inline-flex;align-items:center;gap:4px;direction:ltr;"><img src="${iconDataUri}" style="width:${iconSize};height:auto;vertical-align:middle;opacity:0.6;" alt="SAR"/><span style="font-weight:600;">${val}</span></span>`;
}


function formatDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB");
}

export function generateInvoiceHtml(
    invoice: InvoiceWithClientAndItems,
    client: Client | null,
    items: InvoiceItem[],
    fonts?: { regular: string; bold: string },
    seller?: SellerProfile | null
) {
    const isTax = invoice.invoice_type === 'standard_tax' || invoice.invoice_type === 'simplified_tax';
    const total = Number(invoice.total_amount || 0);
    const subtotal = Number(invoice.subtotal || 0);
    const vat = Number(invoice.vat_amount || 0);

    // Dynamic invoice title based on type
    const invoiceTitle = isTax ? "فاتورة ضريبية" : "فاتورة";

    // Seller: company_name fallback to full_name, then "اسم المستخدم"
    const sellerName = seller?.company_name || seller?.full_name || "اسم المستخدم";
    const sellerTaxNumber = seller?.tax_number || "";
    const sellerAddress = seller?.address || "";
    const sellerIban = seller?.iban || "";
    const sellerBankName = seller?.bank_name || "";

    // Buyer: company_name fallback to name
    const buyerName = client?.company_name || client?.name || "عميل نقدي";
    const buyerTaxNumber = client?.tax_number || "";
    const buyerAddress = client?.address || "";

    // Font embedding
    const fontStyles = fonts ? `
        @font-face {
            font-family: 'Cairo';
            src: url(data:font/ttf;base64,${fonts.regular}) format('truetype');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Cairo';
            src: url(data:font/ttf;base64,${fonts.bold}) format('truetype');
            font-weight: 700;
            font-style: normal;
        }
    ` : '';

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Invoice #${safe(invoice.invoice_number)}</title>
    <style>
        ${fontStyles}

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --border: #e2e8f0;
            --accent: #7f2dfb;
            --bg-subtle: #f8fafc;
        }

        body {
            font-family: 'Cairo', -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            padding: 48px;
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.6;
            background: white;
        }

        /* ─────────────────────────────────────────────────────────────
           TOP BAR - Logo (Right) and Invoice Title + Number (Left)
        ───────────────────────────────────────────────────────────── */
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
        }

        .brand {
            font-size: 28px;
            font-weight: 700;
            color: var(--accent);
            letter-spacing: -0.5px;
        }

        .invoice-header {
            text-align: left;
        }

        .invoice-title {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }

        .invoice-number {
            font-size: 14px;
            color: var(--text-muted);
            direction: ltr;
            unicode-bidi: isolate;
        }

        /* ─────────────────────────────────────────────────────────────
           INFO GRID - 3 Column Editorial Layout
        ───────────────────────────────────────────────────────────── */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 32px;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
        }

        .info-column {
            /* Clean column styling */
        }

        .info-column.meta {
            text-align: left;
        }

        .column-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }

        .party-name {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 6px;
            line-height: 1.3;
        }

        .party-detail {
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 4px;
            line-height: 1.5;
        }

        .party-detail.vat {
            font-size: 12px;
            color: var(--text-muted);
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 8px 0;
            font-size: 14px;
        }

        .meta-label {
            color: var(--text-muted);
            font-size: 12px;
        }

        .meta-value {
            color: var(--text-primary);
            font-weight: 600;
            direction: ltr;
            unicode-bidi: isolate;
        }

        /* ─────────────────────────────────────────────────────────────
           TABLE - Minimalist with thick header border, RTL aligned
        ───────────────────────────────────────────────────────────── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
        }

        thead tr {
            border-bottom: 3px solid var(--text-primary);
        }

        th {
            background: transparent;
            color: var(--text-primary);
            padding: 16px 12px;
            text-align: right;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        th.center { text-align: center; }
        th.left { text-align: left; direction: ltr; }

        td {
            padding: 20px 12px;
            border-bottom: 1px solid var(--border);
            color: var(--text-secondary);
            font-size: 15px;
            vertical-align: top;
        }

        td.center { text-align: center; direction: ltr; unicode-bidi: isolate; }
        td.left { text-align: left; direction: ltr; unicode-bidi: isolate; }

        .item-desc {
            color: var(--text-primary);
            font-weight: 500;
            max-width: 320px;
            word-break: break-word;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        /* ─────────────────────────────────────────────────────────────
           TOTALS - Massive total, positioned on left (RTL right visual)
        ───────────────────────────────────────────────────────────── */
        .totals-wrapper {
            display: flex;
            justify-content: flex-start;
            margin-top: 24px;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .totals-section {
            width: 320px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 10px 0;
            font-size: 15px;
            color: var(--text-secondary);
        }

        .totals-row.subtotal {
            border-bottom: 1px solid var(--border);
        }

        .totals-row.final {
            padding-top: 20px;
            margin-top: 8px;
            border-top: 2px solid var(--text-primary);
        }

        .totals-label {
            font-weight: 500;
        }

        .totals-value {
            direction: ltr;
            unicode-bidi: isolate;
            font-weight: 600;
        }

        .total-amount {
            font-size: 32px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.5px;
        }

        .currency-label {
            font-size: 16px;
            font-weight: 500;
            color: var(--text-muted);
            margin-right: 4px;
        }

        /* ─────────────────────────────────────────────────────────────
           NOTES - Simple and subtle
        ───────────────────────────────────────────────────────────── */
        .notes-section {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .notes-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .notes-content {
            font-size: 14px;
            color: var(--text-secondary);
            white-space: pre-wrap;
            line-height: 1.7;
        }

        /* ─────────────────────────────────────────────────────────────
           PAYMENT DETAILS - Bank section footer
        ───────────────────────────────────────────────────────────── */
        .payment-section {
            margin-top: 48px;
            padding: 24px;
            background: var(--bg-subtle);
            border: 1px solid var(--border);
            border-radius: 8px;
            break-inside: avoid;
        }

        .payment-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }

        .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            border-bottom: 1px solid var(--border);
        }

        .payment-row:last-child {
            border-bottom: none;
        }

        .payment-label {
            color: var(--text-muted);
            font-size: 13px;
        }

        .payment-value {
            color: var(--text-primary);
            font-weight: 600;
            direction: ltr;
            unicode-bidi: isolate;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
        }

        /* ─────────────────────────────────────────────────────────────
           FOOTER - Minimal branding
        ───────────────────────────────────────────────────────────── */
        .footer {
            margin-top: 64px;
            text-align: center;
            color: var(--text-muted);
            font-size: 12px;
        }

        .footer a {
            color: var(--accent);
            text-decoration: none;
        }

        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            body {
                padding: 40px;
            }
        }
    </style>
</head>
<body>

    <!-- TOP BAR: Logo + Invoice Title -->
    <div class="top-bar">
        <div class="brand">Bilfora</div>
        <div class="invoice-header">
            <h1 class="invoice-title">${invoiceTitle}</h1>
            <div class="invoice-number"># ${safe(invoice.invoice_number)}</div>
        </div>
    </div>

    <!-- INFO GRID: 3-Column Editorial Layout -->
    <div class="info-grid">
        <!-- Column 1: From (Seller) -->
        <div class="info-column">
            <div class="column-label">مِن</div>
            <div class="party-name">${safe(sellerName)}</div>
            ${sellerAddress ? `<div class="party-detail">${safe(sellerAddress)}</div>` : ''}
            ${sellerTaxNumber ? `<div class="party-detail vat">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(sellerTaxNumber)}</span></div>` : ''}
            ${seller?.phone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate;">${safe(seller.phone)}</div>` : ''}
        </div>

        <!-- Column 2: To (Buyer) -->
        <div class="info-column">
            <div class="column-label">إلى</div>
            <div class="party-name">${safe(buyerName)}</div>
            ${client?.name && client?.company_name ? `<div class="party-detail">${safe(client.name)}</div>` : ''}
            ${buyerAddress ? `<div class="party-detail">${safe(buyerAddress)}</div>` : ''}
            ${buyerTaxNumber ? `<div class="party-detail vat">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(buyerTaxNumber)}</span></div>` : ''}
            ${client?.phone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate;">${safe(client.phone)}</div>` : ''}
        </div>

        <!-- Column 3: Meta (Dates, Tax Rate) -->
        <div class="info-column meta">
            <div class="column-label">التفاصيل</div>
            <div class="meta-row">
                <span class="meta-label">تاريخ الإصدار</span>
                <span class="meta-value">${formatDate(invoice.issue_date)}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">تاريخ الاستحقاق</span>
                <span class="meta-value">${formatDate(invoice.due_date)}</span>
            </div>
            ${isTax ? `
            <div class="meta-row">
                <span class="meta-label">معدل الضريبة</span>
                <span class="meta-value">${invoice.tax_rate || 15}%</span>
            </div>
            ` : ''}
        </div>
    </div>

    <!-- ITEMS TABLE -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%" class="center">#</th>
                <th style="width: ${isTax ? '35%' : '45%'}">الوصف</th>
                <th style="width: 10%" class="center">الكمية</th>
                <th style="width: 15%" class="left">السعر</th>
                ${isTax ? '<th style="width: 15%" class="left">الضريبة</th>' : ''}
                <th style="width: 15%" class="left">الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item, i) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const lineTotalRaw = qty * unitPrice;
        const taxAmount = isTax ? (invoice.tax_rate ? lineTotalRaw * (invoice.tax_rate / 100) : 0) : 0;
        const lineTotal = item.total ? Number(item.total) : (isTax ? lineTotalRaw + taxAmount : lineTotalRaw);

        return `
                <tr>
                    <td class="center">${i + 1}</td>
                    <td class="item-desc">${safe(item.description)}</td>
                    <td class="center">${qty}</td>
                    <td class="left">${formatCurrency(unitPrice)}</td>
                    ${isTax ? `<td class="left">${formatCurrency(taxAmount)}</td>` : ''}
                    <td class="left">${formatCurrency(lineTotal)}</td>
                </tr>
                `;
    }).join('')}
        </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals-wrapper">
        <div class="totals-section">
            <div class="totals-row subtotal">
                <span class="totals-label">المجموع الفرعي</span>
                <span class="totals-value">${formatCurrency(subtotal)}</span>
            </div>
            ${isTax ? `
            <div class="totals-row">
                <span class="totals-label">ضريبة القيمة المضافة (${invoice.tax_rate || 15}%)</span>
                <span class="totals-value">${formatCurrency(vat)}</span>
            </div>
            ` : ''}
            <div class="totals-row final">
                <span class="totals-label" style="font-size: 18px; font-weight: 700; color: var(--text-primary);">الإجمالي</span>
                <span class="totals-value">${formatCurrency(total, true)}</span>
            </div>
        </div>
    </div>

    ${invoice.notes ? `
    <!-- NOTES -->
    <div class="notes-section">
        <div class="notes-label">ملاحظات</div>
        <div class="notes-content">${safe(invoice.notes)}</div>
    </div>
    ` : ''}

    ${(sellerIban || sellerBankName) ? `
    <!-- PAYMENT DETAILS -->
    <div class="payment-section">
        <div class="payment-title">تفاصيل الدفع</div>
        ${sellerBankName ? `
        <div class="payment-row">
            <span class="payment-label">اسم البنك</span>
            <span class="payment-value" style="font-family: inherit; direction: rtl;">${safe(sellerBankName)}</span>
        </div>
        ` : ''}
        ${sellerIban ? `
        <div class="payment-row">
            <span class="payment-label">رقم الآيبان (IBAN)</span>
            <span class="payment-value">${safe(sellerIban)}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <!-- FOOTER -->
    <div class="footer">
        Generated by <a href="https://bilfora.com" target="_blank">Bilfora</a>
    </div>

</body>
</html>
    `;
}
