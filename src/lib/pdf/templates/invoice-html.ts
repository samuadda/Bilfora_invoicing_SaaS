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
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 2,
    }).format(amount);
}

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
}

export function generateInvoiceHtml(
    invoice: InvoiceWithClientAndItems,
    client: Client | null,
    items: InvoiceItem[]
) {
    const isTax = invoice.invoice_type === 'standard_tax' || invoice.invoice_type === 'simplified_tax';
    const total = Number(invoice.total_amount || 0);
    const subtotal = Number(invoice.subtotal || 0);
    const vat = Number(invoice.vat_amount || 0);

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Invoice #${safe(invoice.invoice_number)}</title>
    <style>
        /* @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap'); */

        :root {
            --primary: #7f2dfb;
            --text-dark: #012d46;
            --text-gray: #4b5563;
        }

        body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 0;
            color: var(--text-dark);
            font-size: 14px;
            line-height: 1.5;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
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
            margin-bottom: 2rem;
        }

        .meta-box h3 {
            color: var(--primary);
            font-size: 16px;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.25rem;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }

        .meta-label {
            font-weight: 600;
            color: var(--text-gray);
        }

        /* LTR isolation for numbers/dates */
        .ltr-iso {
            direction: ltr;
            unicode-bidi: isolate;
            font-family: sans-serif; /* Optional: distinct font for nums */
            text-align: left;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
        }

        thead {
            display: table-header-group;
        }

        th {
            background-color: var(--primary);
            color: white;
            padding: 12px;
            text-align: right; /* Default for RTL */
            font-weight: 600;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: var(--text-gray);
        }

        tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        /* Number columns alignment */
        .col-num {
            text-align: center;
        }
        
        .col-total {
            text-align: left; /* Align LTR numbers left visually in RTL context if preferred, or keep right */
             direction: ltr;
        }

        .totals-section {
            width: 50%;
            margin-right: auto; /* Push to left in RTL */
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
        
        /* Description text wrapping */
        .desc-cell {
            max-width: 300px;
            word-break: break-word;
            overflow-wrap: anywhere;
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
        <div>
            <h1 class="invoice-title">فاتورة ضريبية</h1>
            <div style="margin-top: 0.5rem; color: #6b7280;"># <span class="ltr-iso">${safe(invoice.invoice_number)}</span></div>
        </div>
        <div class="logo-area">
            <!-- Placeholder for Logo if available, using text for now -->
            Bilfora
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-box">
            <h3>المورد (Seller)</h3>
            <div class="meta-row">
                <span class="meta-label">الاسم:</span>
                <span>${safe("اسم المنشأة")}</span> <!-- TODO: Pass settings -->
            </div>
             <!-- Add VAT Number etc here from settings -->
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
                <th style="width: 40%">الوصف</th>
                <th style="width: 10%" class="col-num">الكمية</th>
                <th style="width: 15%" class="col-num">سعر الوحدة</th>
                ${isTax ? '<th style="width: 15%" class="col-num">الضريبة</th>' : ''}
                <th style="width: 15%" class="col-total">الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item, i) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const lineTotal = qty * unitPrice; // Simplified logic, should match production logic
        return `
                <tr>
                    <td>${i + 1}</td>
                    <td class="desc-cell">${safe(item.description)}</td>
                    <td class="col-num ltr-iso">${qty}</td>
                    <td class="col-num ltr-iso">${formatCurrency(unitPrice)}</td>
                     ${isTax ? `<td class="col-num ltr-iso">${invoice.tax_rate}%</td>` : ''}
                    <td class="col-total ltr-iso">${formatCurrency(item.total ? Number(item.total) : lineTotal)}</td>
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

    <!-- Notes -->
    ${invoice.notes ? `
    <div style="margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
        <strong>ملاحظات:</strong>
        <p style="white-space: pre-wrap; color: #4b5563;">${safe(invoice.notes)}</p>
    </div>
    ` : ''}

    <div class="footer">
        Generated by Bilfora
    </div>

</body>
</html>
    `;
}
