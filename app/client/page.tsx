'use client'

import { useActionState, useEffect, useState } from 'react'
import { createQueue } from '@/app/action'

type ClientProps = {
  onClose: () => void
}

const Client = ({ onClose }: ClientProps) => {
  const [state, formAction, isPending] = useActionState(createQueue, null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 200) 
  }

  return (
    <main
      className={`fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center backdrop-blur-sm overflow-y-auto px-4 py-8 sm:px-6 sm:py-12 transition-colors duration-200 ${
        show ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <form
        action={formAction}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-amber-50 gap-6 px-5 py-8 text-black sm:px-8 sm:py-12 transition-all duration-200 ease-out ${
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-4 text-xl text-gray-500 hover:text-black cursor-pointer"
        >
          ×
        </button>

        <h1>Get a Queue Number</h1>

        <span className="w-full">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter your name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
          />
        </span>

        <span className="w-full">
          <label htmlFor="service">Service</label>
          <select
            name="transaction_type"
            id="service"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
          >
            <option value="Enrollment">Enrollment (Est. 20 min)</option>
            <option value="Payment">Payment (Est. 7 min)</option>
            <option value="Request Documents">Request Documents (Est. 10 min)</option>
            <option value="ID Validation">ID Validation (Est. 5 min)</option>
            <option value="Claim">Claim (Est. 5 min)</option>
          </select>
        </span>

        <span className="w-full">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
          />
        </span>

        <button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-lg bg-button-bg px-4 py-4 text-white transition-transform duration-300 hover:scale-105 hover:bg-button-hover disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Get Queue Number'}
        </button>

        {state?.error && <p className="text-red-600">{state.error}</p>}
        {state?.ticketNumber && (
          <div className="w-full rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-sm text-gray-600">Your queue number</p>
            <p className="text-2xl font-bold text-button-bg">{state.ticketNumber}</p>
            <p className="mt-2 text-sm text-gray-700">
              Estimated waiting time: <span className="font-semibold">{state.totalWaitingMinutes ?? 0} min</span>
            </p>
          </div>
        )}
      </form>
    </main>
  )
}

export default Client