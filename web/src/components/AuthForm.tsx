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
    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-[24px] border border-outline-variant shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] overflow-hidden w-full">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant">
        <Typography
          as="button"
          id="tab-login"
          type="button"
          variant="h4"
          className={cn(
            "flex-1 py-lg transition-colors cursor-pointer",
            mode === 'login'
              ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
              : "text-on-surface-variant border-b-2 border-transparent hover:text-primary bg-surface-container-low/50"
          )}
          onClick={() => setMode('login')}
        >
          Увійти
        </Typography>
        <Typography
          as="button"
          id="tab-register"
          type="button"
          variant="h4"
          className={cn(
            "flex-1 py-lg transition-colors cursor-pointer",
            mode === 'register'
              ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
              : "text-on-surface-variant border-b-2 border-transparent hover:text-primary bg-surface-container-low/50"
          )}
          onClick={() => setMode('register')}
        >
          Реєстрація
        </Typography>
      </div>

      <div className="p-xl">
        {mode === 'login' ? (
          <LoginForm draft={draft} onDraftChange={updateDraft} />
        ) : (
          <RegisterForm draft={draft} onDraftChange={updateDraft} />
        )}
      </div>
    </div>
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
      className="flex flex-col gap-lg"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="displayName"
        children={(field) => (
          <div className="flex flex-col gap-xs">
            <Typography
              as="label"
              htmlFor={displayNameId}
              variant="label"
              className="text-on-surface"
            >
              Ім'я
            </Typography>
            <div className="relative">
              <Typography
                as="span"
                className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none"
              >
                person
              </Typography>
              <input
                id={displayNameId}
                name={field.name}
                value={field.state.value ?? ''}
                type="text"
                autoComplete="name"
                placeholder="Ваше ім'я"
                className="w-full pl-[48px] pr-md py-[12px] bg-surface rounded-lg border border-outline-variant text-on-surface font-body text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  onDraftChange({ displayName: value })
                  clearFieldError('displayName', setFieldErrors)
                  setFormError(null)
                }}
              />
            </div>
            {hasErrors(fieldErrors.displayName) && (
              <Typography
                as="span"
                variant="caption"
                tone="destructive"
                className="mt-xs block"
              >
                {fieldErrors.displayName?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="email"
        children={(field) => (
          <div className="flex flex-col gap-xs">
            <Typography
              as="label"
              htmlFor={emailId}
              variant="label"
              className="text-on-surface"
            >
              Email
            </Typography>
            <div className="relative">
              <Typography
                as="span"
                className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none"
              >
                mail
              </Typography>
              <input
                id={emailId}
                name={field.name}
                value={field.state.value}
                type="email"
                placeholder="name@company.com"
                className="w-full pl-[48px] pr-md py-[12px] bg-surface rounded-lg border border-outline-variant text-on-surface font-body text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  onDraftChange({ email: value })
                  clearFieldError('email', setFieldErrors)
                  setFormError(null)
                }}
              />
            </div>
            {hasErrors(fieldErrors.email) && (
              <Typography
                as="span"
                variant="caption"
                tone="destructive"
                className="mt-xs block"
              >
                {fieldErrors.email?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="flex flex-col gap-xs">
            <Typography
              as="label"
              htmlFor={passwordId}
              variant="label"
              className="text-on-surface"
            >
              Пароль
            </Typography>
            <div className="relative">
              <Typography
                as="span"
                className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none"
              >
                lock
              </Typography>
              <input
                id={passwordId}
                name={field.name}
                value={field.state.value}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Створіть пароль"
                className="w-full pl-[48px] pr-[48px] py-[12px] bg-surface rounded-lg border border-outline-variant text-on-surface font-body text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  onDraftChange({ password: value })
                  clearFieldError('password', setFieldErrors)
                  setFormError(null)
                }}
              />
              <Typography
                as="button"
                type="button"
                className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Typography
                  as="span"
                  className="material-symbols-outlined select-none"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </Typography>
              </Typography>
            </div>
            {hasErrors(fieldErrors.password) && (
              <Typography
                as="span"
                variant="caption"
                tone="destructive"
                className="mt-xs block"
              >
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
          <Typography
            as="button"
            type="submit"
            disabled={isSubmitting}
            variant="h4"
            className="w-full bg-secondary text-on-secondary py-[14px] rounded-lg shadow-sm hover:bg-on-secondary-fixed-variant transition-colors mt-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Створення...' : 'Зареєструватися'}
          </Typography>
        )}
      />

      <Typography
        as="p"
        variant="caption"
        className="text-center text-on-surface-variant mt-sm"
      >
        Натискаючи кнопку, ви погоджуєтесь з{' '}
        <Typography
          as="a"
          variant="caption"
          className="text-primary hover:underline"
          href="#"
        >
          Умовами використання
        </Typography>
      </Typography>
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
      className="flex flex-col gap-lg"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="flex flex-col gap-xs">
            <Typography
              as="label"
              htmlFor={emailId}
              variant="label"
              className="text-on-surface"
            >
              Email
            </Typography>
            <div className="relative">
              <Typography
                as="span"
                className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none"
              >
                mail
              </Typography>
              <input
                id={emailId}
                name={field.name}
                value={field.state.value}
                type="email"
                placeholder="name@company.com"
                className="w-full pl-[48px] pr-md py-[12px] bg-surface rounded-lg border border-outline-variant text-on-surface font-body text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  onDraftChange({ email: value })
                  clearFieldError('email', setFieldErrors)
                  setFormError(null)
                }}
              />
            </div>
            {hasErrors(fieldErrors.email) && (
              <Typography
                as="span"
                variant="caption"
                tone="destructive"
                className="mt-xs block"
              >
                {fieldErrors.email?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="flex flex-col gap-xs">
            <Typography
              as="label"
              htmlFor={passwordId}
              variant="label"
              className="text-on-surface"
            >
              Пароль
            </Typography>
            <div className="relative">
              <Typography
                as="span"
                className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none"
              >
                lock
              </Typography>
              <input
                id={passwordId}
                name={field.name}
                value={field.state.value}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-[48px] pr-[48px] py-[12px] bg-surface rounded-lg border border-outline-variant text-on-surface font-body text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value
                  field.handleChange(value)
                  onDraftChange({ password: value })
                  clearFieldError('password', setFieldErrors)
                  setFormError(null)
                }}
              />
              <Typography
                as="button"
                type="button"
                className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Typography
                  as="span"
                  className="material-symbols-outlined select-none"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </Typography>
              </Typography>
            </div>
            {hasErrors(fieldErrors.password) && (
              <Typography
                as="span"
                variant="caption"
                tone="destructive"
                className="mt-xs block"
              >
                {fieldErrors.password?.[0]?.message}
              </Typography>
            )}
          </div>
        )}
      />

      <div className="flex items-center justify-between mt-sm mb-sm">
        <Typography
          as="label"
          variant="bodySm"
          className="flex items-center gap-sm cursor-pointer group select-none text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface transition-colors cursor-pointer"
          />
          Запам'ятати мене
        </Typography>
        <Typography
          as="a"
          variant="label"
          className="text-primary hover:text-on-primary-fixed-variant transition-colors"
          href="#"
        >
          Забули пароль?
        </Typography>
      </div>

      <FormAlert message={formError} />

      <form.Subscribe
        selector={(state) => state.isSubmitting}
        children={(isSubmitting) => (
          <Typography
            as="button"
            type="submit"
            disabled={isSubmitting}
            variant="h4"
            className="w-full bg-primary text-on-primary py-[14px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Вхід...' : 'Увійти'}
          </Typography>
        )}
      />
    </form>
  )
}

function FormAlert({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="bg-error-container text-on-error-container p-md rounded-lg border border-error/20 flex flex-col gap-xs">
      <Typography
        as="span"
        variant="label"
        className="uppercase text-error flex items-center gap-xs"
      >
        <Typography
          as="span"
          className="material-symbols-outlined"
        >
          error
        </Typography>
        Помилка авторизації
      </Typography>
      <Typography
        as="p"
        variant="bodySm"
      >
        {message}
      </Typography>
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
