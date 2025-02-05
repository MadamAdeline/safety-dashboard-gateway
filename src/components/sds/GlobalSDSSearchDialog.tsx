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

interface GlobalSDSSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSDSSearchDialog({
  open,
  onOpenChange,
}: GlobalSDSSearchDialogProps) {
  const [chatInput, setChatInput] = useState("");
  const [searchFields, setSearchFields] = useState({
    productName: "",
    productCode: "",
    supplier: "",
    unNumber: "",
  });

  const handleChatSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Chat search:", chatInput);
    // Implementation for chat search will be added later
  };

  const handleFieldSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Field search:", searchFields);
    // Implementation for field search will be added later
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Global SDS Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">AI Chat Search</TabsTrigger>
            <TabsTrigger value="fields">Search Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <form onSubmit={handleChatSearch} className="space-y-4">
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
                    {/* Chat messages will be displayed here */}
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
            <form onSubmit={handleFieldSearch} className="space-y-4">
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
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Search</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}