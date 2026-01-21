import { InvoiceWithClientAndItems, Client, InvoiceItem } from "@/types/database";

// Simple sanitization
function safe(str?: string | null) {
    if (!str) return "";
    // Collapse whitespace and trim
    const normalized = str.replace(/\s+/g, ' ').trim();
    return normalized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount: number) {
    const val = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    return `<span style="font-weight:700">${val}</span> <span style="font-weight:400; font-size: 0.8em; color: #6b7280;">SAR</span>`;
}

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
}

export function generateInvoiceHtml(
    invoice: InvoiceWithClientAndItems,
    client: Client | null,
    items: InvoiceItem[],
    fonts?: { regular: string; bold: string }
) {
    const isTax = invoice.invoice_type === 'standard_tax' || invoice.invoice_type === 'simplified_tax';
    const total = Number(invoice.total_amount || 0);
    const subtotal = Number(invoice.subtotal || 0);
    const vat = Number(invoice.vat_amount || 0);

    // Using TTF format matching the downloaded files
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
    ` : `
        /* No external fallback to prevent network drift */
    `;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Invoice #${safe(invoice.invoice_number)}</title>
    <style>
        ${fontStyles}

        :root {
            --primary: #7f2dfb;
            --text-dark: #012d46;
            --text-gray: #4b5563;
        }

        body {
            font-family: 'Cairo', system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: var(--text-dark);
            font-size: 14px;
            line-height: 1.4;
            background: white;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1rem;
        }

        .logo-area {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary);
        }

        .invoice-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--text-dark);
            margin: 0;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 1.5rem;
        }

        .meta-box h3 {
            color: var(--primary);
            font-size: 15px;
            margin-bottom: 0.25rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.25rem;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
            align-items: center;
        }

        .meta-label {
            font-weight: 600;
            color: var(--text-gray);
            font-size: 13px;
        }

        /* Utils for direction and alignment */
        .ltr-iso {
            direction: ltr;
            unicode-bidi: isolate;
            text-align: left;
            white-space: nowrap;
        }

        .num {
            direction: ltr;
            unicode-bidi: isolate;
            text-align: left;
            white-space: nowrap;
        }

        .qty, .idx {
            direction: ltr;
            unicode-bidi: isolate;
            text-align: center;
            white-space: nowrap;
        }

        .desc {
            text-align: right;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
            direction: rtl;
        }

        thead {
            display: table-header-group;
        }
        
        tfoot {
            display: table-footer-group;
        }

        th {
            background-color: var(--primary);
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: 600;
            font-size: 13px;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            color: var(--text-gray);
        }

        tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .totals-section {
            width: 50%;
            margin-right: auto;
            background-color: #f9fafb;
            padding: 1.5rem;
            border-radius: 8px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 15px;
        }

        .total-row.final {
            font-weight: 800;
            font-size: 18px;
            color: var(--text-dark);
            border-top: 2px solid #e5e7eb;
            padding-top: 1rem;
            margin-top: 0.5rem;
        }

        .footer {
            margin-top: 3rem;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }
        
        .desc-cell {
            max-width: 300px;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        @page {
            size: A4;
            margin: 0;
        }
        
        @media print {
            body {
                background: white;
            }
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-area">
            Bilfora
        </div>
        <div>
            <h1 class="invoice-title">فاتورة ضريبية</h1>
            <div style="margin-top: 0.25rem; color: #6b7280; text-align: left;"># <span class="ltr-iso">${safe(invoice.invoice_number)}</span></div>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-box">
            <h3>المورد (Seller)</h3>
            <div class="meta-row">
                <span class="meta-label">الاسم:</span>
                <span>${safe("اسم المنشأة")}</span>
            </div>
        </div>
        
        <div class="meta-box">
             <h3>العميل (Buyer)</h3>
             ${client ? `
             <div class="meta-row">
                <span class="meta-label">الاسم:</span>
                <span>${safe(client.name)}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">الشركة:</span>
                <span>${safe(client.company_name)}</span>
            </div>
             ` : '<div>عميل نقدي</div>'}
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-box">
             <h3>تفاصيل الفاتورة</h3>
             <div class="meta-row">
                <span class="meta-label">تاريخ الإصدار:</span>
                <span class="ltr-iso">${formatDate(invoice.issue_date)}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">تاريخ الاستحقاق:</span>
                <span class="ltr-iso">${formatDate(invoice.due_date)}</span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">#</th>
                <th style="width: 40%" class="desc">الوصف</th>
                <th style="width: 10%">الكمية</th>
                <th style="width: 15%">سعر الوحدة</th>
                ${isTax ? '<th style="width: 15%">الضريبة</th>' : ''}
                <th style="width: 15%">الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item, i) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const lineTotalRaw = qty * unitPrice;
        const taxAmount = isTax ? (invoice.tax_rate ? lineTotalRaw * (invoice.tax_rate / 100) : 0) : 0;
        const lineTotal = isTax ? lineTotalRaw + taxAmount : lineTotalRaw;

        return `
                <tr>
                    <td class="idx">${i + 1}</td>
                    <td class="desc-cell desc">${safe(item.description)}</td>
                    <td class="qty">${qty}</td>
                    <td class="num">${formatCurrency(unitPrice)}</td>
                    ${isTax ? `<td class="num">${formatCurrency(taxAmount)}</td>` : ''}
                    <td class="num">${formatCurrency(item.total ? Number(item.total) : lineTotal)}</td>
                </tr>
                `;
    }).join('')}
        </tbody>
    </table>

    <div class="totals-section">
        <div class="total-row">
            <span>المجموع (Subtotal):</span>
            <span class="ltr-iso">${formatCurrency(subtotal)}</span>
        </div>
        ${isTax ? `
        <div class="total-row">
            <span>الضريبة (VAT):</span>
            <span class="ltr-iso">${formatCurrency(vat)}</span>
        </div>
        ` : ''}
        <div class="total-row final">
            <span>الإجمالي (Total):</span>
            <span class="ltr-iso">${formatCurrency(total)}</span>
        </div>
    </div>

    ${invoice.notes ? `
    <div style="margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
        <strong>ملاحظات:</strong>
        <p style="white-space: pre-wrap; color: #4b5563;">${safe(invoice.notes)}</p>
    </div>
    ` : ''}

    <div class="footer">
        Generated by <a href="https://bilfora.com" target="_blank" style="color: var(--primary);">Bilfora.com</a>
    </div>

</body>
</html>
    `;
}
