'use client'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const handleSearch = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('search', value)
    else params.delete('search')
    // A new search selects the new top row, not a job the search may now hide.
    params.delete('job')
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 mb-6">
      <Input
        placeholder="Search by company..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />
    </div>
  )
}
