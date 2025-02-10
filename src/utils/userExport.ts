
import * as XLSX from 'xlsx';
import type { User } from '@/types/user';

export const exportUsersToExcel = (users: User[]) => {
  console.log('Starting export of users to Excel:', users.length, 'users');
  
  // Transform the data for export
  const exportData = users.map(user => ({
    'First Name': user.first_name,
    'Last Name': user.last_name,
    'Email': user.email,
    'Phone Number': user.phone_number || '',
    'Status': user.active,
    'Location': user.location?.full_path || '',
    'Roles': user.user_roles?.map(ur => ur.roles.role_name).join(', ') || ''
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
