import { cn } from "@/lib/utils";

interface ServiceTypeSelectorProps {
  serviceType: string;
  setServiceType: (type: string) => void;
}

export default function ServiceTypeSelector({ serviceType, setServiceType }: ServiceTypeSelectorProps) {
  return (
    <nav className="border-b border-gray-200 mb-4">
      <div className="flex space-x-2">
        {["meetAndGreet", "airportTransfer", "dailyHire"].map((type) => (
          <button
            key={type}
            type="button"
            className={cn(
              "py-2 px-4 font-medium",
              serviceType === type
                ? "border-b-2 border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
            onClick={() => setServiceType(type)}
          >
            {type === "meetAndGreet" ? "Meet & Greet" : type === "airportTransfer" ? "Airport Transfer" : "Daily Hire"}
          </button>
        ))}
      </div>
    </nav>
  );
}