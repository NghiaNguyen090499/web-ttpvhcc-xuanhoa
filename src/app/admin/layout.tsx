/**
 * @nhom        : Admin / Layout
 * @chucnang    : Layout quản trị — sidebar + header + content
 * @lienquan    : src/lib/auth.ts
 * @alias       : admin-layout
 */

import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: { default: 'Quản trị | TTPVHCC Xuân Hòa', template: '%s | Quản trị TTPVHCC' },
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <AdminShell
      userName={session?.name || 'Admin'}
      userEmail={session?.email || ''}
      userRole={session?.role || 'EDITOR'}
    >
      {children}
    </AdminShell>
  )
}
