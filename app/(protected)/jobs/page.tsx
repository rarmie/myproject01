import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { off } from "process";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";



const statusColors: Record<string, string> = {
  WISHLIST: 'bg-gray-500',
  APPLIED: 'bg-blue-500',
  INTERVIEW: 'bg-yellow-500',
  OFFER: 'bg-green-500',
  REJECTED: 'bg-red-500'
}

export default async function JobsPage(){

  const session = await getServerSession(authOptions);

  const jobs = await prisma.jobApplication.findMany({
    where: {userId: session?.user.id,},
    orderBy: {createdAt: 'desc'}
  })
  
  const wishlistCounter = jobs.filter(job => job.status === "WISHLIST").length;
  const appliedCounter = jobs.filter(job => job.status === "APPLIED").length;
  const interviewCounter = jobs.filter(job => job.status === "INTERVIEW").length;
  const offerCounter = jobs.filter(job => job.status === "OFFER").length;
  const rejectedCounter = jobs.filter(job => job.status === "REJECTED").length;

  return(
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Job Applications
      </h1>
      <div className="grid grid-cols-5 gap-4">
        <div>
          <Card className="rounded-sm bg-gray-100">
            <CardContent>
              <div className="flex">
                <h2 className="text-sm font-bold mb-3">WISHLIST</h2>
                <p className="ms-auto bg-gray-200 rounded-full w-5 h-5 text-center font-bold text-gray-500">{wishlistCounter}</p>
              </div>
              {jobs.filter((job) => job.status === 'WISHLIST').map((job) =>
                <Card key={job.id} className="rounded-md mb-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-lg">{job.company}</h2>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                  </div>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-sm bg-gray-100">
            <CardContent>
              <div className="flex">
                <h2 className="text-sm font-bold mb-3">APPLIED</h2>
                <p className="ms-auto bg-gray-200 rounded-full w-5 h-5 text-center font-bold text-gray-500">{appliedCounter}</p>
              </div>
              {jobs.filter((job) => job.status === 'APPLIED').map((job) => 
                <Card key={job.id} className="rounded-md mb-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-lg">{job.company}</h2>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                  </div>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-sm bg-gray-100">
            <CardContent>
              <div className="flex">
                <h2 className="text-sm font-bold mb-3">INTERVIEW</h2>
                <p className="ms-auto bg-gray-200 rounded-full w-5 h-5 text-center font-bold text-gray-500">{interviewCounter}</p>
              </div>
              {jobs.filter((job) => job.status === "INTERVIEW").map((job) =>
                <Card key={job.id} className="rounded-md mb-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-lg">{job.company}</h2>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                  </div>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-sm bg-gray-100">
            <CardContent>
              <div className="flex">
                <h2 className="text-sm font-bold mb-3">OFFER</h2>
                <p className="ms-auto bg-gray-200 rounded-full w-5 h-5 text-center font-bold text-gray-500">{offerCounter}</p>
              </div>
              {jobs.filter((job) => job.status === "OFFER").map((job) =>
                <Card key={job.id} className="rounded-md mb-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-lg">{job.company}</h2>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                  </div>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-sm bg-gray-100">
            <CardContent>
              <div className="flex">
                <h2 className="text-sm font-bold mb-3">REJECTED</h2>
                <p className="ms-auto bg-gray-200 rounded-full w-5 h-5 text-center font-bold text-gray-500">{rejectedCounter}</p>
              </div>
              {jobs.filter((job) => job.status === "REJECTED").map((job) =>
                <Card key={job.id} className="rounded-md mb-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-lg">{job.company}</h2>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                  </div>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}