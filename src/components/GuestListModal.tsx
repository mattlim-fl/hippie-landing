import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Instagram, Facebook } from "lucide-react";

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestListModal = ({ isOpen, onClose }: GuestListModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] bg-hippie-teal border-hippie-gold">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-hippie-gold uppercase tracking-wide text-center">
            Join Our Guest List
          </DialogTitle>
          <DialogDescription className="text-hippie-white/90 text-center">
            Message our team to organise a birthday or special occasion. Guest List entry and reserved areas available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/hipeclubperth/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg bg-hippie-teal-dark border-2 border-hippie-gold/30 hover:border-hippie-gold transition-all hover:scale-105"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-hippie-white uppercase">Instagram</h3>
              <p className="text-sm text-hippie-white/60">@hipeclubperth</p>
            </div>
            <span className="text-hippie-gold text-xl">→</span>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/hipeclubperth/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg bg-hippie-teal-dark border-2 border-hippie-gold/30 hover:border-hippie-gold transition-all hover:scale-105"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-hippie-white uppercase">Facebook</h3>
              <p className="text-sm text-hippie-white/60">Hipe Club Perth</p>
            </div>
            <span className="text-hippie-gold text-xl">→</span>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

