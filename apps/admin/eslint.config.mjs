import nextConfig from '@frijolmagico/eslint-config/next'

export default [
  // Ignorar componentes generados de shadcn/ui — no se modifican manualmente
  { ignores: ['src/shared/components/ui/', 'src/shared/hooks/use-mobile.ts'] },
  ...nextConfig,
]
