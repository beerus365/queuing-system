'use client'

import { useActionState, useEffect, useState } from 'react'
import Client from '@/app/client/page'
import { estimateWaitTime, recoverQueueByEmail } from '@/app/action'

export default function QueueButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isWaitTimeOpen, setIsWaitTimeOpen] = useState(false)
  const [isWaitTimeVisible, setIsWaitTimeVisible] = useState(false)
  const [waitState, waitFormAction, isWaitPending] = useActionState(estimateWaitTime, null)
  const [recoveryState, recoveryFormAction, isRecoveryPending] = useActionState(recoverQueueByEmail, null)

  useEffect(() => {
    if (!isWaitTimeOpen) {
      setIsWaitTimeVisible(false)
      return
    }

    const frame = requestAnimationFrame(() => setIsWaitTimeVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [isWaitTimeOpen])

  const closeWaitTimeModal = () => {
    setIsWaitTimeVisible(false)
    setTimeout(() => setIsWaitTimeOpen(false), 180)
  }

  return (
    <>
      <div className="flex flex-row items-end px-6 gap-2 sm:flex-row sm:px-6">
        <button
          onClick={() => setIsOpen(true)}
          className="sm:px-6 sm:py-4 sm:text-lg text-xs px-5 py-3 bg-button-bg hover:bg-button-hover text-white rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
        >
          Get a Queue Number
        </button>

        <button
          type="button"
          onClick={() => setIsWaitTimeOpen(true)}
          className="sm:px-6 sm:py-4 sm:text-lg text-xs px-5 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
        >
          Check Wait Time
        </button>
      </div>

      {isWaitTimeOpen && (
        <div
          className={`fixed inset-0 z-70 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-opacity duration-200 ${
            isWaitTimeVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeWaitTimeModal}
        >
          <div
            className={`w-full max-w-md rounded-xl bg-white p-6 shadow-lg transition-all duration-200 ease-out ${
              isWaitTimeVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Check Waiting Time</h2>
              <button
                type="button"
                onClick={closeWaitTimeModal}
                className="text-2xl leading-none text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <form action={waitFormAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ticket_number" className="text-sm font-medium text-gray-700">
                  Queue ticket number
                </label>
                <input
                  id="ticket_number"
                  name="ticket_number"
                  placeholder="Q-12"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-button-bg"
                />
              </div>

              <button
                type="submit"
                disabled={isWaitPending}
                className="w-full rounded-lg bg-button-bg px-4 py-3 text-white transition hover:bg-button-hover cursor-pointer disabled:opacity-50"
              >
                {isWaitPending ? 'Checking...' : 'Check Time'}
              </button>
            </form>

            <details className="mt-5 border-t border-gray-200 pt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Forgot your queue number?
              </summary>
              <form action={recoveryFormAction} className="mt-3 space-y-3">
                <label htmlFor="recovery_email" className="block text-sm text-gray-600">
                  Enter the email address used when joining the queue
                </label>
                <input
                  id="recovery_email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-button-bg"
                />
                <button
                  type="submit"
                  disabled={isRecoveryPending}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {isRecoveryPending
                    ? 'Sending...'
                    : recoveryState?.message
                      ? 'Send email again'
                      : 'Email my active ticket numbers'}
                </button>
                {recoveryState?.error && (
                  <p className="text-sm text-red-600">{recoveryState.error}</p>
                )}
                {recoveryState?.message && (
                  <p aria-live="polite" className="text-sm text-gray-600">
                    {recoveryState.message} You can request it again anytime.
                  </p>
                )}
              </form>
            </details>

            {waitState?.error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {waitState.error}
              </p>
            )}

            {waitState && !waitState.error && waitState.waitingMinutes !== undefined && (
              <div
                className={`mt-4 rounded-lg border p-4 text-center ${
                  waitState.status === 'Serving'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <p className="text-sm text-gray-600">Ticket</p>
                <p
                  className={`text-xl font-bold ${
                    waitState.status === 'Serving' ? 'text-amber-700' : 'text-button-bg'
                  }`}
                >
                  {waitState.ticketNumber}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {waitState.status === 'Serving'
                    ? 'This ticket is currently being served.'
                    : `Estimated waiting time: ${waitState.waitingMinutes} min`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && <Client onClose={() => setIsOpen(false)} />}
    </>
  )
}