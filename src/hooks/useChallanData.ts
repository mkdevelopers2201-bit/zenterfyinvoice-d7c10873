import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryChallan, Bill, ChallanItem, BillItem } from '@/types/challan';
import { toast } from 'sonner';

// Helper function to get financial year string (e.g., "2025-26")
export const getFinancialYear = (date: Date = new Date()): string => {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth(); // 0-11
  
  // Financial year starts in April (month 3)
  if (currentMonth >= 3) {
    // April onwards - current year to next year
    return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
  } else {
    // Jan to March - previous year to current year
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
  }
};

export function useChallanData() {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) {
      setChallans([]);
      setBills([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [challansRes, billsRes] = await Promise.all([
        supabase.from('delivery_challans').select('*').order('created_at', { ascending: false }),
        supabase.from('bills').select('*').order('created_at', { ascending: false }),
      ]);

      if (challansRes.error) throw challansRes.error;
      if (billsRes.error) throw billsRes.error;

      setChallans(challansRes.data.map(c => ({
        id: c.id,
        challanNumber: c.challan_number,
        date: c.date,
        customerId: c.customer_id || undefined,
        customerName: c.customer_name,
        customerAddress: c.customer_address || undefined,
        customerPhone: c.customer_phone || undefined,
        items: (c.items as unknown as ChallanItem[]) || [],
        currentAmount: Number(c.current_amount) || 0,
        previousBalance: Number(c.previous_balance) || 0,
        grandTotal: Number(c.grand_total) || 0,
        isBilled: c.is_billed || false,
        billId: c.bill_id || undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })));

      setBills(billsRes.data.map(b => ({
        id: b.id,
        billNumber: b.bill_number,
        date: b.date,
        customerId: b.customer_id || undefined,
        customerName: b.customer_name,
        customerGstin: b.customer_gstin || undefined,
        customerAddress: b.customer_address || undefined,
        challanIds: b.challan_ids || [],
        items: (b.items as unknown as BillItem[]) || [],
        subtotal: Number(b.subtotal) || 0,
        cgstTotal: Number(b.cgst_total) || 0,
        sgstTotal: Number(b.sgst_total) || 0,
        gstAmount: Number(b.gst_amount) || 0,
        roundOff: Number(b.round_off) || 0,
        netAmount: Number(b.net_amount) || 0,
        status: (b.status as 'paid' | 'unpaid') || 'unpaid',
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      })));
    } catch (error: any) {
      console.error('Error fetching challan data:', error);
      toast.error('Failed to load challan data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get next challan number
  const getNextChallanNumber = (date: Date = new Date()): string => {
    const financialYear = getFinancialYear(date);
    const prefix = `${financialYear}-`;
    
    const fyChallan = challans.filter(c => c.challanNumber.startsWith(prefix));
    
    if (fyChallan.length === 0) {
      return `${prefix}001`;
    }
    
    const numbers = fyChallan.map(c => {
      const parts = c.challanNumber.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart, 10) || 0;
    });
    
    const maxNumber = Math.max(...numbers);
    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // Get next bill number
  const getNextBillNumber = (date: Date = new Date()): string => {
    const financialYear = getFinancialYear(date);
    const prefix = `${financialYear}-`;
    
    const fyBills = bills.filter(b => b.billNumber.startsWith(prefix));
    
    if (fyBills.length === 0) {
      return `${prefix}001`;
    }
    
    const numbers = fyBills.map(b => {
      const parts = b.billNumber.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart, 10) || 0;
    });
    
    const maxNumber = Math.max(...numbers);
    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // Get previous balance for a customer
  const getPreviousBalance = (customerId?: string, customerName?: string): number => {
    if (!customerId && !customerName) return 0;

    // Get customer's bills sorted by date desc
    const customerBills = bills
      .filter(b => (customerId && b.customerId === customerId) || b.customerName === customerName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // If latest bill is paid, reset to 0
    if (customerBills.length > 0 && customerBills[0].status === 'paid') {
      return 0;
    }

    // If latest bill is unpaid, carry forward net amount
    if (customerBills.length > 0 && customerBills[0].status === 'unpaid') {
      return customerBills[0].netAmount;
    }

    // If no bills, get grand total of latest unbilled challan
    const customerChallans = challans
      .filter(c => (customerId && c.customerId === customerId) || c.customerName === customerName)
      .filter(c => !c.isBilled)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (customerChallans.length > 0) {
      return customerChallans[0].grandTotal;
    }

    return 0;
  };

  // Get unbilled challans for a customer
  const getUnbilledChallans = (customerId?: string, customerName?: string): DeliveryChallan[] => {
    return challans.filter(c => 
      !c.isBilled && 
      ((customerId && c.customerId === customerId) || c.customerName === customerName)
    );
  };

  // Add challan
  const addChallan = async (challan: Omit<DeliveryChallan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryChallan> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('delivery_challans').insert({
      challan_number: challan.challanNumber,
      date: challan.date,
      customer_id: challan.customerId,
      customer_name: challan.customerName,
      customer_address: challan.customerAddress,
      customer_phone: challan.customerPhone,
      items: JSON.parse(JSON.stringify(challan.items)),
      current_amount: challan.currentAmount,
      previous_balance: challan.previousBalance,
      grand_total: challan.grandTotal,
      is_billed: false,
      user_id: user.id,
    }).select().single();

    if (error) throw error;

    const newChallan: DeliveryChallan = {
      id: data.id,
      challanNumber: data.challan_number,
      date: data.date,
      customerId: data.customer_id || undefined,
      customerName: data.customer_name,
      customerAddress: data.customer_address || undefined,
      customerPhone: data.customer_phone || undefined,
      items: (data.items as unknown as ChallanItem[]) || [],
      currentAmount: Number(data.current_amount) || 0,
      previousBalance: Number(data.previous_balance) || 0,
      grandTotal: Number(data.grand_total) || 0,
      isBilled: data.is_billed || false,
      billId: data.bill_id || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setChallans(prev => [newChallan, ...prev]);
    return newChallan;
  };

  // Update challan
  const updateChallan = async (id: string, updates: Partial<DeliveryChallan>) => {
    const { error } = await supabase.from('delivery_challans').update({
      challan_number: updates.challanNumber,
      date: updates.date,
      customer_id: updates.customerId,
      customer_name: updates.customerName,
      customer_address: updates.customerAddress,
      customer_phone: updates.customerPhone,
      items: updates.items ? JSON.parse(JSON.stringify(updates.items)) : undefined,
      current_amount: updates.currentAmount,
      previous_balance: updates.previousBalance,
      grand_total: updates.grandTotal,
      is_billed: updates.isBilled,
      bill_id: updates.billId,
    }).eq('id', id);

    if (error) throw error;
    setChallans(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Delete challan
  const deleteChallan = async (id: string) => {
    const { error } = await supabase.from('delivery_challans').delete().eq('id', id);
    if (error) throw error;
    setChallans(prev => prev.filter(c => c.id !== id));
  };

  // Add bill
  const addBill = async (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('bills').insert({
      bill_number: bill.billNumber,
      date: bill.date,
      customer_id: bill.customerId,
      customer_name: bill.customerName,
      customer_gstin: bill.customerGstin,
      customer_address: bill.customerAddress,
      challan_ids: bill.challanIds,
      items: JSON.parse(JSON.stringify(bill.items)),
      subtotal: bill.subtotal,
      cgst_total: bill.cgstTotal,
      sgst_total: bill.sgstTotal,
      gst_amount: bill.gstAmount,
      round_off: bill.roundOff,
      net_amount: bill.netAmount,
      status: bill.status,
      user_id: user.id,
    }).select().single();

    if (error) throw error;

    // Mark challans as billed
    for (const challanId of bill.challanIds) {
      await supabase.from('delivery_challans').update({
        is_billed: true,
        bill_id: data.id,
      }).eq('id', challanId);
    }

    const newBill: Bill = {
      id: data.id,
      billNumber: data.bill_number,
      date: data.date,
      customerId: data.customer_id || undefined,
      customerName: data.customer_name,
      customerGstin: data.customer_gstin || undefined,
      customerAddress: data.customer_address || undefined,
      challanIds: data.challan_ids || [],
      items: (data.items as unknown as BillItem[]) || [],
      subtotal: Number(data.subtotal) || 0,
      cgstTotal: Number(data.cgst_total) || 0,
      sgstTotal: Number(data.sgst_total) || 0,
      gstAmount: Number(data.gst_amount) || 0,
      roundOff: Number(data.round_off) || 0,
      netAmount: Number(data.net_amount) || 0,
      status: (data.status as 'paid' | 'unpaid') || 'unpaid',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setBills(prev => [newBill, ...prev]);
    
    // Update local challan state
    setChallans(prev => prev.map(c => 
      bill.challanIds.includes(c.id) ? { ...c, isBilled: true, billId: data.id } : c
    ));

    return newBill;
  };

  // Update bill
  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const { error } = await supabase.from('bills').update({
      bill_number: updates.billNumber,
      date: updates.date,
      customer_id: updates.customerId,
      customer_name: updates.customerName,
      customer_gstin: updates.customerGstin,
      customer_address: updates.customerAddress,
      challan_ids: updates.challanIds,
      items: updates.items ? JSON.parse(JSON.stringify(updates.items)) : undefined,
      subtotal: updates.subtotal,
      cgst_total: updates.cgstTotal,
      sgst_total: updates.sgstTotal,
      gst_amount: updates.gstAmount,
      round_off: updates.roundOff,
      net_amount: updates.netAmount,
      status: updates.status,
    }).eq('id', id);

    if (error) throw error;
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // Delete bill
  const deleteBill = async (id: string) => {
    const bill = bills.find(b => b.id === id);
    
    // Unmark challans as billed
    if (bill) {
      for (const challanId of bill.challanIds) {
        await supabase.from('delivery_challans').update({
          is_billed: false,
          bill_id: null,
        }).eq('id', challanId);
      }
    }

    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw error;
    
    setBills(prev => prev.filter(b => b.id !== id));
    
    if (bill) {
      setChallans(prev => prev.map(c => 
        bill.challanIds.includes(c.id) ? { ...c, isBilled: false, billId: undefined } : c
      ));
    }
  };

  return {
    challans,
    bills,
    isLoading,
    refreshData: fetchData,
    getNextChallanNumber,
    getNextBillNumber,
    getPreviousBalance,
    getUnbilledChallans,
    addChallan,
    updateChallan,
    deleteChallan,
    addBill,
    updateBill,
    deleteBill,
  };
}
