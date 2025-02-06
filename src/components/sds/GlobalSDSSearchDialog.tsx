import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SDS } from "@/types/sds";
import { SDSRequestDialog } from "./SDSRequestDialog";
import { SDSSearch } from "@/components/sds/SDSSearch";

// Sample data for demonstration
const sampleSearchResults: SDS[] = [
  {
    id: "1234-5678-9012-3456",
    productName: "Sample Product 1",
    productId: "SP001",
    supplier: "Supplier A",
    supplierId: "supplier-a-uuid",
    expiryDate: "2025-12-31",
    isDG: true,
    issueDate: "2023-01-01",
    status: "ACTIVE",
    sdsSource: "Global Library"
  },
  {
    id: "2345-6789-0123-4567",
    productName: "BP Butane",
    productId: "0000002705",
    supplier: "BP Australia Pty Ltd",
    supplierId: "bp-australia-uuid",
    expiryDate: "2026-04-21",
    isDG: true,
    issueDate: "2021-04-21",
    status: "ACTIVE",
    sdsSource: "Global Library"
  }
];

interface GlobalSDSSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSDSSelect: (selectedSDS: SDS[]) => void;
}

export function GlobalSDSSearchDialog({
  open,
  onOpenChange,
  onSDSSelect,
}: GlobalSDSSearchDialogProps) {
  const [chatInput, setChatInput] = useState("");
  const [searchFields, setSearchFields] = useState({
    productName: "",
    productCode: "",
    supplier: "",
    unNumber: "",
  });
  const [searchResults, setSearchResults] = useState<SDS[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching...");
    setSearchResults(sampleSearchResults);
  };

  const handleAddToLibrary = () => {
    const selectedSDS = searchResults.filter(sds => 
      selectedItems.includes(sds.productId)
    );
    
    onSDSSelect(selectedSDS);
    toast({
      title: "Success",
      description: `${selectedItems.length} SDS(s) have been added to your library.`,
    });
    onOpenChange(false);
    setSelectedItems([]);
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRequestComplete = () => {
    setShowRequestDialog(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Search Global SDS Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">AI Chat Search</TabsTrigger>
            <TabsTrigger value="fields">Search Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-input">
                  Describe the SDS you're looking for in detail:
                </Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Welcome! Please describe the SDS you're looking for. Include as much detail as possible, such as:
                      - Product name or type
                      - Manufacturer or supplier
                      - Chemical composition
                      - UN numbers if known
                      - Any other relevant details
                    </p>
                  </div>
                </ScrollArea>
                <textarea
                  id="chat-input"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your search query here..."
                />
              </div>
              <Button type="submit" className="w-full">Search</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="fields">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={searchFields.productName}
                    onChange={(e) => setSearchFields({
                      ...searchFields,
                      productName: e.target.value
                    })}
                    placeholder="Search SDS Library..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-code">Product Code</Label>
                  <Input
                    id="product-code"
                    value={searchFields.productCode}
                    onChange={(e) => setSearchFields({
                      ...searchFields,
                      productCode: e.target.value
                    })}
                    placeholder="Search SDS Library..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={searchFields.supplier}
                    onChange={(e) => setSearchFields({
                      ...searchFields,
                      supplier: e.target.value
                    })}
                    placeholder="Search SDS Library..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="un-number">UN Number</Label>
                  <Input
                    id="un-number"
                    value={searchFields.unNumber}
                    onChange={(e) => setSearchFields({
                      ...searchFields,
                      unNumber: e.target.value
                    })}
                    placeholder="Search SDS Library..."
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Search</Button>
            </form>
          </TabsContent>
        </Tabs>

        {searchResults.length > 0 && (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Supplier</TableHead>
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
                        onCheckedChange={() => toggleSelectItem(sds.productId)}
                      />
                    </TableCell>
                    <TableCell>{sds.productName}</TableCell>
                    <TableCell>{sds.productId}</TableCell>
                    <TableCell>{sds.supplier}</TableCell>
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
                onClick={() => setShowRequestDialog(true)}
                className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
              >
                Request SDS from DGXprt
              </Button>
              <Button 
                onClick={handleAddToLibrary}
                disabled={selectedItems.length === 0}
                className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
              >
                Add Selected to Library
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      <SDSRequestDialog 
        open={showRequestDialog} 
        onOpenChange={setShowRequestDialog}
        onRequestComplete={handleRequestComplete}
      />
    </Dialog>
  );
}
