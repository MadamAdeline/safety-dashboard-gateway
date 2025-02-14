
export type Supplier = {
  id: string;
  supplier_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
};

export type SupplierFilters = {
  search: string;
  status: ("ACTIVE" | "INACTIVE")[];
};
