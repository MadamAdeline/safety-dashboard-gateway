import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useActiveSDSList } from "@/hooks/use-active-sds-list";
import type { SDS } from "@/types/sds";

interface SDSSearchProps {
  selectedSdsId?: string | null;
  initialSDS?: SDS | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
  className?: string;
}

export function SDSSearch({ selectedSdsId, initialSDS, onSDSSelect, className }: SDSSearchProps) {
  const { data: sdsData = [], isLoading } = useActiveSDSList();

  // Ensure sdsData is always an array
  const safeSDSData = Array.isArray(sdsData) ? sdsData : [];
  
  // Combine initial SDS with fetched data if it exists and isn't already in the list
  const combinedData = initialSDS && !safeSDSData.find(sds => sds.id === initialSDS.id)
    ? [initialSDS, ...safeSDSData]
    : safeSDSData;

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
      <CommandGroup className="max-h-[300px] overflow-auto">
        {combinedData.map((sds) => (
          <CommandItem
            key={sds.id}
            value={sds.productName}
            onSelect={() => onSDSSelect(sds)}
            className={cn(
              "cursor-pointer",
              selectedSdsId === sds.id && "bg-dgxprt-selected text-white"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{sds.productName}</span>
              <span className="text-sm text-gray-500">{sds.productId}</span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}