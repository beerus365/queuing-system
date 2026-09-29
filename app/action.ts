'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/server'
import { createTicketNumber } from '@/lib/ticket'
import { getEstimatedTime } from '@/components/estimated_time'
import { notifyTicketsNearTurn, sendQueueConfirmationEmail, sendQueueRecoveryEmail } from '@/lib/email'

export type QueueState = {
  error?: string
  ticketNumber?: string
  totalWaitingMinutes?: number
  emailSent?: boolean
} | null

export type QueueRecoveryState = { error?: string; message?: string } | null

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
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const service = String(formData.get('transaction_type') ?? '')
  const status = 'Pending'

  if (!name || !email || !service) {
    return { error: 'Name, email, and service are required.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
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
      email,
      transaction_type: service,
      transaction_date: new Date().toLocaleString(),
      status: status,
      near_turn_notified: false
    })
    .select('number, ticket_number')
    .single()

  if (error) return { error: error.message }

  const ticketNumber = createTicketNumber(data.ticket_number)
  let emailSent = true

  try {
    await sendQueueConfirmationEmail({
      name,
      email,
      ticketNumber,
      transactionType: service,
      waitingMinutes: totalWaitingMinutes
    })
  } catch (emailError) {
    emailSent = false
    console.error('Queue confirmation email failed:', emailError)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/main')

  try {
    await notifyTicketsNearTurn()
  } catch (notificationError) {
    console.error('Queue email notification failed:', notificationError)
  }

  return {
    ticketNumber,
    totalWaitingMinutes,
    emailSent
  }
}

export async function recoverQueueByEmail(
  _prevState: QueueRecoveryState,
  formData: FormData
): Promise<QueueRecoveryState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const genericMessage = 'If an active ticket is registered to that email, its details will be sent there.'
  const { data: tickets, error } = await supabase
    .from('user')
    .select('number, ticket_number, transaction_type, status')
    .eq('email', email)
    .in('status', ['Pending', 'Serving'])
    .order('number', { ascending: true })

  if (error) {
    console.error(`Queue recovery lookup failed: ${error.message}`)
    return { message: genericMessage }
  }

  if (tickets.length > 0) {
    try {
      await sendQueueRecoveryEmail(
        email,
        tickets.map((ticket) => ({
          ticketNumber: createTicketNumber(ticket.ticket_number),
          transactionType: ticket.transaction_type ?? 'Service',
          status: ticket.status
        }))
      )
    } catch (emailError) {
      console.error('Queue recovery email failed:', emailError)
    }
  }

  return { message: genericMessage }
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
    .filter((ticket) => ticket.status === 'Pending' && ticket.number <= matchedTicket.number)
    .reduce((sum, ticket) => sum + getEstimatedTime(ticket.transaction_type ?? ''), 0)

  return {
    ticketNumber: createTicketNumber(matchedTicket.ticket_number),
    waitingMinutes,
    status: 'Pending'
  }
}