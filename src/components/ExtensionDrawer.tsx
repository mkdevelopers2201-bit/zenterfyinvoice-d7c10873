import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Puzzle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranzecfyInstalled } from '@/hooks/useTranzecfyInstalled';
import { toast } from 'sonner';
import tranzecfyLogo from '@/assets/tranzecfy-logo.png';

export function ExtensionDrawer() {
  const [installed, setInstalled] = useTranzecfyInstalled();

  const handleInstall = () => {
    setInstalled(true);
    toast.success('Tranzecfy Payment Tracker installed!');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Extensions">
          <Puzzle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Extensions</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <img src={tranzecfyLogo} alt="Tranzecfy" className="h-10 w-10 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Tranzecfy Payment Tracker</p>
              <p className="text-xs text-muted-foreground">Track payments & balances</p>
            </div>
            {installed ? (
              <span className="text-xs text-green-600 font-medium">Installed</span>
            ) : (
              <Button size="icon" variant="ghost" onClick={handleInstall}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
