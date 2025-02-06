
import { DashboardLayout } from "@/components/DashboardLayout"
import { AlertCircle } from "lucide-react"

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertCircle className="w-16 h-16 text-dgxprt-purple mb-4" />
        <h1 className="text-3xl font-bold text-dgxprt-navy mb-2">{feature}</h1>
        <p className="text-xl text-gray-600">Coming Soon</p>
      </div>
    </DashboardLayout>
  )
}
