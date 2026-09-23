'use client'

import { useActionState, useEffect, useState } from 'react'
import Client from '@/app/client/page'
import { estimateWaitTime } from '@/app/action'

export default function QueueButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isWaitTimeOpen, setIsWaitTimeOpen] = useState(false)
  const [isWaitTimeVisible, setIsWaitTimeVisible] = useState(false)
  const [waitState, waitFormAction, isWaitPending] = useActionState(estimateWaitTime, null)

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
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-opacity duration-200 ${
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
                className="w-full rounded-lg bg-button-bg px-4 py-3 text-white transition hover:bg-button-hover disabled:opacity-50"
              >
                {isWaitPending ? 'Checking...' : 'Check Time'}
              </button>
            </form>

            {waitState?.error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {waitState.error}
              </p>
            )}

            {waitState && !waitState.error && waitState.waitingMinutes !== undefined && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm text-gray-600">Ticket</p>
                <p className="text-xl font-bold text-button-bg">{waitState.ticketNumber}</p>
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