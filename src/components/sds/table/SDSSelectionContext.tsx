import { createContext, useContext, ReactNode } from 'react';

interface SDSSelectionContextType {
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
}

const SDSSelectionContext = createContext<SDSSelectionContextType | undefined>(undefined);

export function useSDSSelection() {
  const context = useContext(SDSSelectionContext);
  if (!context) {
    throw new Error('useSDSSelection must be used within a SDSSelectionProvider');
  }
  return context;
}

interface SDSSelectionProviderProps {
  children: ReactNode;
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
}

export function SDSSelectionProvider({ 
  children, 
  selectedItems, 
  onSelectionChange 
}: SDSSelectionProviderProps) {
  const toggleSelectItem = (id: string) => {
    console.log('Toggling selection for item:', id);
    onSelectionChange(
      selectedItems.includes(id)
        ? selectedItems.filter(item => item !== id)
        : [...selectedItems, id]
    );
  };

  const toggleSelectAll = (ids: string[]) => {
    console.log('Toggling selection for all items');
    onSelectionChange(
      selectedItems.length === ids.length ? [] : ids
    );
  };

  return (
    <SDSSelectionContext.Provider value={{ selectedItems, toggleSelectItem, toggleSelectAll }}>
      {children}
    </SDSSelectionContext.Provider>
  );
}