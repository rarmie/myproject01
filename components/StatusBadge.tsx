import { Badge } from '@/components/ui/badge'
import { ApplicationStatus } from '@/lib/generated/prisma/enums'
import { STATUS_BADGE, STATUS_LABEL } from '@/lib/job-status'

export default function StatusBadge({status}: {status: ApplicationStatus}){
    return(
        <Badge variant={"outline"} className={STATUS_BADGE[status]}>
            {STATUS_LABEL[status]}
        </Badge>
    )
}