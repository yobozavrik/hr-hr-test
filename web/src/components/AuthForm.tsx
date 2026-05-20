import { useForm } from '@tanstack/react-form'
import {
  loginRequestSchema,
  registerRequestSchema,
  type LoginRequest,
  type RegisterRequest,
} from '@hr-recruiter/contracts'
import type { z } from 'zod'
import { useId, useState } from 'react'

import { cn } from '@/lib/utils'
import { ApiRequestError } from '@/lib/api'
import { useAuth } from '@/lib/use-auth'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AuthMode = 'login' | 'register'
type FieldName = 'displayName' | 'email' | 'password'
type FormError = { message?: string }
type FieldErrors = Partial<Record<FieldName, FormError[]>>
type AuthDraft = {
  email: string
  password: string
  displayName: string
}

const emptyDraft: AuthDraft = {
  email: '',
  password: '',
  displayName: '',
}

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [draft, setDraft] = useState<AuthDraft>(emptyDraft)

  function updateDraft(nextDraft: Partial<AuthDraft>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...nextDraft }))
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === 'login' ? 'Увійти' : 'Реєстрація'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Введіть email та пароль для входу'
            : 'Створіть акаунт для початку роботи'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all',
              mode === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Увійти
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all',
              mode === 'register'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Реєстрація
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm draft={draft} onDraftChange={updateDraft} />
        ) : (
          <RegisterForm draft={draft} onDraftChange={updateDraft} />
        )}
      </CardContent>
    </Card>
  )
}

function RegisterForm({
  draft,
  onDraftChange,
}: {
  draft: AuthDraft
  onDraftChange: (draft: Partial<AuthDraft>) => void
}) {
  const auth = useAuth()
  const displayNameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: draft,
    onSubmit: async ({ value }) => {
      setFormError(null)

      const result = registerRequestSchema.safeParse(value)
      if (!result.success) {
        setFieldErrors(toFieldErrors(result.error.issues))
        return
      }

      setFieldErrors({})

      try {
        await auth.register(result.data as RegisterRequest)
      } catch (caughtError) {
        if (caughtError instanceof ApiRequestError) {
          setFormError(caughtError.message)
          return
        }
        setFormError('Неочікувана помилка авторизації')
      }
    },
  })

  return (
    <form
      id="form-register"
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="displayName"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={displayNameId}>Ім'я</Label>
            <Input
              id={displayNameId}
              value={field.state.value ?? ''}
              placeholder="Ваше ім'я"
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                onDraftChange({ displayName: e.target.value })
                clearFieldError('displayName', setFieldErrors)
                setFormError(null)
              }}
            />
            {hasErrors(fieldErrors.displayName) && (
              <Typography variant="caption" tone="destructive">
                {fieldErrors.displayName?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={field.state.value}
              placeholder="name@company.com"
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                onDraftChange({ email: e.target.value })
                clearFieldError('email', setFieldErrors)
                setFormError(null)
              }}
            />
            {hasErrors(fieldErrors.email) && (
              <Typography variant="caption" tone="destructive">
                {fieldErrors.email?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={passwordId}>Пароль</Label>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={field.state.value}
                placeholder="Створіть пароль"
                className="pr-10"
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  onDraftChange({ password: e.target.value })
                  clearFieldError('password', setFieldErrors)
                  setFormError(null)
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {hasErrors(fieldErrors.password) && (
              <Typography variant="caption" tone="destructive">
                {fieldErrors.password?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <FormAlert message={formError} />

      <form.Subscribe
        selector={(state) => state.isSubmitting}
        children={(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Створення...' : 'Зареєструватися'}
          </Button>
        )}
      />
    </form>
  )
}

function LoginForm({
  draft,
  onDraftChange,
}: {
  draft: AuthDraft
  onDraftChange: (draft: Partial<AuthDraft>) => void
}) {
  const auth = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: draft.email,
      password: draft.password,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const result = loginRequestSchema.safeParse(value)
      if (!result.success) {
        setFieldErrors(toFieldErrors(result.error.issues))
        return
      }

      setFieldErrors({})

      try {
        await auth.login(result.data as LoginRequest)
      } catch (caughtError) {
        if (caughtError instanceof ApiRequestError) {
          setFormError(caughtError.message)
          return
        }
        setFormError('Неочікувана помилка авторизації')
      }
    },
  })

  return (
    <form
      id="form-login"
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={field.state.value}
              placeholder="name@company.com"
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                onDraftChange({ email: e.target.value })
                clearFieldError('email', setFieldErrors)
                setFormError(null)
              }}
            />
            {hasErrors(fieldErrors.email) && (
              <Typography variant="caption" tone="destructive">
                {fieldErrors.email?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={passwordId}>Пароль</Label>
              <button type="button" className="text-sm text-primary hover:underline">
                Забули пароль?
              </button>
            </div>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={field.state.value}
                placeholder="••••••••"
                className="pr-10"
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  onDraftChange({ password: e.target.value })
                  clearFieldError('password', setFieldErrors)
                  setFormError(null)
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {hasErrors(fieldErrors.password) && (
              <Typography variant="caption" tone="destructive">
                {fieldErrors.password?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <FormAlert message={formError} />

      <form.Subscribe
        selector={(state) => state.isSubmitting}
        children={(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Вхід...' : 'Увійти'}
          </Button>
        )}
      />
    </form>
  )
}

function FormAlert({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive mt-0.5 shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <div>
          <Typography variant="bodySm" className="font-medium text-destructive">
            Помилка авторизації
          </Typography>
          <Typography variant="bodySm" tone="muted" className="mt-1">
            {message}
          </Typography>
        </div>
      </div>
    </div>
  )
}

function toFieldErrors(issues: z.ZodIssue[]): FieldErrors {
  return issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0]
    if (!isFieldName(field)) return errors

    errors[field] = [...(errors[field] ?? []), { message: issue.message }]
    return errors
  }, {})
}

function clearFieldError(
  field: FieldName,
  setFieldErrors: (updater: (errors: FieldErrors) => FieldErrors) => void,
) {
  setFieldErrors((currentErrors) => {
    if (!currentErrors[field]?.length) return currentErrors
    const nextErrors = { ...currentErrors }
    delete nextErrors[field]
    return nextErrors
  })
}

function hasErrors(errors: FormError[] | undefined) {
  return Boolean(errors?.length)
}

function isFieldName(field: unknown): field is FieldName {
  return field === 'displayName' || field === 'email' || field === 'password'
}
