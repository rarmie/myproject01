import { redirect } from 'next/navigation'

// Job detail now lives on /jobs as ?job=<id> (docs/adr/0001-url-driven-job-detail.md).
// This keeps old /jobs/<id> links working. /jobs does the session and ownership checks.
export default async function JobDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/jobs?job=${encodeURIComponent(id)}`)
}
