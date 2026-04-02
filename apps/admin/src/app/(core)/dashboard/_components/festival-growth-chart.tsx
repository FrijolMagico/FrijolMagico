'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/shared/components/ui/chart'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import type { EditionGrowthPoint } from '../_types'
import type { ChartConfig } from '@/shared/components/ui/chart'

type Props = {
  data: EditionGrowthPoint[]
}

const chartConfig = {
  participantes: {
    label: 'Participantes',
    color: 'var(--color-chart-1)'
  }
} satisfies ChartConfig

export function FestivalGrowthChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento del Festival</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Sin datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Crecimiento de los participantes del Festival Frijol Mágico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-62 w-full'>
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='numero'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Edición ${value}`}
                />
              }
            />
            <Area
              dataKey='participantes'
              type='monotone'
              fill='var(--color-participantes)'
              fillOpacity={0.3}
              stroke='var(--color-participantes)'
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
