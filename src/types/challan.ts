export interface ChallanItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  total: number;
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  items: ChallanItem[];
  currentAmount: number;
  previousBalance: number;
  grandTotal: number;
  isBilled: boolean;
  billId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerGstin?: string;
  customerAddress?: string;
  challanIds: string[];
  items: BillItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  gstAmount: number;
  roundOff: number;
  netAmount: number;
  status: 'paid' | 'unpaid';
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  name: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  amount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  total: number;
}
