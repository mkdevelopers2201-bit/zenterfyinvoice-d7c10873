import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Item, Invoice } from '@/types/invoice';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DataContextType {
  customers: Customer[];
  items: Item[];
  invoices: Invoice[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer | null>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<Item | null>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice | null>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getItemById: (id: string) => Item | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getCustomerByName: (name: string) => Customer | undefined;
  getItemByName: (name: string) => Item | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [custRes, itemRes, invRes] = await Promise.all([
          supabase.from('customers').select('*').order('createdAt', { ascending: false }),
          supabase.from('items').select('*').order('createdAt', { ascending: false }),
          supabase.from('invoices').select('*').order('createdAt', { ascending: false })
        ]);

        if (custRes.data) setCustomers(custRes.data);
        if (itemRes.data) setItems(itemRes.data);
        if (invRes.data) setInvoices(invRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data from database');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Customer Actions
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, createdAt: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      toast.error('Error adding customer');
      return null;
    }
    setCustomers([data, ...customers]);
    return data;
  };

  const updateCustomer = async (id: string, updatedFields: Partial<Customer>) => {
    const { error } = await supabase.from('customers').update(updatedFields).eq('id', id);
    if (error) toast.error('Update failed');
    else setCustomers(customers.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else setCustomers(customers.filter(c => c.id !== id));
  };

  // Item Actions
  const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('items')
      .insert([{ ...item, createdAt: new Date().toISOString() }])
      .select()
      .single();

    if (error) return null;
    setItems([data, ...items]);
    return data;
  };

  const updateItem = async (id: string, updatedFields: Partial<Item>) => {
    await supabase.from('items').update(updatedFields).eq('id', id);
    setItems(items.map(i => (i.id === id ? { ...i, ...updatedFields } : i)));
  };

  const deleteItem = async (id: string) => {
    await supabase.from('items').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  // Invoice Actions
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, createdAt: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      toast.error('Error saving invoice');
      return null;
    }
    setInvoices([data, ...invoices]);
    return data;
  };

  const updateInvoice = async (id: string, updatedFields: Partial<Invoice>) => {
    await supabase.from('invoices').update(updatedFields).eq('id', id);
    setInvoices(invoices.map(inv => (inv.id === id ? { ...inv, ...updatedFields } : inv)));
  };

  const deleteInvoice = async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id);
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
      isLoading
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
