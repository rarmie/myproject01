import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession(authOptions)

  if (!session?.user.id) {
    redirect('/login')
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id, userId: session.user.id },
    include: { contacts: true, documents: true },
  })

  if (!job) return notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.company}</h1>
          <p className="text-muted-foreground">{job.role}</p>
        </div>
        <Badge>{job.status}</Badge>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg mb-1">Job Details</h2>
          <p><strong>Salary:</strong> {job.salary ?? 'N/A'}</p>
          <p><strong>Applied:</strong> {new Date(job.appliedAt).toLocaleDateString()}</p>
          <p><strong>Link:</strong> {job.link ? <a href={job.link} className="text-blue-500 underline">View</a> : 'N/A'}</p>
          <p><strong>Notes:</strong> {job.notes ?? 'N/A'}</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold text-lg mb-2">Contacts</h2>
        {job.contacts.length === 0 ? <p className="text-muted-foreground">No contacts yet</p> : (
          <div className="flex flex-col gap-2">
            {job.contacts.map((c) => (
              <Card key={c.id}><CardContent className="p-4">{c.name} — {c.email}</CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-2">Documents</h2>
        {job.documents.length === 0 ? <p className="text-muted-foreground">No documents yet</p> : (
          <div className="flex flex-col gap-2">
            {job.documents.map((d) => (
              <Card key={d.id}><CardContent className="p-4"><a href={d.fileUrl} className="text-blue-500 underline">{d.label}</a></CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
