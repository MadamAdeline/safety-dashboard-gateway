import { getSupabaseClient } from '@/integrations/supabase/client';
import type { MasterData } from '@/types/masterData';

export async function getMasterData() {
  console.log('Fetching master data from Supabase');
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('master_data')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching master data:', error);
      throw error;
    }

    console.log('Successfully fetched master data:', data);
    return data as MasterData[];
  } catch (error) {
    console.error('Failed to fetch master data:', error);
    throw error;
  }
}

export async function createMasterData(masterData: Omit<MasterData, 'id' | 'created_at' | 'updated_at'>) {
  console.log('Creating master data:', masterData);
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('master_data')
      .insert([masterData])
      .select()
      .single();

    if (error) {
      console.error('Error creating master data:', error);
      throw error;
    }

    console.log('Successfully created master data:', data);
    return data as MasterData;
  } catch (error) {
    console.error('Failed to create master data:', error);
    throw error;
  }
}

export async function updateMasterData(id: string, masterData: Partial<MasterData>) {
  console.log('Updating master data:', id, masterData);
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('master_data')
      .update(masterData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating master data:', error);
      throw error;
    }

    console.log('Successfully updated master data:', data);
    return data as MasterData;
  } catch (error) {
    console.error('Failed to update master data:', error);
    throw error;
  }
}

export async function deleteMasterData(id: string) {
  console.log('Deleting master data:', id);
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
      .from('master_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting master data:', error);
      throw error;
    }

    console.log('Successfully deleted master data:', id);
  } catch (error) {
    console.error('Failed to delete master data:', error);
    throw error;
  }
}