import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardBottomNav from '@/components/DashboardBottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-shell">
        <DashboardSidebar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
      <DashboardBottomNav />
    </>
  )
}
