import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SDSVersionTabProps {
  onOpenSDS: () => void;
}

export function SDSVersionTab({ onOpenSDS }: SDSVersionTabProps) {
  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">SDS File</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">2024-03-15</td>
              <td>John Doe</td>
              <td>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  onClick={onOpenSDS}
                >
                  View SDS
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}