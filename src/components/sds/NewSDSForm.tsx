import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { SDS } from "@/types/sds";

// Sample suppliers data - in a real app this would come from an API
const suppliers = [
  { value: "supplier1", label: "AUSTRALIAN CHEMICAL REAGENTS" },
  { value: "supplier2", label: "SIGMA ALDRICH" },
  { value: "supplier3", label: "MERCK" },
  { value: "supplier4", label: "THERMO FISHER" },
];

interface NewSDSFormProps {
  onClose: () => void;
  initialData?: SDS | null;
}

export function NewSDSForm({ onClose, initialData }: NewSDSFormProps) {
  const [isDG, setIsDG] = useState(initialData?.isDG ?? false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(initialData?.status ?? 'ACTIVE');
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState(initialData?.supplier ?? "");
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setIsDG(initialData.isDG);
      setStatus(initialData.status);
      setSupplier(initialData.supplier);
    }
  }, [initialData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(false);
      console.log("File uploaded:", file.name);
    }
  };

  const handleSave = () => {
    toast({
      title: "Success",
      description: "SDS Record has been updated"
    });
  };

  const openSDSInNewTab = () => {
    window.open("/lovable-uploads/efad172c-780d-4fdb-ba96-baa5719330bc.png", '_blank');
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="product-details">SDS Details</TabsTrigger>
                <TabsTrigger value="version">Version History</TabsTrigger>
              </TabsList>

              <TabsContent value="product-details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">SDS Product Name *</Label>
                    <Input 
                      id="productName" 
                      placeholder="Enter SDS product name" 
                      defaultValue={initialData?.productName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherNames">Other SDS Product Names</Label>
                    <Input id="otherNames" placeholder="Enter other SDS product names" />
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
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {supplier
                            ? suppliers.find((s) => s.label === supplier)?.label
                            : "Select supplier..."}
                          <X
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0 opacity-50",
                              !supplier && "hidden"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSupplier("");
                            }}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search suppliers..." />
                          <CommandEmpty>No supplier found.</CommandEmpty>
                          <CommandGroup>
                            {suppliers.map((s) => (
                              <CommandItem
                                key={s.value}
                                value={s.label}
                                onSelect={(currentValue) => {
                                  setSupplier(currentValue === supplier ? "" : currentValue);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    supplier === s.label ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {s.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select 
                      value={status} 
                      onValueChange={(value: "ACTIVE" | "INACTIVE") => setStatus(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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

              <TabsContent value="version">
                <Card className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">User</th>
                          <th className="text-left py-2">SDS File</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">2024-03-15</td>
                          <td>John Doe</td>
                          <td>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-blue-600 hover:text-blue-800"
                              onClick={openSDSInNewTab}
                            >
                              View SDS
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setShowUploadDialog(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload SDS
              </Button>
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

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload SDS Documents</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <input
                type="file"
                id="sdsUpload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="sdsUpload">
                <Button variant="secondary" className="cursor-pointer">
                  Choose file
                </Button>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}