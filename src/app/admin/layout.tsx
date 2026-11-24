/**
 * @nhom        : Admin / Layout
 * @chucnang    : Layout quản trị — sidebar + header + content
 * @lienquan    : src/lib/auth.ts
 * @alias       : admin-layout
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import type { AdminRole } from '@/components/admin/AdminRoleContext'

export const metadata: Metadata = {
  title: { default: 'Quản trị | TTPVHCC Xuân Hòa', template: '%s | Quản trị TTPVHCC' },
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const pathname = (await headers()).get('x-admin-pathname') || ''

  // Phiên bị khóa / thu hồi / hết hạn (proxy chỉ kiểm tra chữ ký JWT) → về trang đăng nhập
  if (!session && !pathname.startsWith('/admin/login')) {
    redirect('/admin/login')
  }

  return (
    <AdminShell
      userName={session?.name || 'Admin'}
      userEmail={session?.email || ''}
      userRole={(session?.role || 'VIEWER') as AdminRole}
    >
      {children}
    </AdminShell>
  )
}
