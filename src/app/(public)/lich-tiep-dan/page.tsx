/**
 * @nhom        : Pages / Redirect
 * @chucnang    : Chuyển hướng trang lịch tiếp dân cũ sang khu vực quản trị
 * @lienquan    : src/components/Header.tsx, src/app/admin/login/page.tsx
 * @alias       : lich-tiep-dan-redirect
 */

import { redirect } from 'next/navigation'

export default function LichTiepDanRedirectPage() {
  redirect('/admin')
}
