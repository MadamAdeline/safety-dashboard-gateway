
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SDS } from "@/types/sds";
import { SDSRequestDialog } from "./SDSRequestDialog";
import { useGlobalSDSSearch } from "./hooks/use-global-sds-search";
import { SearchFieldsForm } from "./search/SearchFieldsForm";
import { SearchResultsTable } from "./search/SearchResultsTable";
import { SDSPagination } from "./table/SDSPagination";

interface GlobalSDSSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSDSSelect: (selectedSDS: SDS[]) => void;
}

export function GlobalSDSSearchDialog({
  open,
  onOpenChange,
  onSDSSelect,
}: GlobalSDSSearchDialogProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const {
    chatInput,
    setChatInput,
    searchFields,
    setSearchFields,
    searchResults,
    selectedItems,
    handleSearch,
    handleAddToLibrary,
    toggleSelectItem,
    hasSearched
  } = useGlobalSDSSearch(onSDSSelect, onOpenChange);

  const handleRequestComplete = () => {
    setShowRequestDialog(false);
    onOpenChange(false);
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = searchResults.slice(startIndex, endIndex);
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Global SDS Library</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">AI Chat Search</TabsTrigger>
              <TabsTrigger value="fields">Search Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <form onSubmit={handleSearch} className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="chat-input">
                    Describe the SDS you're looking for in detail:
                  </Label>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Welcome! Please describe the SDS you're looking for. Include as much detail as possible, such as:
                        - Product name or type
                        - Manufacturer or supplier
                        - Chemical composition
                        - UN numbers if known
                        - Any other relevant details
                      </p>
                    </div>
                  </ScrollArea>
                  <textarea
                    id="chat-input"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your search query here..."
                  />
                </div>
                <Button type="submit" className="w-full">Search</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="fields" className="flex-1 flex flex-col">
              <SearchFieldsForm
                searchFields={searchFields}
                onSearchFieldsChange={setSearchFields}
                onSubmit={handleSearch}
              />
            </TabsContent>
          </Tabs>

          {hasSearched && searchResults.length > 0 && (
            <div className="mt-4 flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1 border rounded-md">
                <SearchResultsTable
                  searchResults={paginatedResults}
                  selectedItems={selectedItems}
                  onToggleSelect={toggleSelectItem}
                  onRequestSDS={() => setShowRequestDialog(true)}
                  onAddToLibrary={handleAddToLibrary}
                />
              </ScrollArea>
              
              <div className="mt-4">
                <SDSPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  startIndex={startIndex}
                  endIndex={Math.min(endIndex, searchResults.length)}
                  totalItems={searchResults.length}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      
      <SDSRequestDialog 
        open={showRequestDialog} 
        onOpenChange={setShowRequestDialog}
        onRequestComplete={handleRequestComplete}
      />
    </Dialog>
  );
}
