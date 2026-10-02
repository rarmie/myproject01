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

export const STATUS_DOT: Record<ApplicationStatus, string> = {
    WISHLIST: 'bg-zinc-400',
    APPLIED: 'bg-primary',
    INTERVIEW: 'bg-yellow-500',
    OFFER: 'bg-green-500',
    REJECTED: 'bg-red-500'
}

export const STATUS_BADGE: Record<ApplicationStatus, string> = {
    WISHLIST: 'bg-muted text-muted-foreground',
    APPLIED: 'bg-accent text-accent-foreground',
    INTERVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400',
    OFFER: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
}

export function companyInitial(company: string): string{
    return company.trim().charAt(0).toUpperCase() || '?'
}