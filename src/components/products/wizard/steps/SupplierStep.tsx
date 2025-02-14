
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import { SupplierForm } from "@/components/suppliers/SupplierForm";

interface SupplierStepProps {
  onSupplierSelect: (supplier: Supplier) => void;
  selectedSupplier: Supplier | null;
}

export function SupplierStep({ onSupplierSelect, selectedSupplier }: SupplierStepProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      const query = supabase
        .from('suppliers')
        .select('*')
        .eq('status_id', 1);

      if (search) {
        query.ilike('supplier_name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(supplier => ({
        id: supplier.id,
        name: supplier.supplier_name,
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone_number || '',
        address: supplier.address,
        status: supplier.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
      }));
    }
  });

  if (showForm) {
    return (
      <SupplierForm 
        onClose={() => setShowForm(false)}
        onSave={(supplier) => {
          setShowForm(false);
          onSupplierSelect(supplier);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Step 1: Select a Supplier</h3>
        <p className="text-gray-600">
          Search for an existing supplier or create a new one.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Supplier
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
          <div className="font-semibold">Supplier Name</div>
          <div className="font-semibold">Contact Person</div>
          <div className="font-semibold">Email</div>
        </div>
        <div className="divide-y">
          {suppliers.map((supplier) => (
            <div 
              key={supplier.id}
              className={`grid grid-cols-3 gap-4 p-4 cursor-pointer hover:bg-gray-50 ${
                selectedSupplier?.id === supplier.id ? 'bg-dgxprt-purple/10' : ''
              }`}
              onClick={() => onSupplierSelect(supplier)}
            >
              <div>{supplier.name}</div>
              <div>{supplier.contactPerson}</div>
              <div>{supplier.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
