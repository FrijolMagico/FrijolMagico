'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

interface RichTextFieldErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
  fallback?: ReactNode
}

interface RichTextFieldErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryKey: number
}

export class RichTextFieldErrorBoundary extends Component<
  RichTextFieldErrorBoundaryProps,
  RichTextFieldErrorBoundaryState
> {
  constructor(props: RichTextFieldErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, retryKey: 0 }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<RichTextFieldErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'RichTextFieldErrorBoundary caught an error:',
      error,
      errorInfo
    )
  }

  handleRetry = () => {
    this.props.onRetry?.()
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='border-destructive/50 bg-destructive/5 space-y-4 rounded-md border p-4'>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Error loading editor</AlertTitle>
            <AlertDescription>
              {this.state.error?.message ||
                'Something went wrong while loading the rich text editor.'}
            </AlertDescription>
          </Alert>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={this.handleRetry}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Retry
            </Button>
            {this.props.fallback && (
              <span className='text-muted-foreground text-sm'>
                or use the plain text editor below
              </span>
            )}
          </div>

          {this.props.fallback ? (
            this.props.fallback
          ) : (
            <Textarea
              disabled
              placeholder='The editor failed to load. Please try refreshing the page.'
              className='min-h-[150px] font-mono text-sm'
            />
          )}
        </div>
      )
    }

    return (
      <div key={this.state.retryKey} className='contents'>
        {this.props.children}
      </div>
    )
  }
}
