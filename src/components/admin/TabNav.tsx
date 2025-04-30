"use client";
import { Button } from "@/components/ui/button";

type TabNavProps = {
  activeTab: "cars" | "bookings" | "payments" | "invoices";
  setActiveTab: (tab: "cars" | "bookings" | "payments" | "invoices") => void;
};

export default function TabNav({ activeTab, setActiveTab }: TabNavProps) {
  return (
    <div className="flex gap-4 mb-6 border-b">
      <Button
        variant={activeTab === "cars" ? "default" : "outline"}
        onClick={() => setActiveTab("cars")}
      >
        Cars
      </Button>
      <Button
        variant={activeTab === "bookings" ? "default" : "outline"}
        onClick={() => setActiveTab("bookings")}
      >
        Bookings
      </Button>
      <Button
        variant={activeTab === "payments" ? "default" : "outline"}
        onClick={() => setActiveTab("payments")}
      >
        Driver Payments
      </Button>
      <Button
        variant={activeTab === "invoices" ? "default" : "outline"}
        onClick={() => setActiveTab("invoices")}
      >
        Invoices
      </Button>
    </div>
  );
}