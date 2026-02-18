import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from '@/utils/numberToWords';
import { useMemo } from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const formatNumber = (amount: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const totals = useMemo(() => ({
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  }), [invoice.items]);

  // Group items by HSN code for tax breakdown
  const hsnBreakdown = useMemo(() => {
    const map = new Map<string, { hsn: string; taxableAmount: number; cgstRate: number; cgstAmount: number; sgstRate: number; sgstAmount: number; total: number }>();
    invoice.items.forEach(item => {
      const hsn = item.hsnCode || '-';
      const existing = map.get(hsn);
      if (existing) {
        existing.taxableAmount += item.amount;
        existing.cgstAmount += item.cgstAmount;
        existing.sgstAmount += item.sgstAmount;
        existing.total += item.total;
      } else {
        map.set(hsn, {
          hsn,
          taxableAmount: item.amount,
          cgstRate: item.cgstPercent,
          cgstAmount: item.cgstAmount,
          sgstRate: item.sgstPercent,
          sgstAmount: item.sgstAmount,
          total: item.total,
        });
      }
    });
    return Array.from(map.values());
  }, [invoice.items]);

  const amountInWords = useMemo(() => {
    const words = numberToWords(invoice.grandTotal);
    // Clean up: remove duplicate "Rupees"/"Only" if present
    return words
      .replace(/Rupees\s*/gi, '')
      .replace(/\s*Only\s*/gi, '')
      .trim();
  }, [invoice.grandTotal]);

  const MIN_ROWS = 20;
  const emptyRows = Math.max(0, MIN_ROWS - invoice.items.length);

  const cellStyle = 'border: 1px solid black; padding: 4px 8px; vertical-align: middle;';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          #invoice-preview { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
        #invoice-preview, #invoice-preview * {
          font-family: 'Inter', Arial, Helvetica, sans-serif;
        }
        #invoice-preview table { border-collapse: collapse; }
        #invoice-preview th, #invoice-preview td {
          border: 1px solid black;
          padding: 4px 8px;
          vertical-align: middle;
          font-size: 11px;
        }
      `}} />

      <div
        id="invoice-preview"
        style={{
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          backgroundColor: 'white',
          padding: '12mm 15mm',
          color: 'black',
          fontSize: '12px',
          boxSizing: 'border-box',
        }}
        className="bg-white mx-auto shadow-lg print:shadow-none"
      >
        {/* Header */}
        <div style={{ borderBottom: '2px solid black', paddingBottom: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginBottom: '4px' }}>
            <span>GSTIN NO - 24CMAPK3117Q1ZZ</span>
            <span>79907 13846 94283 19484</span>
          </div>
          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px', margin: '0' }}>
            SK ENTERPRISE
          </h1>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#333', marginTop: '4px' }}>
            SHOP NO 28, SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR
          </p>
        </div>

        {/* Tax Invoice Title */}
        <table style={{ width: '100%', marginBottom: '12px' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', letterSpacing: '2px', padding: '6px 0' }}>
                TAX INVOICE
              </td>
            </tr>
          </tbody>
        </table>

        {/* Customer & Invoice Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: '12px', fontSize: '11px' }}>
          <div style={{ paddingRight: '12px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', width: '70px', border: 'none', padding: '3px 0' }}>BILLED</td>
                  <td style={{ borderBottom: '1px solid black', border: 'none', borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: 'black', padding: '3px 4px' }}>{invoice.customerName}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', border: 'none', padding: '3px 0' }}>ADDRESS</td>
                  <td style={{ border: 'none', borderBottom: '1px solid black', padding: '3px 4px' }}>{invoice.address || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', border: 'none', padding: '3px 0' }}>GSTIN</td>
                  <td style={{ border: 'none', borderBottom: '1px solid black', padding: '3px 4px' }}>{invoice.gstin || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ paddingLeft: '12px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ border: 'none', borderBottom: '1px solid black', padding: '3px 4px' }}>{invoice.invoiceNumber}</td>
                  <td style={{ fontWeight: 'bold', border: 'none', padding: '3px 0', textAlign: 'right', width: '120px' }}>INVOICE NUMBER</td>
                </tr>
                <tr>
                  <td style={{ border: 'none', borderBottom: '1px solid black', padding: '3px 4px' }}>{format(new Date(invoice.date), 'dd/MM/yyyy')}</td>
                  <td style={{ fontWeight: 'bold', border: 'none', padding: '3px 0', textAlign: 'right' }}>DATED</td>
                </tr>
                <tr>
                  <td style={{ border: 'none', borderBottom: '1px solid black', padding: '3px 4px' }}>{invoice.po || '-'}</td>
                  <td style={{ fontWeight: 'bold', border: 'none', padding: '3px 0', textAlign: 'right' }}>ORDER NUMBER</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', marginBottom: '8px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ width: '40px', textAlign: 'center' }}>SR NO</th>
              <th style={{ textAlign: 'left' }}>PARTICULARS</th>
              <th style={{ width: '60px', textAlign: 'center' }}>HSN</th>
              <th style={{ width: '50px', textAlign: 'center' }}>QTY</th>
              <th style={{ width: '70px', textAlign: 'right' }}>RATE</th>
              <th style={{ width: '90px', textAlign: 'right' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.hsnCode || '-'}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.qty}</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(item.rate)}</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(item.amount)}</td>
              </tr>
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '24px' }}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
              <td></td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>TOTAL</td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(totals.amount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words + HSN Tax Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
          <div>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>Amount in Words</p>
                    <p style={{ fontSize: '11px' }}>{amountInWords} only</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th rowSpan={2} style={{ textAlign: 'center' }}>HSN</th>
                  <th colSpan={2} style={{ textAlign: 'center' }}>CGST</th>
                  <th colSpan={2} style={{ textAlign: 'center' }}>SGST</th>
                  <th rowSpan={2} style={{ textAlign: 'right' }}>TOTAL</th>
                </tr>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ textAlign: 'center', fontSize: '10px' }}>RATE</th>
                  <th style={{ textAlign: 'right', fontSize: '10px' }}>TAX</th>
                  <th style={{ textAlign: 'center', fontSize: '10px' }}>RATE</th>
                  <th style={{ textAlign: 'right', fontSize: '10px' }}>TAX</th>
                </tr>
              </thead>
              <tbody>
                {hsnBreakdown.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{row.hsn}</td>
                    <td style={{ textAlign: 'center' }}>{row.cgstRate}%</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(row.cgstAmount)}</td>
                    <td style={{ textAlign: 'center' }}>{row.sgstRate}%</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(row.sgstAmount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(row.cgstAmount + row.sgstAmount)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  <td style={{ textAlign: 'center' }}>TOTAL</td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(totals.cgstAmount)}</td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(totals.sgstAmount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(totals.cgstAmount + totals.sgstAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grand Total Row */}
        <table style={{ width: '100%', marginBottom: '12px' }}>
          <tbody>
            <tr style={{ fontWeight: 'bold', fontSize: '13px', backgroundColor: '#eee' }}>
              <td style={{ textAlign: 'left' }}>GRAND TOTAL</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Bank Details & Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px', fontSize: '10px' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>BANK DETAILS</p>
            <p>Kotak Mahindra Bank</p>
            <p>A/c No: 4711625484</p>
            <p>IFSC: KKBK0002936</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '11px' }}>for SK ENTERPRISE</p>
            <div style={{ height: '50px' }}></div>
            <p style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Authorized Signature</p>
          </div>
        </div>
      </div>
    </>
  );
}
