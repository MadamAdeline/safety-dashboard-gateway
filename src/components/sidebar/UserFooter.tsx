import { Link } from "react-router-dom"
import { LogOut, User } from "lucide-react"
import { SidebarFooter } from "@/components/ui/sidebar"

export function UserFooter() {
  return (
    <SidebarFooter className="mt-auto border-t border-dgxprt-sidebar p-4">
      <div className="flex items-center gap-2 px-2 py-2 text-white">
        <User className="h-4 w-4" />
        <span className="font-medium">John Doe</span>
      </div>
      <Link 
        to="/logout" 
        className="flex items-center gap-2 px-2 py-2 text-white font-medium hover:bg-dgxprt-hover hover:text-dgxprt-sidebar rounded-md"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Link>
    </SidebarFooter>
  )
}