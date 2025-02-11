
import * as XLSX from 'xlsx';
import type { Product } from '@/types/product';

export const exportProductsToExcel = (products: Product[]) => {
  console.log('Starting export of products to Excel:', products.length, 'products');
  
  // Transform the data for export
  const exportData = products.map(product => ({
    'Product Name': product.name,
    'Product Code': product.code,
    'Brand Name': product.brandName || '',
    'Unit Size': product.unitSize || '',
    'Unit': product.unit || '',
    'Description': product.description || '',
    'Other Names': product.otherNames || '',
    'Uses': product.uses || '',
    'Status': product.status,
    'Is DG': product.sds?.isDG ? 'Yes' : 'No',
    'DG Class': product.sds?.dgClass?.label || '',
    'Supplier': product.sds?.supplier?.supplier_name || '',
    'Packing Group': product.sds?.packingGroup?.label || '',
    'Product Set': product.productSet ? 'Yes' : 'No',
    'Aerosol': product.aerosol ? 'Yes' : 'No',
    'Cryogenic Fluid': product.cryogenicFluid ? 'Yes' : 'No'
  }));

  console.log('Transformed data for export:', exportData);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Generate Excel file
  XLSX.writeFile(wb, `Products_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  console.log('Export completed successfully');
};

export const exportSiteRegistersToExcel = (siteRegisters: any[]) => {
  console.log('Starting export of site registers to Excel:', siteRegisters.length, 'site registers');
  
  // Transform the data for export
  const exportData = siteRegisters.map(register => ({
    'Location': register.location?.name || '',
    'Product': register.product?.name || '',
    'Created At': register.created_at || '',
    'Updated At': register.updated_at || ''
  }));

  console.log('Transformed data for export:', exportData);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Site Registers');

  // Generate Excel file
  XLSX.writeFile(wb, `Site_Registers_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  console.log('Export completed successfully');
};
