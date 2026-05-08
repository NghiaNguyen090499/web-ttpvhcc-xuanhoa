/**
 * @nhom        : Pages / Auth
 * @chucnang    : Redirect /login → /admin/login
 * @alias       : login-redirect
 */

import { redirect } from 'next/navigation'

export default function LoginRedirect() {
  redirect('/admin/login')
}
