'use client'

/**
 * @nhom        : Admin / Components
 * @chucnang    : Quản lý người dùng và phân quyền CMS
 * @lienquan    : src/app/api/admin/users/route.ts
 * @alias       : admin-users-manager
 */

import { useEffect, useState } from 'react'
import { Check, Pencil, Plus, ShieldCheck, Trash2, UserRound, X } from 'lucide-react'

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

interface AdminUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  isActive: boolean
  lastLoginAt?: string | null
}

type AdminUserPatch = Partial<Pick<AdminUser, 'email' | 'name' | 'role' | 'isActive'>> & { password?: string }

type Notice = {
  type: 'success' | 'error'
  text: string
}

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Quản trị',
  EDITOR: 'Biên tập',
  VIEWER: 'Chỉ xem',
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'VIEWER' as UserRole })
  const [editDraft, setEditDraft] = useState({ email: '', name: '', role: 'VIEWER' as UserRole, isActive: true })
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<Notice | null>(null)

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
      setCurrentUserId(data.currentUserId || '')
      if (!res.ok) setMessage({ type: 'error', text: data.error || 'Không thể tải danh sách người dùng' })
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải danh sách người dùng' })
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
        if (active) setCurrentUserId(data.currentUserId || '')
        if (active && data.error) setMessage({ type: 'error', text: data.error })
      })
      .catch(() => {
        if (active) setMessage({ type: 'error', text: 'Không thể tải danh sách người dùng' })
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
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Không thể tạo người dùng' })
        return
      }
      setForm({ email: '', name: '', password: '', role: 'VIEWER' })
      setMessage({ type: 'success', text: 'Đã lưu tài khoản mới' })
      await fetchUsers()
    } finally {
      setSavingId('')
    }
  }

  async function updateUser(user: AdminUser, patch: AdminUserPatch): Promise<boolean> {
    setSavingId(user.id)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...patch }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Không thể cập nhật người dùng' })
        return false
      }
      setPasswordDrafts((current) => ({ ...current, [user.id]: '' }))
      setMessage({ type: 'success', text: 'Đã cập nhật tài khoản' })
      await fetchUsers()
      return true
    } finally {
      setSavingId('')
    }
  }

  function startEdit(user: AdminUser) {
    setEditingId(user.id)
    setEditDraft({
      email: user.email,
      name: user.name || '',
      role: user.role,
      isActive: user.isActive,
    })
    setMessage(null)
  }

  function cancelEdit() {
    setEditingId('')
    setEditDraft({ email: '', name: '', role: 'VIEWER', isActive: true })
  }

  async function saveEdit(user: AdminUser) {
    const success = await updateUser(user, {
      email: editDraft.email,
      name: editDraft.name,
      role: editDraft.role,
      isActive: editDraft.isActive,
    })
    if (success) cancelEdit()
  }

  async function deleteUser(user: AdminUser) {
    if (user.id === currentUserId) {
      setMessage({ type: 'error', text: 'Không thể tự xóa tài khoản đang đăng nhập' })
      return
    }

    const confirmed = window.confirm(`Xóa tài khoản ${user.email}? Bài viết đã tạo sẽ được chuyển sang tài khoản ADMIN hiện tại.`)
    if (!confirmed) return

    setSavingId(`delete:${user.id}`)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Không thể xóa người dùng' })
        return
      }
      setMessage({ type: 'success', text: 'Đã xóa tài khoản' })
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
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-100 bg-green-50 text-green-800'
            : 'border-amber-100 bg-amber-50 text-amber-800'
        }`}>
          {message.text}
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
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Mật khẩu</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isEditing = editingId === user.id
                const isSelf = currentUserId === user.id
                const isSaving = savingId === user.id || savingId === `delete:${user.id}`

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                          <UserRound className="h-4 w-4" />
                        </div>
                        {isEditing ? (
                          <div className="grid w-full max-w-sm gap-2">
                            <input
                              value={editDraft.name}
                              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary"
                              placeholder="Họ tên"
                            />
                            <input
                              type="email"
                              value={editDraft.email}
                              onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                              disabled={isSelf}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary disabled:bg-gray-50"
                              placeholder="Email đăng nhập"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={isEditing ? editDraft.role : user.role}
                        onChange={(e) => {
                          const role = e.target.value as UserRole
                          if (isEditing) {
                            setEditDraft({ ...editDraft, role })
                            return
                          }
                          updateUser(user, { role })
                        }}
                        disabled={isSaving || (isEditing && isSelf)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary disabled:bg-gray-50"
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
                          disabled={!passwordDrafts[user.id] || passwordDrafts[user.id].length < 8 || isSaving}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          Đổi
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editDraft.isActive ? 'active' : 'locked'}
                          onChange={(e) => setEditDraft({ ...editDraft, isActive: e.target.value === 'active' })}
                          disabled={isSelf || isSaving}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-primary disabled:bg-gray-50"
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="locked">Đã khóa</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => updateUser(user, { isActive: !user.isActive })}
                          disabled={isSelf || isSaving}
                          className={`rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => saveEdit(user)}
                            disabled={isSaving || !editDraft.email.trim()}
                            title="Lưu thay đổi"
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            title="Hủy sửa"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            disabled={isSaving}
                            title="Sửa tài khoản"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={isSelf || isSaving}
                            title={isSelf ? 'Không thể tự xóa tài khoản đang đăng nhập' : 'Xóa tài khoản'}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
