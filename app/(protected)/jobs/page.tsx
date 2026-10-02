import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import JobList from "@/components/JobList";
import JobDetail from "@/components/JobDetail";
import { Prisma } from "@/lib/generated/prisma/client";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";
import { STATUS_ORDER } from "@/lib/job-status";

const VALID_STATUSES = new Set(Object.values(ApplicationStatus));

// A repeated key (?job=a&job=b) arrives as an array. Only a single plain value is meaningful;
// anything else is treated as absent instead of reaching Prisma and causing a 500.
function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[]; status?: string | string[]; job?: string | string[] }>
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const { search: rawSearch, status: rawStatus, job: rawJob } = await searchParams;
  const search = single(rawSearch);
  const status = single(rawStatus);
  const job = single(rawJob);
  const validStatus = status && VALID_STATUSES.has(status as ApplicationStatus) ? (status as ApplicationStatus) : undefined;

  const where: Prisma.JobApplicationWhereInput = {
    userId: session.user.id,
    ...(search ? { company: { contains: search, mode: "insensitive" } } : {}),
    ...(validStatus ? { status: validStatus } : {}),
  };

  // The list only needs what a row shows. Contacts and documents load for the selected job only.
  const jobs = await prisma.jobApplication.findMany({
    where,
    select: { id: true, company: true, role: true, status: true, salary: true },
    orderBy: { createdAt: "desc" },
  });

  // With no ?job, select the top row on screen. The list is grouped by STATUS_ORDER,
  // so that is the first job in status order, not jobs[0] (the newest).
  const selectedId =
    job ?? STATUS_ORDER.flatMap((s) => jobs.filter((j) => j.status === s))[0]?.id;

  // Loaded separately because ?job may point at a job the current filters hide.
  // userId keeps another user's id from loading their job.
  const selected = selectedId
    ? await prisma.jobApplication.findUnique({
        where: { id: selectedId, userId: session.user.id },
        include: { contacts: true, documents: true },
      })
    : null;

  // "Back to jobs" on a phone: same filters, no ?job.
  const backParams = new URLSearchParams();
  if (search) backParams.set("search", search);
  if (validStatus) backParams.set("status", validStatus);
  const backHref = backParams.size ? `/jobs?${backParams.toString()}` : "/jobs";

  // A phone has room for one pane: the list without ?job, the detail with it.
  const hasJobParam = Boolean(job);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Job Applications</h1>
          <p className="text-sm text-muted-foreground">{jobs.length} application{jobs.length === 1 ? "" : "s"}</p>
        </div>
        <SearchBar />
      </div>

      {/* From md up the box has a fixed height, so the list's open group can fill the space
          between the group headers, and each pane scrolls on its own. */}
      <div className="rounded-xl border bg-card overflow-hidden flex min-h-[60vh] md:h-[calc(100vh-12rem)] md:min-h-[28rem]">
        <div
          className={`w-full md:w-88 shrink-0 md:border-r md:h-full ${
            hasJobParam ? "hidden md:block" : ""
          }`}
        >
          <JobList jobs={jobs} selectedId={selected?.id} search={search} status={validStatus} />
        </div>

        <div className={`flex-1 min-w-0 md:h-full md:overflow-y-auto ${hasJobParam ? "" : "hidden md:block"}`}>
          {selected ? (
            <JobDetail job={selected} backHref={backHref} />
          ) : (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-10 text-sm text-muted-foreground">
              {selectedId ? "Job not found." : "Add an application to see its details here."}
              {/* On a phone the list is hidden while ?job is set, so this is the only way back. */}
              {hasJobParam && (
                <Link
                  href={backHref}
                  className="md:hidden inline-flex items-center gap-1.5 text-foreground hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  Back to jobs
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
