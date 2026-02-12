import { Suspense } from 'react'
import { Building2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { OrganizationContent } from './organization-content'
import { TextFieldSkeleton } from '@/shared/components/form/text-field.skeleton'
import { RichTextFieldSkeleton } from '@/shared/components/form/rich-text-field.skeleton'

export function OrganizationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building2 className='h-5 w-5' />
          Información General
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <Suspense fallback={<OrganizationLoading />}>
          <OrganizationContent />
        </Suspense>
      </CardContent>
    </Card>
  )
}

function OrganizationLoading() {
  return (
    <div className='space-y-6'>
      <TextFieldSkeleton />
      <RichTextFieldSkeleton />
      <RichTextFieldSkeleton />
      <RichTextFieldSkeleton />
    </div>
  )
}
