'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { messageFromResponse } from '@/lib/api-error'

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export default function DeleteJobButton({
  jobId,
  company,
  role,
  contactCount,
  documentCount,
}: {
  jobId: string
  company: string
  role: string
  contactCount: number
  documentCount: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [isDeleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })

      const message = await messageFromResponse(res)
      if (message) {
        setError(message)
        return
      }

      // Drop ?job but keep the filters. replace, not push, so Back doesn't return to a
      // deleted job. refresh after navigating, so the list re-renders without the row.
      const params = new URLSearchParams(searchParams.toString())
      params.delete('job')
      const query = params.toString()
      setOpen(false)
      router.replace(query ? `/jobs?${query}` : '/jobs')
      router.refresh()
    } catch (err) {
      console.error('Job delete failed.', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(null) }}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {company}?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes the {role} application at {company}, along with its{' '}
            {plural(contactCount, 'contact')} and {plural(documentCount, 'document link')}. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction: Action closes the dialog on click,
              and a failed delete should keep it open to show the error. */}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
