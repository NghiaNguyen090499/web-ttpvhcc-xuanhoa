/**
 * @nhom        : Admin / Pages
 * @chucnang    : Dashboard — thống kê tổng quan hệ thống (dữ liệu tĩnh + JSON fallback)
 * @lienquan    : src/lib/static-data.ts, data/*.json
 * @alias       : admin-dashboard, tong-quan
 */

import { getNewsData, getProceduresData } from '@/lib/static-data'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  Newspaper, FileText, MessageSquare, HelpCircle,
  TrendingUp, Eye, Layers
} from 'lucide-react'
import Link from 'next/link'

// Đọc dữ liệu feedback/faq từ JSON
function getFeedbackCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'feedbacks.json'), 'utf-8')
    return (JSON.parse(raw) as Array<Record<string, unknown>>).length
  } catch { return 0 }
}

function getFaqCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'faq.json'), 'utf-8')
    return (JSON.parse(raw) as Array<Record<string, unknown>>).length
  } catch { return 0 }
}

function getPendingFeedbackCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'feedbacks.json'), 'utf-8')
    const fbs = JSON.parse(raw) as Array<{ status: string }>
    return fbs.filter((f) => f.status === 'PENDING').length
  } catch { return 0 }
}

export default function AdminDashboard() {
  // Đọc dữ liệu tĩnh cho thống kê
  const news = getNewsData()
  const procedures = getProceduresData()
  const totalCategories = procedures.categories.length
  const totalSubCategories = procedures.categories.reduce(
    (sum, c) => sum + c.subCategories.length, 0
  )
  const feedbackCount = getFeedbackCount()
  const faqCount = getFaqCount()
  const pendingCount = getPendingFeedbackCount()

  // Dữ liệu stat cards
  const stats = [
    {
      label: 'Bài viết',
      value: news.length,
      icon: Newspaper,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600',
      href: '/admin/tin-tuc',
    },
    {
      label: 'Lĩnh vực TTHC',
      value: totalCategories,
      icon: Layers,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600',
      href: '/admin/thu-tuc',
      sub: `${totalSubCategories} thủ tục`,
    },
    {
      label: 'Phản ánh',
      value: feedbackCount,
      icon: MessageSquare,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600',
      href: '/admin/phan-anh',
      sub: pendingCount > 0 ? `${pendingCount} chờ xử lý` : undefined,
      alert: pendingCount > 0,
    },
    {
      label: 'FAQ',
      value: faqCount,
      icon: HelpCircle,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-600',
      href: '/admin/faq',
      sub: 'Cho Chatbot AI',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan hệ thống TTPVHCC Phường Xuân Hòa</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group relative"
            >
              {/* Badge cảnh báo */}
              {stat.alert && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              )}
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.lightColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                {stat.sub && (
                  <p className={`text-[10px] mt-1 ${stat.alert ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                    {stat.sub}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* 2 cột: Bài viết gần đây + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bài viết gần đây */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Bài viết gần đây</h2>
            <Link href="/admin/tin-tuc" className="text-xs text-primary font-medium hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {news.slice(0, 5).map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-mono text-gray-400 w-5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.date} · {item.tag}</p>
                </div>
                <Eye className="w-4 h-4 text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <Link
              href="/admin/tin-tuc?action=create"
              className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            >
              <Newspaper className="w-5 h-5" />
              <span className="text-sm font-medium">Tạo bài viết mới</span>
            </Link>
            <Link
              href="/admin/phan-anh"
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <div className="flex-1">
                <span className="text-sm font-medium">Xem phản ánh</span>
                {pendingCount > 0 && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
                    {pendingCount} mới
                  </span>
                )}
              </div>
            </Link>
            <Link
              href="/admin/faq"
              className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Quản lý FAQ</span>
            </Link>
            <Link
              href="/admin/thu-tuc"
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Quản lý thủ tục</span>
            </Link>
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Xem trang công dân</span>
            </a>
          </div>

          {/* Trạng thái hệ thống */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trạng thái</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  JSON (fallback)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Dữ liệu</span>
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {news.length + totalSubCategories + feedbackCount + faqCount} bản ghi
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Auth</span>
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  JWT Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
