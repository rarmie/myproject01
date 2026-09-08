import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import JobsBoard from "@/components/JobsBoard";
import { Prisma } from "@/lib/generated/prisma/client";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";

const VALID_STATUSES = new Set(Object.values(ApplicationStatus));

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const { search, status } = await searchParams;
  const validStatus = status && VALID_STATUSES.has(status as ApplicationStatus) ? (status as ApplicationStatus) : undefined;

  const where: Prisma.JobApplicationWhereInput = {
    userId: session.user.id,
    ...(search ? { company: { contains: search, mode: "insensitive" } } : {}),
    ...(validStatus ? { status: validStatus } : {}),
  };

  const jobs = await prisma.jobApplication.findMany({
    where,
    include: { contacts: true, documents: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Job Applications</h1>
          <p className="text-sm text-muted-foreground">{jobs.length} application{jobs.length === 1 ? "" : "s"}</p>
        </div>
        <SearchBar />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
        <JobsBoard jobs={jobs} />
      </div>
    </div>
  );
}
