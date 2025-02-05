import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SDS } from "@/types/sds";

interface NewSDSFormProps {
  onClose: () => void;
  initialData?: SDS | null;
}

export function NewSDSForm({ onClose, initialData }: NewSDSFormProps) {
  const [isDG, setIsDG] = useState(initialData?.isDG ?? false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setIsDG(initialData.isDG);
      // Set other form fields based on initialData
    }
  }, [initialData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File uploaded:", file.name);
    }
  };

  const handleSave = () => {
    toast({
      title: "Success",
      description: "SDS Record has been updated"
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Safety Data Sheet" : "New Safety Data Sheet"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" onClick={handleSave}>
              Save
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
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
                    <Input 
                      id="productName" 
                      placeholder="Enter product name" 
                      defaultValue={initialData?.productName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherNames">Other Product Names</Label>
                    <Input id="otherNames" placeholder="Enter other product names" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sdsCode">SDS Product Code *</Label>
                    <Input 
                      id="sdsCode" 
                      placeholder="Enter SDS code" 
                      defaultValue={initialData?.productId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier Name *</Label>
                    <Input 
                      id="supplier" 
                      placeholder="Enter supplier name" 
                      defaultValue={initialData?.supplier}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Phone</Label>
                    <Input id="emergency" placeholder="Enter emergency contact" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input 
                      id="issueDate" 
                      type="date" 
                      defaultValue={initialData?.issueDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revisionDate">Revision Date *</Label>
                    <Input id="revisionDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input 
                      id="expiryDate" 
                      type="date" 
                      defaultValue={initialData?.expiryDate}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
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
                        <Select defaultValue={initialData?.dgClass?.toString()}>
                          <SelectTrigger id="dgClass">
                            <SelectValue placeholder="Select DG Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Class 1 - Explosives</SelectItem>
                            <SelectItem value="2">Class 2 - Gases</SelectItem>
                            <SelectItem value="3">Class 3 - Flammable Liquids</SelectItem>
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
          </div>

          <div className="space-y-4">
            <div className="flex justify-end">
              <input
                type="file"
                id="sdsUpload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="sdsUpload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload SDS
                  </span>
                </Button>
              </label>
            </div>

            <div className="border rounded-lg p-4 bg-white">
              <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
              <div className="aspect-[1/1.4] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/efad172c-780d-4fdb-ba96-baa5719330bc.png" 
                  alt="SDS Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}