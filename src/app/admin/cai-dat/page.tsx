/**
 * @nhom        : Admin / Pages
 * @chucnang    : Trang cài đặt hệ thống — thông tin website + trạng thái kết nối
 * @lienquan    : src/lib/db.ts, src/lib/auth.ts, src/lib/portal-db.ts
 * @alias       : admin-settings, cai-dat
 */

import { Shield, Database, Globe, Server, Clock, MapPin } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { hasDatabase } from '@/lib/admin-db'
import { AdminUsersManager } from '@/components/admin/AdminUsersManager'
import { getPortalWardInfo } from '@/lib/portal-db'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
        <h1 className="text-lg font-bold text-amber-900">Không đủ quyền</h1>
        <p className="mt-2 text-sm text-amber-800">Chỉ ADMIN mới được truy cập trang cài đặt và phân quyền.</p>
      </div>
    )
  }

  const wardInfo = await getPortalWardInfo()
  const databaseConnected = hasDatabase()

  // Thông tin cấu hình hiện tại
  const configs = [
    {
      label: 'Tên đơn vị',
      value: wardInfo.center.name,
      icon: Globe,
    },
    {
      label: 'Địa chỉ',
      value: `${wardInfo.ward.address}, ${wardInfo.ward.city}`,
      icon: MapPin,
    },
    {
      label: 'Giờ làm việc',
      value: `T2-T6: ${wardInfo.workingHours.weekdays} | T7: ${wardInfo.workingHours.saturday}`,
      icon: Clock,
    },
  ]

  // Trạng thái hệ thống
  const systemStatus = [
    {
      label: 'Database',
      status: databaseConnected ? 'ok' as const : 'warning' as const,
      detail: databaseConnected ? 'PostgreSQL + Prisma' : 'JSON fallback — chưa kết nối PostgreSQL',
      icon: Database,
    },
    {
      label: 'Authentication',
      status: 'ok' as const,
      detail: 'Tài khoản nội bộ + JWT',
      icon: Shield,
    },
    {
      label: 'Framework',
      status: 'ok' as const,
      detail: 'Next.js 16.2.6 (Turbopack)',
      icon: Server,
    },
  ]

  const statusColors = {
    ok: 'bg-green-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-500">Thông tin hệ thống và cấu hình</p>
      </div>

      {/* Thông tin đơn vị */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Thông tin đơn vị</h2>
        <div className="space-y-4">
          {configs.map((cfg) => {
            const Icon = cfg.icon
            return (
              <div key={cfg.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{cfg.label}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{cfg.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trạng thái hệ thống */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Trạng thái hệ thống</h2>
        <div className="space-y-3">
          {systemStatus.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Icon className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[item.status]}`} />
              </div>
            )
          })}
        </div>
      </div>

      <AdminUsersManager />

      {/* Ghi chú */}
      {!databaseConnected && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="text-sm text-amber-800 font-medium">Hệ thống đang chạy ở chế độ Demo</p>
          <p className="text-xs text-amber-700 mt-1">
            Dữ liệu được đọc/ghi từ file JSON. Khi kết nối PostgreSQL qua DATABASE_URL, hệ thống sẽ chuyển sang Prisma ORM.
          </p>
        </div>
      )}
    </div>
  )
}
