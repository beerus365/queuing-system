'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/server'
import { createTicketNumber } from '@/lib/ticket'
import { getEstimatedTime } from '@/components/estimated_time'

export type QueueState = { error?: string; ticketNumber?: string; totalWaitingMinutes?: number } | null

export type EstimateWaitState = {
  error?: string
  ticketNumber?: string
  waitingMinutes?: number
  status?: 'Pending' | 'Serving'
} | null

export async function createQueue(
  _prevState: QueueState,
  formData: FormData
): Promise<QueueState> {
  const name = String(formData.get('name') ?? '').trim()
  const service = String(formData.get('transaction_type') ?? '')
  const status = 'Pending'

  if (!name || !service) {
    return { error: 'Name and service are required.' }
  }

  const { data: pendingQueue, error: queueError } = await supabase
    .from('user')
    .select('transaction_type')
    .eq('status', 'Pending')
    .order('number', { ascending: true })

  if (queueError) {
    return { error: queueError.message }
  }

  const totalWaitingMinutes = pendingQueue.reduce(
    (sum, currentTicket) => sum + getEstimatedTime(currentTicket.transaction_type ?? ''),
    0
  )

  const { data, error } = await supabase
    .from('user')
    .insert({
      name,
      transaction_type: service,
      transaction_date: new Date().toLocaleString(),
      status: status
    })
    .select('number, ticket_number')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/main')

  return {
    ticketNumber: createTicketNumber(data.ticket_number),
    totalWaitingMinutes
  }
}

export async function estimateWaitTime(
  _prevState: EstimateWaitState,
  formData: FormData
): Promise<EstimateWaitState> {
  const rawTicket = String(formData.get('ticket_number') ?? '').trim().toUpperCase()

  if (!rawTicket) {
    return { error: 'Please enter a queue ticket number.' }
  }

  const normalizedTicket = rawTicket.replace(/^Q-?/i, '')

  if (!/^\d+$/.test(normalizedTicket)) {
    return { error: 'Ticket number must be in the format Q-12.' }
  }

  const { data: queue, error } = await supabase
    .from('user')
    .select('number, ticket_number, status, transaction_type')
    .in('status', ['Pending', 'Serving'])
    .order('number', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  const matchedTicket = queue.find((ticket) => {
    const ticketLabel = `Q-${ticket.ticket_number}`.toUpperCase()
    return ticketLabel === rawTicket || String(ticket.ticket_number) === normalizedTicket
  })

  if (!matchedTicket) {
    return { error: 'Ticket not found in the current queue.' }
  }

  if (matchedTicket.status === 'Serving') {
    return {
      ticketNumber: createTicketNumber(matchedTicket.ticket_number),
      waitingMinutes: 0,
      status: 'Serving'
    }
  }

  const waitingMinutes = queue
    .filter((ticket) => ticket.number <= matchedTicket.number)
    .reduce((sum, ticket) => sum + getEstimatedTime(ticket.transaction_type ?? ''), 0)

  return {
    ticketNumber: createTicketNumber(matchedTicket.ticket_number),
    waitingMinutes,
    status: 'Pending'
  }
}