import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveSDSList } from "@/hooks/use-active-sds-list";
import type { SDS } from "@/types/sds";

interface SDSSearchProps {
  selectedSdsId?: string | null;
  onSDSSelect: (sds: SDS) => void;
  className?: string;
}

export function SDSSearch({ selectedSdsId, onSDSSelect, className }: SDSSearchProps) {
  const { data: sdsData = [], isLoading } = useActiveSDSList();

  if (isLoading) {
    return (
      <Command className={cn("w-[400px] bg-white border rounded-lg", className)}>
        <CommandInput placeholder="Loading SDS..." disabled />
        <CommandEmpty>Loading...</CommandEmpty>
      </Command>
    );
  }

  return (
    <Command className={cn("w-[400px] bg-white border rounded-lg", className)}>
      <CommandInput placeholder="Search SDS..." />
      <CommandEmpty>No SDS found.</CommandEmpty>
      <CommandGroup>
        {sdsData.map((sds) => (
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