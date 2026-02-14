import { useState } from 'react';
import { Home, FileText, Plus, User, Settings, Search, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranzecfyHome } from '@/components/tranzecfy/TranzecfyHome';
import { TranzecfyReports } from '@/components/tranzecfy/TranzecfyReports';
import { TranzecfyAccounts } from '@/components/tranzecfy/TranzecfyAccounts';
import { TranzecfySettings } from '@/components/tranzecfy/TranzecfySettings';
import { TranzecfyAddTransaction } from '@/components/tranzecfy/TranzecfyAddTransaction';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, Users } from 'lucide-react';

type Tab = 'home' | 'reports' | 'add' | 'accounts' | 'settings';

export default function Tranzecfy() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const handleAddClick = () => {
    setShowAddMenu(true);
  };

  const renderContent = () => {
    if (showAddTransaction) {
      return <TranzecfyAddTransaction onDone={() => { setShowAddTransaction(false); setActiveTab('home'); }} />;
    }
    switch (activeTab) {
      case 'home': return <TranzecfyHome />;
      case 'reports': return <TranzecfyReports />;
      case 'accounts': return <TranzecfyAccounts />;
      case 'settings': return <TranzecfySettings />;
      default: return <TranzecfyHome />;
    }
  };

  const navItems = [
    { id: 'home' as Tab, icon: Home, label: 'Home' },
    { id: 'reports' as Tab, icon: FileText, label: 'Reports' },
    { id: 'add' as Tab, icon: Plus, label: '' },
    { id: 'accounts' as Tab, icon: User, label: 'Accounts' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-6 lg:-mx-8 -my-6 lg:-my-8">
      {/* Blue Header */}
      <div className="bg-[hsl(var(--primary))] text-primary-foreground px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tranzecfy</h1>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 cursor-pointer" />
          <MoreVertical className="h-5 w-5 cursor-pointer" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-background">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t bg-card flex items-center justify-around py-2">
        {navItems.map(item => {
          if (item.id === 'add') {
            return (
              <button
                key="add"
                onClick={handleAddClick}
                className="flex flex-col items-center -mt-6"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-b from-primary/60 to-primary flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
              </button>
            );
          }
          const isActive = activeTab === item.id && !showAddTransaction;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setShowAddTransaction(false); }}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Menu Dialog */}
      <Dialog open={showAddMenu} onOpenChange={setShowAddMenu}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What would you like to Add?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <button
              onClick={() => { setShowAddMenu(false); setShowAddTransaction(true); }}
              className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Payment Transaction</span>
            </button>
            <button
              onClick={() => { setShowAddMenu(false); setActiveTab('accounts'); }}
              className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Account</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
