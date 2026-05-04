'use client'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WISHLIST']

function DraggableJob({ job }: { job: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: job.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="mb-2 cursor-grab">
        <CardContent className="p-3">
          <p className="font-semibold">{job.company}</p>
          <p className="text-sm text-muted-foreground">{job.role}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DroppableColumn({ status, jobs }: { status: string; jobs: any[] }) {
  const { setNodeRef } = useDroppable({ id: status })
  return (
    <div ref={setNodeRef} className="bg-muted rounded-lg p-4 min-h-[400px] w-60">
      <h3 className="font-bold mb-4">{status}</h3>
      {jobs.map((job) => <DraggableJob key={job.id} job={job} />)}
    </div>
  )
}

export default function KanbanBoard({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as string
    setJobs((prev) => prev.map((j) => j.id === active.id ? { ...j, status: newStatus } : j))

    await fetch(`/api/jobs/${active.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            jobs={jobs.filter((j) => j.status === status)}
          />
        ))}
      </div>
    </DndContext>
  )
}