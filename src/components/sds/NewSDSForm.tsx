import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewSDSFormProps {
  onClose: () => void;
}

export function NewSDSForm({ onClose }: NewSDSFormProps) {
  const [isDG, setIsDG] = useState(false);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="product-details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="product-details">Product Details</TabsTrigger>
          <TabsTrigger value="hazards">Hazards and Controls</TabsTrigger>
          <TabsTrigger value="version">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="product-details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input id="productName" placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherNames">Other Product Names</Label>
              <Input id="otherNames" placeholder="Enter other product names" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sdsCode">SDS Product Code *</Label>
              <Input id="sdsCode" placeholder="Enter SDS code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier Name *</Label>
              <Input id="supplier" placeholder="Enter supplier name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Phone</Label>
              <Input id="emergency" placeholder="Enter emergency contact" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input id="issueDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revisionDate">Revision Date *</Label>
              <Input id="revisionDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input id="expiryDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Is this shipment considered as Dangerous Goods? *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={isDG ? "default" : "outline"}
                  onClick={() => setIsDG(true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!isDG ? "default" : "outline"}
                  onClick={() => setIsDG(false)}
                >
                  No
                </Button>
              </div>
            </div>
            {isDG && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dgClass">DG Class *</Label>
                  <Select>
                    <SelectTrigger id="dgClass">
                      <SelectValue placeholder="Select DG Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Class 1 - Explosives</SelectItem>
                      <SelectItem value="2">Class 2 - Gases</SelectItem>
                      <SelectItem value="3">Class 3 - Flammable Liquids</SelectItem>
                      {/* Add other DG classes */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dgSubDivision">DG Sub Division *</Label>
                  <Select>
                    <SelectTrigger id="dgSubDivision">
                      <SelectValue placeholder="Select Sub Division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.1">1.1</SelectItem>
                      <SelectItem value="1.2">1.2</SelectItem>
                      <SelectItem value="1.3">1.3</SelectItem>
                      {/* Add other subdivisions */}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hazards">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Hazards and Controls information will be added here
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="version">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Version History information will be added here
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-dgxprt-purple hover:bg-dgxprt-purple/90">
          Save
        </Button>
      </div>
    </div>
  );
}