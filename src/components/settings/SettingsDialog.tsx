import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/Switch";
import { useSettings } from "@/lib/store/settings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const { autosave, setAutosave } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Autosave on change</label>
            <Switch checked={autosave} onCheckedChange={setAutosave} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
