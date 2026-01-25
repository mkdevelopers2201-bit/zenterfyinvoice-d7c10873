import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  ListOrdered,
  Menu,
  X,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link to={to} onClick={onClick}>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "hover:bg-accent text-foreground"
      )}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/create-invoice', icon: <FileText size={20} />, label: 'Create Invoice' },
    { to: '/sales-register', icon: <ListOrdered size={20} />, label: 'Sales Register' },
    { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/items', icon: <Package size={20} />, label: 'Items' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Receipt className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">InvoicePro</span>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r z-50 transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">InvoicePro</span>
            </div>
            <div className="hidden lg:block">
              <UserMenu />
            </div>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
