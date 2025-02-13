
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from '@/types/supplier';

const setUserContext = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User must be authenticated to perform this action');
  }
  
  // Set the user ID in the PostgreSQL session
  await supabase.rpc('set_user_context', {
    user_id: user.id
  });
};

export async function getSuppliers() {
  console.log('Fetching suppliers from Supabase');
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_name', { ascending: true });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Transform the data to match our frontend Supplier type
    const transformedData: Supplier[] = data.map(item => ({
      id: item.id,
      name: item.supplier_name,
      contactPerson: item.contact_person,
      email: item.email,
      phone: item.phone_number || '',
      address: item.address,
      status: item.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
    }));

    console.log('Successfully fetched suppliers:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    throw error;
  }
}

export async function createSupplier(supplier: Omit<Supplier, 'id'>) {
  console.log('Creating supplier with data:', supplier);
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    // Set user context before operation
    await setUserContext();

    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        supplier_name: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone_number: supplier.phone,
        address: supplier.address,
        status_id: supplier.status === 'ACTIVE' ? 1 : 2
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating supplier:', error);
      throw error;
    }

    // Transform the response data to match our frontend Supplier type
    const transformedData: Supplier = {
      id: data.id,
      name: data.supplier_name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone_number || '',
      address: data.address,
      status: data.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
    };

    console.log('Successfully created supplier:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Failed to create supplier:', error);
    throw error;
  }
}

export async function updateSupplier(id: string, supplier: Partial<Supplier>) {
  console.log('Updating supplier:', id, supplier);
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    // Set user context before operation
    await setUserContext();

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        supplier_name: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone_number: supplier.phone,
        address: supplier.address,
        status_id: supplier.status === 'ACTIVE' ? 1 : 2
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    // Transform the response data to match our frontend Supplier type
    const transformedData: Supplier = {
      id: data.id,
      name: data.supplier_name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone_number || '',
      address: data.address,
      status: data.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
    };

    console.log('Successfully updated supplier:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Failed to update supplier:', error);
    throw error;
  }
}

export async function deleteSupplier(id: string) {
  console.log('Deleting supplier:', id);
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    // Set user context before operation
    await setUserContext();

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }

    console.log('Successfully deleted supplier:', id);
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    throw error;
  }
}
