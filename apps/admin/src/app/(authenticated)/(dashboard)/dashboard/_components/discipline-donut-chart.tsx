'use client'

import { Pie, PieChart, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/shared/components/ui/chart'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import type { DisciplinePoint } from '../_types'
import type { ChartConfig } from '@/shared/components/ui/chart'

type Props = {
  data: DisciplinePoint[]
  labels: Record<string, string>
}

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)'
]

function buildChartConfig(
  data: DisciplinePoint[],
  labels: Record<string, string>
): ChartConfig {
  const config: ChartConfig = {}
  for (const [index, point] of data.entries()) {
    config[point.disciplina] = {
      label: labels[point.disciplina] ?? point.disciplina,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }
  }
  return config
}

export function DisciplineDonutChart({ data, labels }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Disciplinas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Sin datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = buildChartConfig(data, labels)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disciplinas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='mx-auto h-[250px]'>
          <PieChart accessibilityLayer>
            <ChartTooltip
              content={<ChartTooltipContent nameKey='disciplina' />}
            />
            <Pie
              data={data}
              dataKey='count'
              nameKey='disciplina'
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.disciplina}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey='disciplina' />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
