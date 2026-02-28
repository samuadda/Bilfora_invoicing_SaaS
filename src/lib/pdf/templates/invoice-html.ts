import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";
import { SellerProfile } from "@/services/invoice-service";
import { IS_ZATCA_ENABLED } from "@/config/features";

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

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
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
    const total = Number(invoice.total_amount || 0);
    const subtotal = Number(invoice.subtotal || 0);
    const vat = Number(invoice.vat_amount || 0);
    const taxRate = invoice.tax_rate || 0;

    // ─────────────────────────────────────────────────────────────
    // 1. DETERMINE INVOICE MODE & TITLE (Deepmind Fix)
    // ─────────────────────────────────────────────────────────────
    // Strict Mode Logic
    let invoiceTitle = "فاتورة"; // Default (Non-Tax)

    // Explicit conditions
    const isTax = vat > 0;
    const isOrg = !!client?.tax_number;

    if (isTax) {
        if (isOrg) {
            invoiceTitle = "فاتورة ضريبية"; // Mode A: Tax Invoice (B2B)
        } else {
            invoiceTitle = "فاتورة ضريبية مبسطة"; // Mode B: Simplified Tax Invoice (B2C)
        }
    }

    // Derived flags for layout
    let isTaxMode = isTax; // General flag for showing tax columns
    let showBuyerVat = isTax && isOrg; // Only show Buyer VAT in B2B Tax Invoice
    let showQrPlaceholder = isTax; // Show QR in tax modes

    // ── Simple Beta: force clean layout ──────────────────────────────────────
    if (!IS_ZATCA_ENABLED) {
        invoiceTitle = "فاتورة"; // Generic "Invoice"
        isTaxMode = false;
        showBuyerVat = false;
        showQrPlaceholder = false;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. HELPER: Issue Time
    // ─────────────────────────────────────────────────────────────
    function getFormattedTime(dateStr?: string | null, timeStr?: string | null): string {
        // 1. Try explicit time field
        if (timeStr && timeStr.length >= 5) {
            return timeStr.substring(0, 5); // HH:mm
        }

        // 2. Try extracting from date string if ISO
        if (dateStr && dateStr.includes('T')) {
            try {
                const date = new Date(dateStr);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                // Avoid 00:00 default
                if (hours !== 0 || minutes !== 0) {
                    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
            } catch { /* ignore */ }
        }

        // 3. Fallback: Current Time (Temporary Quick Fix for ZATCA validation)
        const now = new Date();
        return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const issueTime = getFormattedTime(invoice.issue_date, invoice.issue_time);

    // Seller Info
    const sellerName = seller?.company_name || seller?.full_name || "اسم المستخدم";
    const sellerTaxNumber = seller?.tax_number || "";
    const sellerAddress = seller?.address || "";
    const sellerIban = seller?.iban || "";
    const sellerBankName = seller?.bank_name || "";
    const sellerPhone = seller?.phone || "";

    // Buyer Info
    const buyerName = client?.company_name || client?.name || "عميل نقدي";
    const buyerTaxNumber = client?.tax_number || "";
    const buyerAddress = client?.address || "";
    const buyerPhone = client?.phone || "";

    // Font embedding (Using Vazirmatn via Google Fonts to exact match the web app)
    const fontStyles = fonts ? `
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        :root {
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --border: #e2e8f0;
            --accent: ${seller?.brand_color || '#7f2dfb'};
            --bg-subtle: #f8fafc;
            --bg-qr: #f1f5f9;
        }

        body {
            font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 32px 48px; /* Reduced vertical padding from 48px */
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.5; /* Tighter line height */
            background: white;
            box-sizing: border-box;
        }

        /* ─────────────────────────────────────────────────────────────
           TOP BAR
        ───────────────────────────────────────────────────────────── */
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px; /* Reduced from 48px */
            padding-bottom: 16px; /* Reduced from 24px */
            border-bottom: 1px solid var(--border);
            position: relative;
        }

        .brand-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .brand {
            font-size: 28px;
            font-weight: 700;
            color: var(--accent);
            letter-spacing: -0.5px;
        }

        .invoice-type-tag {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            background: var(--bg-subtle);
            padding: 4px 8px;
            border-radius: 4px;
            width: fit-content;
        }

        .invoice-header-col {
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .invoice-title {
            font-size: 26px; /* Slightly smaller to fit long arabic titles */
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

        .qr-placeholder {
            width: 100px;
            height: 100px;
            background-color: var(--bg-qr);
            border: 1px dashed var(--text-muted);
            border-radius: 8px;
            margin-top: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            font-size: 10px;
            text-align: center;
            overflow: hidden;
            flex-shrink: 0;
        }

        /* ─────────────────────────────────────────────────────────────
           INFO GRID
        ───────────────────────────────────────────────────────────── */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px; /* Reduced from 32px */
            margin-bottom: 20px; /* Reduced from 24px */
        }

        .column-label {
            font-size: 13.6px;
            font-weight: 600;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0px;
            margin-bottom: 4px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 4px;
        }

        .party-name {
            font-size: 16px;
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
            margin-top: 4px;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 8px 0;
            font-size: 14px;
            border-bottom: 1px dashed var(--border);
        }
        .meta-row:last-child { border-bottom: none; }

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
           TABLE
        ───────────────────────────────────────────────────────────── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px; /* Reduced from 32px */
        }

        th {
            background: var(--accent);
            color: white;
            padding: 12px 16px; /* Reduced Y-padding from 16px */
            text-align: right;
            font-weight: 700;
            font-size: 13px;
        }
        th.center { text-align: center; }
        th.left { text-align: left; direction: ltr; }
        th.tax-col { color: white; font-size: 13px; font-weight: 600; }

        td {
            padding: 12px 16px; /* Reduced Y-padding from 16px */
            border-bottom: 1px solid var(--border);
            color: var(--text-secondary); /* Matches INVOICE_TOKENS.textGray */
            font-size: 14px;
            vertical-align: top;
        }

        td.center { text-align: center; direction: ltr; unicode-bidi: isolate; }
        td.left { text-align: left; direction: ltr; unicode-bidi: isolate; }
        td.tax-col { color: var(--text-muted); font-size: 14px; }
        td.total-col { color: var(--text-secondary); font-size: 14px; font-weight: 400; }

        .item-desc {
            color: var(--text-primary);
            font-weight: 500;
            max-width: 300px;
            word-break: break-all;
        }

        /* ─────────────────────────────────────────────────────────────
           TOTALS
        ───────────────────────────────────────────────────────────── */
        .totals-wrapper {
            display: flex;
            justify-content: flex-end; /* Visual Left */
            margin-top: 8px; /* Web preview has small margin */
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .totals-section {
            width: 50%;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 12px 0;
            font-size: 15px; /* ~0.95rem */
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
        }

        .totals-row.subtotal {
            border-bottom: 1px solid var(--border);
        }

        .totals-row.final {
            padding-top: 24px;
            padding-bottom: 24px;
            margin-top: 8px;
            border-top: 2px solid var(--text-primary);
            border-bottom: none;
        }

        .totals-label {
            font-weight: 500;
        }

        .totals-value {
            direction: ltr;
            unicode-bidi: isolate;
            font-weight: 600;
            color: var(--text-primary);
        }

        .total-amount {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-primary);
        }

        /* ─────────────────────────────────────────────────────────────
           FOOTER & BANK
        ───────────────────────────────────────────────────────────── */
        .payment-section {
            margin-top: 32px; /* Reduced from 48px */
            padding: 16px 24px; /* Reduced Y-padding */
            background: var(--bg-subtle);
            border: 1px solid var(--border);
            border-radius: 8px;
            break-inside: avoid;
        }
        
        .payment-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px; /* Reduced from 16px */
        }
        
        .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0; /* Reduced from 8px */
            font-size: 14px;
            border-bottom: 1px solid var(--border);
        }
        .payment-row:last-child { border-bottom: none; }

        .payment-label { color: var(--text-muted); font-size: 13px; }
        .payment-value { color: var(--text-primary); font-weight: 600; direction: ltr; font-family: 'Courier New', monospace; }

        .footer {
            margin-top: 32px; /* Reduced from 64px */
            text-align: center;
            color: var(--text-muted);
            font-size: 12px;
            border-top: 1px solid var(--border);
            padding-top: 16px; /* Reduced from 24px */
        }

        .footer a { color: var(--accent); text-decoration: none; }

        @page { size: A4; margin: 0; }
        
        @media print {
            html, body {
                margin: 0 !important;
                width: 210mm !important;
                min-height: 297mm !important;
            }
            body {
                padding: 32px 48px !important; /* Update print padding match */
            }
        }
    </style>
</head>
<body>

    <!-- TOP BAR -->
    <div class="top-bar">
        <div class="brand-col">
            ${seller?.logo_url 
                ? `<img src="${safe(seller.logo_url)}" alt="Logo" style="max-height: 80px; max-width: 200px; object-fit: contain; margin-bottom: 8px;" />` 
                : `<div class="brand">${safe(seller?.company_name || 'Bilfora')}</div>`
            }
            ${IS_ZATCA_ENABLED && sellerTaxNumber ? `<div class="invoice-type-tag" style="direction:ltr">VAT: ${safe(sellerTaxNumber)}</div>` : ''}
            ${!IS_ZATCA_ENABLED && seller?.cr_number ? `<div class="invoice-type-tag" style="direction:ltr">C.R: ${safe(seller.cr_number)}</div>` : ''}
        </div>
        
        <div class="invoice-header-col">
            <h1 class="invoice-title">${invoiceTitle}</h1>
            <div class="invoice-number"># ${safe(invoice.invoice_number)}</div>
            ${showQrPlaceholder ? `
            <div class="qr-placeholder">
                <div>QR Code Area<br>(ZATCA)</div>
            </div>
            ` : ''}
        </div>
    </div>

    <!-- INFO GRID -->
    <div class="info-grid">
        <!-- Seller Info -->
        <div class="info-column">
            <div class="column-label">مِن (البائع)</div>
            <div class="party-name">${safe(sellerName)}</div>
            ${sellerAddress ? `<div class="party-detail">${safe(sellerAddress)}</div>` : ''}
            ${sellerPhone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate; text-align:right;">${safe(sellerPhone)}</div>` : ''}
            ${IS_ZATCA_ENABLED && sellerTaxNumber ? `<div class="party-detail vat">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(sellerTaxNumber)}</span></div>` : ''}
            ${!IS_ZATCA_ENABLED && seller?.cr_number ? `<div class="party-detail vat">س.ت: <span style="direction:ltr; unicode-bidi:isolate;">${safe(seller.cr_number)}</span></div>` : ''}
        </div>

        <!-- Buyer Info -->
        <div class="info-column">
            <div class="column-label">إلى (العميل)</div>
            <div class="party-name">${safe(buyerName)}</div>
            ${buyerAddress ? `<div class="party-detail">${safe(buyerAddress)}</div>` : ''}
            ${buyerPhone ? `<div class="party-detail" style="direction:ltr; unicode-bidi:isolate; text-align:right;">${safe(buyerPhone)}</div>` : ''}
            
            <!-- Buyer VAT only for Tax Invoice (B2B) -->
            ${showBuyerVat && buyerTaxNumber ? `
                <div class="party-detail vat">الرقم الضريبي: <span style="direction:ltr; unicode-bidi:isolate;">${safe(buyerTaxNumber)}</span></div>
            ` : ''}
        </div>
    </div>

    <!-- META INFO GRID -->
    <div class="info-grid">
        <!-- Meta Info -->
        <div class="info-column meta">
            <div class="column-label">التفاصيل</div>
            <div class="meta-row">
                <span class="meta-label">تاريخ الإصدار</span>
                <span class="meta-value">
                    ${formatDate(invoice.issue_date)}
                    <span style="color: var(--text-muted); font-size: 13px; margin-right: 6px; font-weight: 500;">${issueTime}</span>
                </span>
            </div>
            <div class="meta-row">
                <span class="meta-label">تاريخ الاستحقاق</span>
                <span class="meta-value">${formatDate(invoice.due_date)}</span>
            </div>
        </div>
        
        <!-- Empty cell to match two columns -->
        <div></div>
    </div>

    <!-- ITEMS TABLE -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%" class="center">#</th>
                <th style="width: ${isTaxMode ? '35%' : '45%'}">الوصف</th>
                <th style="width: 10%" class="center">الكمية</th>
                <th style="width: 15%" class="left">${IS_ZATCA_ENABLED ? 'سعر الوحدة' : 'السعر'}</th>
                ${isTaxMode ? `<th style="width: 15%" class="left tax-col">الضريبة (${taxRate}%)</th>` : ''}
                <th style="width: 15%" class="left">الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item, i) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;

        // For layout purposes:
        // Pre-vat total
        const lineTotalPreTax = qty * unitPrice;

        // Tax amount
        let lineTaxAmount = 0;
        if (isTaxMode && taxRate > 0) {
            lineTaxAmount = lineTotalPreTax * (taxRate / 100);
        }

        // Final Total
        // If item has a specific total override from DB, use it, else calculate
        // But in ZATCA strict mode, calculation should be consistent.
        const lineTotalFinal = item.total ? Number(item.total) : (lineTotalPreTax + lineTaxAmount);

        return `
                <tr>
                    <td class="center">${i + 1}</td>
                    <td class="item-desc">${safe(item.description)}</td>
                    <td class="center">${qty}</td>
                    <td class="left">${formatCurrency(unitPrice)}</td>
                    ${isTaxMode ? `<td class="left tax-col">${formatCurrency(lineTaxAmount)}</td>` : ''}
                    <td class="left total-col">${formatCurrency(lineTotalFinal)}</td>
                </tr>
                `;
    }).join('')}
        </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals-wrapper">
        <div class="totals-section">
            <div class="totals-row subtotal">
                <span class="totals-label">${IS_ZATCA_ENABLED ? 'المجموع (Subtotal):' : 'المجموع (Subtotal):'}</span>
                <span class="totals-value">${formatCurrency(subtotal)}</span>
            </div>
            
            ${isTaxMode && taxRate > 0 ? `
            <div class="totals-row">
                <span class="totals-label">الضريبة (VAT):</span>
                <span class="totals-value">${formatCurrency(vat)}</span>
            </div>
            ` : ''}

            <div class="totals-row final">
                <span class="totals-label" style="font-size: 18px; font-weight: 800; color: var(--text-primary);">الإجمالي (Total):</span>
                <span class="totals-value total-amount">${formatCurrency(total)}</span>
            </div>
        </div>
    </div>

    ${invoice.notes ? `
    <div style="margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px;">
        <div class="column-label">ملاحظات</div>
        <div style="font-size: 14px; color: var(--text-secondary); white-space: pre-wrap;">${safe(invoice.notes)}</div>
    </div>
    ` : ''}

    ${(sellerIban || sellerBankName) ? `
    <div class="payment-section">
        <div class="payment-title">تفاصيل الحساب البنكي</div>
        ${sellerBankName ? `
        <div class="payment-row">
            <span class="payment-label">اسم البنك</span>
            <span class="payment-value" style="font-family: inherit; direction: rtl;">${safe(sellerBankName)}</span>
        </div>
        ` : ''}
        ${sellerIban ? `
        <div class="payment-row">
            <span class="payment-label">IBAN</span>
            <span class="payment-value">${safe(sellerIban)}</span>
        </div>
        ` : ''}
        ${seller?.payment_notes ? `
        <div class="payment-row" style="margin-top: 8px; display: block;">
            <div class="payment-label" style="margin-bottom: 4px;">ملاحظات الدفع</div>
            <div class="payment-value" style="white-space: pre-wrap; font-size: 13px;">${safe(seller.payment_notes)}</div>
        </div>
        ` : ''}
    </div>
    ` : ''}

    ${seller?.invoice_footer ? `
    <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--text-secondary);">
        ${safe(seller.invoice_footer)}
    </div>
    ` : ''}

    <div class="footer">
        تم الإنشاء بواسطة منصة <a href="https://bilfora.com" target="_blank">Bilfora</a> للفواتير الإلكترونية
    </div>

</body>
</html>
    `;
}
