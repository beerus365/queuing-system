'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/app/actions/auth'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, null)

  return (
    <form action={formAction} className="mt-4 flex w-full flex-col items-center">
      <label htmlFor="staff-email" className="mb-2 self-start">
        Email
      </label>
      <input
        type="email"
        id="staff-email"
        name="email"
        placeholder="Enter your staff email"
        autoComplete="email"
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label htmlFor="staff-password" className="mb-2 mt-4 self-start">
        Password
      </label>
      <input
        type="password"
        id="staff-password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {state?.error && (
        <p role="alert" className="mt-4 w-full text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full cursor-pointer rounded-lg bg-foreground px-4 py-2.5 text-white transition-transform duration-300 hover:scale-105 hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}