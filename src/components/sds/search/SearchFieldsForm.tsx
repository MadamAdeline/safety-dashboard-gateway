
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SearchFields {
  productName: string;
  productCode: string;
  supplier: string;
  unNumber: string;
  source: string;  // Added source field
}

interface SearchFieldsFormProps {
  searchFields: SearchFields;
  onSearchFieldsChange: (fields: SearchFields) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchFieldsForm({ searchFields, onSearchFieldsChange, onSubmit }: SearchFieldsFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={searchFields.productName}
            onChange={(e) => onSearchFieldsChange({
              ...searchFields,
              productName: e.target.value
            })}
            placeholder="Search by product name..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product-code">Product Code</Label>
          <Input
            id="product-code"
            value={searchFields.productCode}
            onChange={(e) => onSearchFieldsChange({
              ...searchFields,
              productCode: e.target.value
            })}
            placeholder="Search by product code..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            value={searchFields.supplier}
            onChange={(e) => onSearchFieldsChange({
              ...searchFields,
              supplier: e.target.value
            })}
            placeholder="Search by supplier..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={searchFields.source}
            onChange={(e) => onSearchFieldsChange({
              ...searchFields,
              source: e.target.value
            })}
            placeholder="Search by source..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="un-number">UN Number</Label>
          <Input
            id="un-number"
            value={searchFields.unNumber}
            onChange={(e) => onSearchFieldsChange({
              ...searchFields,
              unNumber: e.target.value
            })}
            placeholder="Search by UN number..."
          />
        </div>
      </div>
      <Button type="submit" className="w-full">Search</Button>
    </form>
  );
}
