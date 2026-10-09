import { ApplicationStatus } from "./generated/prisma/enums";

export const STATUS_ORDER: ApplicationStatus[] = [
    'APPLIED',
    'INTERVIEW',
    'OFFER',
    'WISHLIST',
    'REJECTED'
]

export const PIPELINE_ORDER: ApplicationStatus[] = [
    'WISHLIST',
    'APPLIED',
    'INTERVIEW',
    'OFFER'
]

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
    WISHLIST: 'Wishlist',
    APPLIED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected'
}

// Applied follows the theme accent (indigo in light, emerald in dark). Offer is fuchsia in both
// themes so it never looks like the accent. Each status is deeper in light, lighter in dark.
export const STATUS_DOT: Record<ApplicationStatus, string> = {
    WISHLIST: 'bg-slate-400 dark:bg-slate-500',
    APPLIED: 'bg-primary',
    INTERVIEW: 'bg-amber-600 dark:bg-amber-300',
    OFFER: 'bg-fuchsia-600 dark:bg-fuchsia-400',
    REJECTED: 'bg-red-600 dark:bg-red-400'
}

export const STATUS_BADGE: Record<ApplicationStatus, string> = {
    WISHLIST: 'bg-muted text-muted-foreground',
    APPLIED: 'bg-accent text-accent-foreground',
    INTERVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
    OFFER: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-400/15 dark:text-fuchsia-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
}

export function companyInitial(company: string): string{
    return company.trim().charAt(0).toUpperCase() || '?'
}