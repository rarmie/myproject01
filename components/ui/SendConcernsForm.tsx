'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const concernSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  message: z.string().min(1, 'Description of concern is required')
})

type ConcernFormData = z.infer<typeof concernSchema>

export default function SendConcernForm({onClose}: {onClose: () => void}) {
  const router = useRouter()
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ConcernFormData>({
    resolver: zodResolver(concernSchema),
  })

  const onSubmit = async (data: ConcernFormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/concerns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }

      router.refresh()
      onClose()
    } catch (err) {
      console.error('Concern submission failed.', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 flex flex-col'>
        {error && (
          <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input placeholder='Enter your name...' {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input placeholder='Enter your email...' {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            placeholder="Describe the issue..."
            className="rounded-lg border h-40 px-2.5 py-1 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register('message')}
          />
          {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
        </div>

        <Button type='submit' className='max-w-max ms-auto' disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
    </form>
  )
}