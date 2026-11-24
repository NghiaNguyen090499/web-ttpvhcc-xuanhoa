import { cpSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const sourceDir = join(process.cwd(), 'node_modules', 'tinymce')
const targetDir = join(process.cwd(), 'public', 'tinymce')

if (!existsSync(sourceDir)) {
  console.warn('[TinyMCE] Bỏ qua copy assets vì chưa có node_modules/tinymce')
  process.exit(0)
}

rmSync(targetDir, { recursive: true, force: true })
cpSync(sourceDir, targetDir, { recursive: true })

console.log('[TinyMCE] Đã copy assets vào public/tinymce')
