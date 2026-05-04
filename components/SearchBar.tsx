'use client'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    router.push(`/jobs?${params.toString()}`)
  }

  const handleStatus = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== 'ALL') params.set('status', value)
    else params.delete('status')
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
      <Select onValueChange={handleStatus} defaultValue="ALL">
        <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          {['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}