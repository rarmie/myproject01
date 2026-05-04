import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  WISHLIST: 'bg-gray-500',
  APPLIED: 'bg-blue-500',
  INTERVIEW: 'bg-yellow-500',
  OFFER: 'bg-green-500',
  REJECTED: 'bg-red-500'
}

export default async function JobsPage(){
  const jobs = await prisma.jobApplication.findMany({
    orderBy: {createdAt: 'desc'}
  })

  return(
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Job Applications
      </h1>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h2 className="font-semibold text-lg">{job.company}</h2>
                <p className="text-sm text-muted-foreground">{job.role}</p>
              </div>
              <Badge className={statusColors[job.status]}>{job.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}