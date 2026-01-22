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

function formatCurrency(amount: number, large = false) {
    const val = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    if (large) {
        return `<span class="total-amount">${val}</span> <span class="currency-label">SAR</span>`;
    }
    return `<span style="font-weight: 600">${val}</span> <span style="color: #9ca3af; font-size: 0.85em">SAR</span>`;
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

    // Seller: company_name fallback to full_name
    const sellerName = seller?.company_name || seller?.full_name || "—";
    const sellerTaxNumber = seller?.tax_number || "";

    // Buyer: company_name fallback to name
    const buyerName = client?.company_name || client?.name || "عميل نقدي";
    const buyerTaxNumber = client?.tax_number || "";

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
           HEADER - Clean and minimal
        ───────────────────────────────────────────────────────────── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 48px;
        }

        .brand {
            font-size: 28px;
            font-weight: 700;
            color: var(--accent);
            letter-spacing: -0.5px;
        }

        .invoice-meta {
            text-align: left;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }

        .invoice-number {
            font-size: 15px;
            color: var(--text-muted);
            direction: ltr;
            unicode-bidi: isolate;
        }

        /* ─────────────────────────────────────────────────────────────
           PARTIES - Clean two-column layout (From / To)
        ───────────────────────────────────────────────────────────── */
        .parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            margin-bottom: 48px;
        }

        .party-section {
            /* No boxes, no backgrounds - just clean text */
        }

        .party-label {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        .party-name {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .party-detail {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 2px;
        }

        /* ─────────────────────────────────────────────────────────────
           DATES - Inline simple layout
        ───────────────────────────────────────────────────────────── */
        .dates-row {
            display: flex;
            gap: 48px;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
        }

        .date-item {
            display: flex;
            flex-direction: column;
        }

        .date-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 4px;
        }

        .date-value {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
            direction: ltr;
            unicode-bidi: isolate;
        }

        /* ─────────────────────────────────────────────────────────────
           TABLE - Minimalist with thick header border
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
            font-size: 13px;
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
            font-size: 13px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .notes-content {
            font-size: 14px;
            color: var(--text-secondary);
            white-space: pre-wrap;
            line-height: 1.7;
        }

        /* ─────────────────────────────────────────────────────────────
           BANK DETAILS - Footer section
        ───────────────────────────────────────────────────────────── */
        .bank-section {
            margin-top: 48px;
            padding: 24px;
            background: #f8fafc;
            border-radius: 8px;
            break-inside: avoid;
        }

        .bank-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }

        .bank-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
        }

        .bank-label {
            color: var(--text-muted);
        }

        .bank-value {
            color: var(--text-primary);
            font-weight: 600;
            direction: ltr;
            unicode-bidi: isolate;
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

    <!-- HEADER -->
    <div class="header">
        <div class="brand">Bilfora</div>
        <div class="invoice-meta">
            <h1 class="invoice-title">${invoiceTitle}</h1>
            <div class="invoice-number"># ${safe(invoice.invoice_number)}</div>
        </div>
    </div>

    <!-- FROM / TO PARTIES -->
    <div class="parties">
        <div class="party-section">
            <div class="party-label">من</div>
            <div class="party-name">${safe(sellerName)}</div>
            ${sellerTaxNumber ? `<div class="party-detail">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(sellerTaxNumber)}</span></div>` : ''}
            ${seller?.address ? `<div class="party-detail">${safe(seller.address)}</div>` : ''}
            ${seller?.phone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate;">${safe(seller.phone)}</div>` : ''}
        </div>
        
        <div class="party-section">
            <div class="party-label">إلى</div>
            <div class="party-name">${safe(buyerName)}</div>
            ${client?.name && client?.company_name ? `<div class="party-detail">${safe(client.name)}</div>` : ''}
            ${buyerTaxNumber ? `<div class="party-detail">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(buyerTaxNumber)}</span></div>` : ''}
            ${client?.phone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate;">${safe(client.phone)}</div>` : ''}
        </div>
    </div>

    <!-- DATES -->
    <div class="dates-row">
        <div class="date-item">
            <span class="date-label">تاريخ الإصدار</span>
            <span class="date-value">${formatDate(invoice.issue_date)}</span>
        </div>
        <div class="date-item">
            <span class="date-label">تاريخ الاستحقاق</span>
            <span class="date-value">${formatDate(invoice.due_date)}</span>
        </div>
        ${isTax ? `
        <div class="date-item">
            <span class="date-label">معدل الضريبة</span>
            <span class="date-value">${invoice.tax_rate || 15}%</span>
        </div>
        ` : ''}
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

    <!-- FOOTER -->
    <div class="footer">
        Generated by <a href="https://bilfora.com" target="_blank">Bilfora</a>
    </div>

</body>
</html>
    `;
}
