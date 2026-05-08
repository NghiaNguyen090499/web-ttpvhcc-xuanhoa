'use client'

/**
 * @nhom        : Admin / Components
 * @chucnang    : Shell admin — sidebar + header + nội dung chính
 * @lienquan    : src/app/admin/layout.tsx
 * @alias       : admin-shell, admin-wrapper
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Newspaper, MessageSquare, FileText,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

// Menu sidebar
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Tin tức', href: '/admin/tin-tuc', icon: Newspaper },
  { label: 'Phản ánh', href: '/admin/phan-anh', icon: MessageSquare },
  { label: 'Thủ tục HC', href: '/admin/thu-tuc', icon: FileText },
  { label: 'Cài đặt', href: '/admin/cai-dat', icon: Settings },
]

interface AdminShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
  userRole: string
}

export function AdminShell({ children, userName, userEmail, userRole }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Trang login không cần shell
  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">XH</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">TTPVHCC</p>
                <p className="text-[10px] text-gray-400">Xuân Hòa Admin</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                {NAV_ITEMS.find((i) => isActive(i.href))?.label || 'Admin'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase">
              {userRole}
            </span>
            <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-primary transition-colors">
              Xem trang →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
