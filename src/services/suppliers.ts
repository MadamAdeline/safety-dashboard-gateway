import { getSupabaseClient } from '@/lib/supabase';
import type { Supplier } from '@/types/supplier';

export async function getSuppliers() {
  console.log('Fetching suppliers from Supabase');
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    console.log('Successfully fetched suppliers:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    throw error;
  }
}

export async function createSupplier(supplier: Omit<Supplier, 'id'>) {
  console.log('Creating supplier:', supplier);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }

    console.log('Created supplier:', data);
    return data;
  } catch (error) {
    console.error('Failed to create supplier:', error);
    throw error;
  }
}

export async function updateSupplier(id: string, supplier: Partial<Supplier>) {
  console.log('Updating supplier:', id, supplier);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    console.log('Updated supplier:', data);
    return data;
  } catch (error) {
    console.error('Failed to update supplier:', error);
    throw error;
  }
}

export async function deleteSupplier(id: string) {
  console.log('Deleting supplier:', id);
  try {
    const supabase = getSupabaseClient();
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