/**
 * Feature Flags
 *
 * IS_ZATCA_ENABLED: When `true`, enables full ZATCA compliance features:
 *   - B2B/B2C invoice type selection (Standard Tax / Simplified Tax / Non-Tax)
 *   - Client type toggle (Individual / Organization)
 *   - Tax number validation & display
 *   - QR code placeholder in PDF
 *   - Tax columns in invoice table
 *
 * When `false` (Simple Beta mode):
 *   - All invoices default to a generic "فاتورة" (Invoice)
 *   - No tax logic (0% forced)
 *   - Simplified client form (name + contact only)
 *   - Clean PDF layout without ZATCA fields
 */
export const IS_ZATCA_ENABLED = false;
