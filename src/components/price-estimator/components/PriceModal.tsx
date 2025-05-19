"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedPrice: number;
  priceBreakdown: { description: string; amount: number }[];
  onContinue: () => void;
}

export default function PriceModal({
  isOpen,
  onClose,
  estimatedPrice,
  priceBreakdown,
  onContinue,
}: PriceModalProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Price Estimate</DialogTitle>
          <DialogDescription>
            Here&apos;s a breakdown of your estimated price
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <table className="w-full">
              <tbody>
                {priceBreakdown.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">
                      {formatPrice(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="pt-4">Total</td>
                  <td className="pt-4 text-right">
                    {formatPrice(estimatedPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onContinue}>Continue to Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}