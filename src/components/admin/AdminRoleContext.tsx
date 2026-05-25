'use client'

/**
 * @nhom        : Admin / Components
 * @chucnang    : Context phân quyền cho giao diện CMS
 * @lienquan    : src/components/admin/AdminShell.tsx
 * @alias       : admin-role-context
 */

import { createContext, useContext } from 'react'

export type AdminRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

const ROLE_RANK: Record<AdminRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
}

const AdminRoleContext = createContext<AdminRole>('VIEWER')

export function AdminRoleProvider({
  role,
  children,
}: {
  role: AdminRole
  children: React.ReactNode
}) {
  return (
    <AdminRoleContext.Provider value={role}>
      {children}
    </AdminRoleContext.Provider>
  )
}

export function useAdminRole() {
  const role = useContext(AdminRoleContext)

  return {
    role,
    canEdit: ROLE_RANK[role] >= ROLE_RANK.EDITOR,
    canDelete: role === 'ADMIN',
    isAdmin: role === 'ADMIN',
    hasAtLeast(requiredRole: AdminRole) {
      return ROLE_RANK[role] >= ROLE_RANK[requiredRole]
    },
  }
}
