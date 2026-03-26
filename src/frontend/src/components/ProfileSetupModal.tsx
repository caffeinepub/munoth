import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trees } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync(name.trim());
      toast.success("Welcome to FamTree!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-popover border-border max-w-sm"
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader className="text-center items-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <Trees className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Welcome to FamTree!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set your display name so family members can recognize you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Your Name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grandma Rose"
              className="bg-background border-border"
              autoFocus
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
            data-ocid="profile_setup.submit_button"
          >
            {saveProfile.isPending ? "Saving..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
