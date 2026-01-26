import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Item, Invoice } from '@/types/invoice';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface DataContextType {
  customers: Customer[];
  items: Item[];
  invoices: Invoice[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<Item>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getItemById: (id: string) => Item | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getCustomerByName: (name: string) => Customer | undefined;
  getItemByName: (name: string) => Item | undefined;
  getNextInvoiceNumber: () => string;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to get financial year string (e.g., "2025-26")
const getFinancialYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  // Financial year starts in April (month 3)
  if (currentMonth >= 3) {
    // April onwards - current year to next year
    return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
  } else {
    // Jan to March - previous year to current year
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setCustomers([]);
      setItems([]);
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [customersRes, itemsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('*').order('createdAt', { ascending: false }),
        supabase.from('items').select('*').order('createdAt', { ascending: false }),
        supabase.from('invoices').select('*').order('createdAt', { ascending: false }),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (invoicesRes.error) throw invoicesRes.error;

      setCustomers(customersRes.data.map(c => ({
        id: c.id,
        name: c.name,
        gstin: c.gstin || '',
        address: c.address || '',
        createdAt: c.createdAt || new Date().toISOString(),
      })));

      setItems(itemsRes.data.map(i => ({
        id: i.id,
        name: i.name,
        hsnCode: i.hsncode || '',
        rate: i.rate || 0,
        createdAt: i.createdAt || new Date().toISOString(),
      })));

      setInvoices(invoicesRes.data.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date || new Date().toISOString(),
        customerId: inv.customerId || '',
        customerName: inv.customerName || '',
        gstin: inv.gstin || '',
        address: inv.address || '',
        po: inv.po || '',
        items: (inv.items as any[]) || [],
        withoutGst: inv.withoutGst || 0,
        cgstTotal: inv.cgstTotal || 0,
        sgstTotal: inv.sgstTotal || 0,
        gstAmount: inv.gstAmount || 0,
        grandTotal: inv.grandTotal || 0,
        status: (inv.status as 'paid' | 'pending') || 'pending',
        createdAt: inv.createdAt || new Date().toISOString(),
        updatedAt: inv.createdAt || new Date().toISOString(),
      })));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const refreshData = async () => {
    await fetchData();
  };

  // Generate next invoice number based on existing invoices
  // Format: YYYY-YY-XXX (e.g., 2025-26-001)
  const getNextInvoiceNumber = () => {
    const financialYear = getFinancialYear();
    const prefix = `${financialYear}-`;
    
    // Filter invoices that match current financial year
    const fyInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    
    if (fyInvoices.length === 0) {
      return `${prefix}001`;
    }
    
    // Extract numbers from invoice numbers
    const numbers = fyInvoices.map(inv => {
      const parts = inv.invoiceNumber.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart, 10) || 0;
    });
    
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  };

  // Customer Actions
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('customers').insert({
      name: customer.name,
      gstin: customer.gstin,
      address: customer.address,
      user_id: user.id,
    }).select().single();

    if (error) throw error;

    const newCustomer: Customer = {
      id: data.id,
      name: data.name,
      gstin: data.gstin || '',
      address: data.address || '',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, updatedFields: Partial<Customer>) => {
    const { error } = await supabase.from('customers').update({
      name: updatedFields.name,
      gstin: updatedFields.gstin,
      address: updatedFields.address,
    }).eq('id', id);

    if (error) throw error;
    setCustomers(customers.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Item Actions
  const addItem = async (item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('items').insert({
      name: item.name,
      hsncode: item.hsnCode,
      rate: item.rate,
      user_id: user.id,
    }).select().single();

    if (error) throw error;

    const newItem: Item = {
      id: data.id,
      name: data.name,
      hsnCode: data.hsncode || '',
      rate: data.rate || 0,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = async (id: string, updatedFields: Partial<Item>) => {
    const { error } = await supabase.from('items').update({
      name: updatedFields.name,
      hsncode: updatedFields.hsnCode,
      rate: updatedFields.rate,
    }).eq('id', id);

    if (error) throw error;
    setItems(items.map(i => (i.id === id ? { ...i, ...updatedFields } : i)));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    setItems(items.filter(i => i.id !== id));
  };

  // Invoice Actions
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> => {
    if (!user) throw new Error('Not authenticated');

    const itemsJson = JSON.parse(JSON.stringify(invoice.items));

    const { data, error } = await supabase.from('invoices').insert({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      gstin: invoice.gstin,
      address: invoice.address,
      po: invoice.po,
      items: itemsJson,
      withoutGst: invoice.withoutGst,
      cgstTotal: invoice.cgstTotal,
      sgstTotal: invoice.sgstTotal,
      gstAmount: invoice.gstAmount,
      grandTotal: invoice.grandTotal,
      status: invoice.status,
      user_id: user.id,
    }).select().single();

    if (error) throw error;

    const newInvoice: Invoice = {
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      date: data.date || new Date().toISOString(),
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      gstin: data.gstin || '',
      address: data.address || '',
      po: data.po || '',
      items: (data.items as any[]) || [],
      withoutGst: data.withoutGst || 0,
      cgstTotal: data.cgstTotal || 0,
      sgstTotal: data.sgstTotal || 0,
      gstAmount: data.gstAmount || 0,
      grandTotal: data.grandTotal || 0,
      status: (data.status as 'paid' | 'pending') || 'pending',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.createdAt || new Date().toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updatedFields: Partial<Invoice>) => {
    const itemsJson = updatedFields.items ? JSON.parse(JSON.stringify(updatedFields.items)) : undefined;
    
    const { error } = await supabase.from('invoices').update({
      invoiceNumber: updatedFields.invoiceNumber,
      date: updatedFields.date,
      customerId: updatedFields.customerId,
      customerName: updatedFields.customerName,
      gstin: updatedFields.gstin,
      address: updatedFields.address,
      po: updatedFields.po,
      items: itemsJson,
      withoutGst: updatedFields.withoutGst,
      cgstTotal: updatedFields.cgstTotal,
      sgstTotal: updatedFields.sgstTotal,
      gstAmount: updatedFields.gstAmount,
      grandTotal: updatedFields.grandTotal,
      status: updatedFields.status,
    }).eq('id', id);

    if (error) throw error;
    setInvoices(invoices.map(inv => (inv.id === id ? { ...inv, ...updatedFields } : inv)));
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  // Helper selectors
  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getItemById = (id: string) => items.find(i => i.id === id);
  const getInvoiceById = (id: string) => invoices.find(inv => inv.id === id);
  const getCustomerByName = (name: string) => 
    customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  const getItemByName = (name: string) => 
    items.find(i => i.name.toLowerCase() === name.toLowerCase());

  return (
    <DataContext.Provider value={{
      customers, items, invoices,
      addCustomer, updateCustomer, deleteCustomer,
      addItem, updateItem, deleteItem,
      addInvoice, updateInvoice, deleteInvoice,
      getCustomerById, getItemById, getInvoiceById,
      getCustomerByName, getItemByName,
      getNextInvoiceNumber,
      isLoading,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
