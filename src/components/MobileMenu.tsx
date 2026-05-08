'use client'

/**
 * @nhom        : Components / Layout
 * @chucnang    : Menu mobile — slide-in tông đỏ
 * @lienquan    : src/components/Header.tsx
 * @alias       : mobile-menu, hamburger
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavItem { label: string; href: string }

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  // Khóa scroll khi mở menu
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="nav:hidden">
      {/* Hamburger */}
      <button onClick={() => setOpen(true)} className="p-2 text-text-primary" aria-label="Mở menu" id="btn-open-menu">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-bold text-primary font-heading uppercase tracking-wide">Menu</span>
          <button onClick={() => setOpen(false)} className="p-2 text-text-muted hover:text-primary" aria-label="Đóng menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-text-primary rounded-xl hover:bg-cream hover:text-primary btn-transition">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="p-4 mt-auto">
          <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark btn-transition">
            Nộp hồ sơ online ↗
          </a>
        </div>
      </div>
    </div>
  )
}
