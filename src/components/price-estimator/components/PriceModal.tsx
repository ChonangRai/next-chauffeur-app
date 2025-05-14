"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  estimatedPrice: string;
  priceBreakdown: string[];
  onContinue: () => void; // Changed from () => Promise<void>
}

export default function PriceModal({ showModal, setShowModal, estimatedPrice, priceBreakdown, onContinue }: PriceModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Estimated Price</h3>
        <div className="space-y-3 mb-6">
          {priceBreakdown.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex justify-between py-2",
                item.startsWith("Total:") ? "border-t border-gray-200 pt-3 font-bold text-lg" : "",
                item.includes("→") ? "text-blue-600" : ""
              )}
            >
              <span>{item.split(":")[0]}:</span>
              <span>{item.split(":")[1]}</span>
            </div>
          ))}
        </div>
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-primary">{estimatedPrice}</p>
          <p className="text-sm text-muted-foreground mt-2">
            This is an estimate. Final price may vary based on availability.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={onContinue}>Continue with Booking</Button>
        </div>
      </div>
    </div>
  );
}