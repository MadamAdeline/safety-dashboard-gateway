
import * as XLSX from 'xlsx';
import type { User } from '@/types/user';

// Define the extended type that includes user_roles, similar to UserList.tsx
type UserWithRelations = Omit<User, 'manager'> & {
  user_roles?: {
    role_id: string;
    roles: {
      role_name: string;
    };
  }[];
  location?: {
    name: string;
  } | null;
};

export const exportUsersToExcel = (users: UserWithRelations[]) => {
  console.log('Starting export of users to Excel:', users.length, 'users');
  
  // Transform the data for export
  const exportData = users.map(user => ({
    'First Name': user.first_name,
    'Last Name': user.last_name,
    'Email': user.email,
    'Phone Number': user.phone_number || '',
    'Status': user.active,
    'Location': user.location?.name || '', // Changed from full_path to name since that's what's in the type
    'Roles': (user.user_roles || []).map(ur => ur.roles.role_name).join(', ') // Added null check with empty array default
  }));

  console.log('Transformed data for export:', exportData);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  // Generate Excel file
  XLSX.writeFile(wb, `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  console.log('Export completed successfully');
};
