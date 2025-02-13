
import { supabase } from "@/integrations/supabase/client";
import type { SystemSettings } from '@/types/system-settings';

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

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }

  return data;
}

export async function updateSystemSettings(settings: Partial<SystemSettings>) {
  const userId = await getUserId();

  // If no settings exist yet, create a new record
  if (!settings.id) {
    // Ensure required fields are present for new records
    if (!settings.customer_name || !settings.customer_email) {
      throw new Error('Customer name and email are required for new settings');
    }

    const { data: newSettings, error: insertError } = await supabase
      .from('system_settings')
      .insert({
        customer_name: settings.customer_name,
        customer_email: settings.customer_email,
        auto_update_sds: settings.auto_update_sds ?? false,
        logo_path: settings.logo_path,
        updated_by: userId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating system settings:', insertError);
      throw insertError;
    }

    return newSettings;
  }

  // For updates, only update the fields that are provided
  const updateData: any = {
    updated_by: userId
  };

  if (settings.customer_name !== undefined) updateData.customer_name = settings.customer_name;
  if (settings.customer_email !== undefined) updateData.customer_email = settings.customer_email;
  if (settings.auto_update_sds !== undefined) updateData.auto_update_sds = settings.auto_update_sds;
  if (settings.logo_path !== undefined) updateData.logo_path = settings.logo_path;

  const { data, error } = await supabase
    .from('system_settings')
    .update(updateData)
    .eq('id', settings.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }

  return data;
}

export async function uploadLogo(file: File) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading logo:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(filePath);

  return { filePath, publicUrl };
}
