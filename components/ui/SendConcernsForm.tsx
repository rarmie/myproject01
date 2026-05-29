'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

  const { register, handleSubmit, formState: { errors } } = useForm<ConcernFormData>({
    resolver: zodResolver(concernSchema),
  })

  const onSubmit = async (data: ConcernFormData) => {
    await fetch('/api/concerns', {
      method: 'POST',
      headers: { 'Content-Type': 'concern/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 flex flex-col'>
        <div>
          <label className="">Name</label>
          <Input placeholder='Enter your name...' {...register('name')} required/>
        </div>

        <div>
          <label className="">Email</label>
          <Input placeholder='Enter your email...' {...register('email')} required/>
        </div>
        

        <div className='flex flex-col'>
          <label className="">Description</label>
          <textarea 
          placeholder="Describe the issue..." 
          className="rounded-lg border h-40 px-2.5 py-1 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"        
          {...register('message')}
          required>
          </textarea>
        </div>
        
        <Button type='submit' className='max-w-max ms-auto'>Send</Button>
    </form>
  )
}