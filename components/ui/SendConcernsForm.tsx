'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import FormField from '@/components/FormField'
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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      {error && (
        <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
          {error}
        </p>
      )}

      {/* Every field is required, so none gets a * (it only marks required fields in mixed forms). */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <FormField id="concern-name" label="Name" error={errors.name?.message}>
          <Input
            id="concern-name"
            placeholder="e.g. Alex Cruz"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'concern-name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField id="concern-email" label="Email" error={errors.email?.message}>
          <Input
            id="concern-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'concern-email-error' : undefined}
            {...register('email')}
          />
        </FormField>

        <FormField id="concern-message" label="Description" error={errors.message?.message} className="sm:col-span-2">
          <Textarea
            id="concern-message"
            className="h-36 max-h-36"
            placeholder="What happened, and what did you expect to happen?"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'concern-message-error' : undefined}
            {...register('message')}
          />
        </FormField>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </DialogFooter>
    </form>
  )
}