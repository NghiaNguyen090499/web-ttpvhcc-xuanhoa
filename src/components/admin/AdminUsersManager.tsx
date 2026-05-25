'use client'

/**
 * @nhom        : Admin / Components
 * @chucnang    : Quản lý người dùng và phân quyền CMS
 * @lienquan    : src/app/api/admin/users/route.ts
 * @alias       : admin-users-manager
 */

import { useEffect, useState } from 'react'
import { Plus, Save, ShieldCheck, UserRound } from 'lucide-react'

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

interface AdminUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  isActive: boolean
  lastLoginAt?: string | null
}

type AdminUserPatch = Partial<AdminUser> & { password?: string }

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Quản trị',
  EDITOR: 'Biên tập',
  VIEWER: 'Chỉ xem',
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'VIEWER' as UserRole })
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
      if (!res.ok) setMessage(data.error || 'Không thể tải danh sách người dùng')
    } catch {
      setMessage('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (active) setUsers(data.users || [])
        if (active && data.error) setMessage(data.error)
      })
      .catch(() => {
        if (active) setMessage('Không thể tải danh sách người dùng')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function createUser() {
    if (!form.email.trim()) return
    setSavingId('new')
    setMessage('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Không thể tạo người dùng')
        return
      }
      setForm({ email: '', name: '', password: '', role: 'VIEWER' })
      await fetchUsers()
    } finally {
      setSavingId('')
    }
  }

  async function updateUser(user: AdminUser, patch: AdminUserPatch) {
    setSavingId(user.id)
    setMessage('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...patch }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Không thể cập nhật người dùng')
        return
      }
      setPasswordDrafts((current) => ({ ...current, [user.id]: '' }))
      await fetchUsers()
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Phân quyền CMS</h2>
          <p className="text-sm text-gray-500">ADMIN toàn quyền, EDITOR sửa nội dung, VIEWER chỉ xem.</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      )}

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_180px_160px_auto]">
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="email@xuanhoa.gov.vn"
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="Họ tên"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="Mật khẩu ban đầu"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
        >
          {Object.entries(ROLE_LABEL).map(([role, label]) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>
        <button
          onClick={createUser}
          disabled={savingId === 'new' || !form.email.trim() || form.password.length < 8}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Mật khẩu</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user, { role: e.target.value as UserRole })}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary"
                    >
                      {Object.entries(ROLE_LABEL).map(([role, label]) => (
                        <option key={role} value={role}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={passwordDrafts[user.id] || ''}
                        onChange={(e) => setPasswordDrafts((current) => ({ ...current, [user.id]: e.target.value }))}
                        className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary"
                        placeholder="Đổi mật khẩu"
                      />
                      <button
                        onClick={() => updateUser(user, { password: passwordDrafts[user.id] })}
                        disabled={!passwordDrafts[user.id] || passwordDrafts[user.id].length < 8 || savingId === user.id}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        Đổi
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateUser(user, { isActive: !user.isActive })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {savingId === user.id ? (
                      <span className="text-xs text-gray-400">Đang lưu...</span>
                    ) : (
                      <Save className="ml-auto h-4 w-4 text-gray-300" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
