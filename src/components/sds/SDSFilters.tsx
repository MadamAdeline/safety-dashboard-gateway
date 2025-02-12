
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { SDSFilters as SDSFiltersType } from "@/types/sds";

interface SDSFiltersProps {
  filters: SDSFiltersType;
  onFiltersChange: (filters: SDSFiltersType) => void;
}

export function SDSFilters({ filters, onFiltersChange }: SDSFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Date Field</Label>
          <Select
            value={filters.dateField || ""}
            onValueChange={(value: any) =>
              onFiltersChange({
                ...filters,
                dateField: value || null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="issueDate">Issue Date</SelectItem>
              <SelectItem value="expiryDate">Expiry Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.dateField && (
          <div>
            <Label>Date Type</Label>
            <Select
              value={filters.dateType || ""}
              onValueChange={(value: any) =>
                onFiltersChange({
                  ...filters,
                  dateType: value || null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="after">After</SelectItem>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="between">Between</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.dateType && (
          <div>
            <Label>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(new Date(filters.dateFrom), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) =>
                    onFiltersChange({
                      ...filters,
                      dateFrom: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {filters.dateType === "between" && (
          <div>
            <Label>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? (
                    format(new Date(filters.dateTo), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) =>
                    onFiltersChange({
                      ...filters,
                      dateTo: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}
