
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SDS } from "@/types/sds";

interface SearchResultsTableProps {
  searchResults: SDS[];
  selectedItems: string[];
  onToggleSelect: (productId: string) => void;
  onRequestSDS: () => void;
  onAddToLibrary: () => void;
}

export function SearchResultsTable({
  searchResults,
  selectedItems,
  onToggleSelect,
  onRequestSDS,
  onAddToLibrary,
}: SearchResultsTableProps) {
  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Product Code</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchResults.map((sds) => (
            <TableRow key={sds.productId}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(sds.productId)}
                  onCheckedChange={() => onToggleSelect(sds.productId)}
                />
              </TableCell>
              <TableCell>{sds.productName}</TableCell>
              <TableCell>{sds.productId}</TableCell>
              <TableCell>{sds.supplier}</TableCell>
              <TableCell>{sds.source}</TableCell>
              <TableCell>{sds.expiryDate}</TableCell>
              <TableCell>
                <Button variant="link">View SDS</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between">
        <Button 
          onClick={onRequestSDS}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
        >
          Request SDS from DGXprt
        </Button>
        <Button 
          onClick={onAddToLibrary}
          disabled={selectedItems.length === 0}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          Add Selected to Library
        </Button>
      </div>
    </div>
  );
}

