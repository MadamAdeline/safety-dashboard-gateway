
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";
import { SupplierStep } from "./steps/SupplierStep";
import { SDSSearchStep } from "./steps/SDSSearchStep";
import { ProductSetupStep } from "./steps/ProductSetupStep";
import type { Supplier } from "@/types/supplier";
import type { SDS } from "@/types/sds";

interface ProductWizardProps {
  open?: boolean;
  onClose: () => void;
}

export function ProductWizard({ onClose }: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSDS, setSelectedSDS] = useState<SDS | null>(null);

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setStep(2);
  };

  const handleSDSSelect = (sds: SDS) => {
    setSelectedSDS(sds);
    setStep(3);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Setup Wizard</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Selection Summary */}
      <div className="flex flex-wrap gap-4 items-center">
        {selectedSupplier && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Supplier:</span>
            <span className="bg-dgxprt-purple/10 px-3 py-1 rounded">
              {selectedSupplier.supplier_name}
            </span>
          </div>
        )}
        {selectedSDS && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">SDS:</span>
            <span className="bg-dgxprt-purple/10 px-3 py-1 rounded">
              {selectedSDS.productName}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between my-8">
        <div className="flex items-center w-full">
          <div className={`flex-1 h-2 ${step >= 1 ? 'bg-dgxprt-purple' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-dgxprt-purple text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <div className={`flex-1 h-2 ${step >= 2 ? 'bg-dgxprt-purple' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-dgxprt-purple text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <div className={`flex-1 h-2 ${step >= 3 ? 'bg-dgxprt-purple' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 3 ? 'bg-dgxprt-purple text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <div className={`flex-1 h-2 ${step >= 3 ? 'bg-dgxprt-purple' : 'bg-gray-200'}`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <SupplierStep 
            onSupplierSelect={handleSupplierSelect}
            selectedSupplier={selectedSupplier}
          />
        )}
        {step === 2 && (
          <SDSSearchStep 
            supplier={selectedSupplier}
            onSDSSelect={handleSDSSelect}
            selectedSDS={selectedSDS}
          />
        )}
        {step === 3 && (
          <ProductSetupStep 
            supplier={selectedSupplier}
            sds={selectedSDS}
            onComplete={onClose}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          Back
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
