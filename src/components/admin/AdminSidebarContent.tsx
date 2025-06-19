"use client";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  CreditCard,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/administrator/dashboard",
  },
  {
    title: "Bookings",
    icon: CreditCard,
    href: "/administrator/bookings",
  },
  {
    title: "Drivers",
    icon: Users,
    href: "/administrator/drivers",
  },
  {
    title: "Vehicles",
    icon: Car,
    href: "/administrator/vehicles",
  },
  {
    title: "Locations",
    icon: MapPin,
    href: "/administrator/locations",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/administrator/settings",
  },
];

export default function AdminSidebarContent() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mb-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
              pathname === item.href && "bg-gray-100"
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="h-5 w-5" />
            <span className="ml-3 group-data-[collapsible=icon]:hidden">{item.title}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
} 