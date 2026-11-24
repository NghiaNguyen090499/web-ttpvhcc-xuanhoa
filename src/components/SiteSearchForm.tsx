'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type SearchTone = 'hero' | 'compact'

interface SiteSearchFormProps {
  buttonLabel?: string
  className?: string
  defaultValue?: string
  inputClassName?: string
  placeholder?: string
  tone?: SearchTone
}

export default function SiteSearchForm({
  buttonLabel = 'Tìm kiếm',
  className = '',
  defaultValue = '',
  inputClassName = '',
  placeholder = 'Tìm thủ tục, tin tức, văn bản...',
  tone = 'compact',
}: SiteSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const keyword = query.trim()
    if (!keyword) return
    router.push(`/tim-kiem?q=${encodeURIComponent(keyword)}`)
  }

  const isHero = tone === 'hero'

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex w-full overflow-hidden bg-white shadow-lg ${isHero ? 'rounded-xl shadow-blue-950/25' : 'rounded-2xl'} ${className}`}
    >
      <div className={`flex min-w-0 flex-1 items-center gap-3 px-4 ${isHero ? 'md:gap-4 md:px-6' : ''}`}>
        <Search className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={2.2} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`w-full min-w-0 border-0 bg-transparent py-4 text-sm text-text-primary outline-none placeholder:text-text-muted ${isHero ? 'md:py-5 md:text-lg' : ''} ${inputClassName}`}
          aria-label="Tìm kiếm nội dung trên cổng thông tin"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className={`flex min-w-28 items-center justify-center bg-accent px-4 text-sm font-bold text-[#5a3b00] btn-transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50 ${isHero ? 'md:min-w-44 md:px-8 md:text-lg' : 'px-6'}`}
      >
        {buttonLabel}
      </button>
    </form>
  )
}
