export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
};

export type SupplierFilters = {
  search: string;
  status: ("ACTIVE" | "INACTIVE")[];
};