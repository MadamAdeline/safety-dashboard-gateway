import { useActiveSDSList } from "@/hooks/use-active-sds-list";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SDS } from "@/types/sds";

interface SDSSearchProps {
  selectedSdsId?: string | null;
  initialSDS?: SDS | null;
  onSDSSelect: (sds: SDS) => void;
  className?: string;
}

export function SDSSearch({ selectedSdsId, initialSDS, onSDSSelect, className }: SDSSearchProps) {
  const { data: sdsData = [], isLoading } = useActiveSDSList();

  // Combine initial SDS with fetched data if it exists and isn't already in the list
  const combinedData = initialSDS && !sdsData.find(sds => sds.id === initialSDS.id)
    ? [initialSDS, ...sdsData]
    : sdsData;

  return (
    <Command className={cn("w-[400px] bg-white border rounded-lg", className)}>
      <CommandInput placeholder="Search SDS..." />
      <CommandEmpty>No SDS found.</CommandEmpty>
      <CommandGroup className="max-h-[300px] overflow-auto">
        {combinedData.map((sds) => (
          <CommandItem
            key={sds.id}
            value={sds.productName}
            onSelect={() => onSDSSelect(sds)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedSdsId === sds.id ? "opacity-100" : "opacity-0"
              )}
            />
            {sds.productName}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}