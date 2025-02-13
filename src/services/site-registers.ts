import { supabase } from "@/integrations/supabase/client";
import type { SiteRegister } from '@/types/site-register';

const getUserId = async () => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      throw new Error('Could not find user');
    }

    return userData.id;
  } catch (error) {
    console.error('Error in getUserId:', error);
    throw error;
  }
};

export async function createSiteRegister(siteRegister: Omit<SiteRegister, 'id'>) {
  try {
    const userId = await getUserId();
    console.log('Current user ID:', userId);

    const { data, error } = await supabase
      .from('site_registers')
      .insert([{
        ...siteRegister,
        updated_by: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating site register:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned after creating site register');
    }

    return data;
  } catch (error) {
    console.error('Failed to create site register:', error);
    throw error;
  }
}

export async function updateSiteRegister(id: string, siteRegister: Partial<SiteRegister>) {
  try {
    const userId = await getUserId();
    console.log('Current user ID for update:', userId);

    const updateData = {
      ...siteRegister,
      updated_by: userId
    };

    const { data, error } = await supabase
      .from('site_registers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating site register:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned after updating site register');
    }

    return data;
  } catch (error) {
    console.error('Failed to update site register:', error);
    throw error;
  }
}
