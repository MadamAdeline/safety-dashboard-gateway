
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductReadOnlyFormProps {
  onClose: () => void;
  data: Product;
}

export function ProductReadOnlyForm({ onClose, data }: ProductReadOnlyFormProps) {
  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-dgxprt-navy">View Product</h2>
          <p className="text-gray-500">View product details</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="sds">SDS Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{data.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <p className="mt-1 text-gray-900">{data.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Brand Name</label>
                <p className="mt-1 text-gray-900">{data.brandName || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unit Size</label>
                <p className="mt-1 text-gray-900">{data.unitSize || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unit of Measure</label>
                <p className="mt-1 text-gray-900">{data.uom?.label || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{data.description || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Other Names</label>
                <p className="mt-1 text-gray-900">{data.otherNames || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Uses</label>
                <p className="mt-1 text-gray-900">{data.uses || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-gray-900">{data.status}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sds">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Dangerous Goods</label>
                <p className="mt-1 text-gray-900">{data.sds?.isDG ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">DG Class</label>
                <p className="mt-1 text-gray-900">{data.sds?.dgClass?.label || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <p className="mt-1 text-gray-900">{data.sds?.supplier?.supplier_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Packing Group</label>
                <p className="mt-1 text-gray-900">{data.sds?.packingGroup?.label || "-"}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
