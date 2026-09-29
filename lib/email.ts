type QueueTicket = {
  number: number
  ticket_number: number
  name: string
  email: string | null
  near_turn_notified: boolean | null
}

type QueueRecoveryTicket = {
  ticketNumber: string
  transactionType: string
  status: string
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL must be configured.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], subject, text })
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Resend request failed with status ${response.status}: ${details}`)
  }
}

export async function sendQueueConfirmationEmail(ticket: {
  name: string
  email: string
  ticketNumber: string
  transactionType: string
  waitingMinutes: number
}) {
  await sendEmail(
    ticket.email,
    `Your queue ticket ${ticket.ticketNumber}`,
    `Hello ${ticket.name},\n\nYour queue ticket is ${ticket.ticketNumber}.\nService: ${ticket.transactionType}\nEstimated waiting time: ${ticket.waitingMinutes} minutes\n\nKeep this email so you can check your ticket later.`
  )
}

export async function sendQueueRecoveryEmail(to: string, tickets: QueueRecoveryTicket[]) {
  const ticketDetails = tickets
    .map((ticket) => `${ticket.ticketNumber} | ${ticket.transactionType} | ${ticket.status}`)
    .join('\n')

  await sendEmail(
    to,
    'Your active queue ticket details',
    `Here are the active queue tickets registered to this email:\n\n${ticketDetails}\n\nUse a ticket number above to check its waiting time.`
  )
}

export async function notifyTicketsNearTurn() {
  const { supabase } = await import('@/lib/server')
  const { data: pendingTickets, error } = await supabase
    .from('user')
    .select('number, ticket_number, name, email, near_turn_notified')
    .eq('status', 'Pending')
    .order('number', { ascending: true })

  if (error) {
    throw new Error(`Could not find tickets near turn: ${error.message}`)
  }

  const ticket = (pendingTickets as QueueTicket[])[2]

  if (!ticket?.email || ticket.near_turn_notified) {
    return
  }

  await sendEmail(
    ticket.email,
    `Your queue ticket Q-${ticket.ticket_number} is nearly ready`,
    `Hello ${ticket.name},\n\nThere are two people ahead of you. Please return to the service area soon.\n\nYour ticket: Q-${ticket.ticket_number}`
  )

  const { error: flagError } = await supabase
    .from('user')
    .update({ near_turn_notified: true })
    .eq('number', ticket.number)

  if (flagError) {
    throw new Error(`Email sent, but ticket notification status could not be saved: ${flagError.message}`)
  }
}
