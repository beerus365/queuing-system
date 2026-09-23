type QueueTicket = {
  number: number
  ticket_number: number
  name: string
  email: string | null
  near_turn_notified: boolean | null
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  if (!apiKey) {
    throw new Error('RESEND_API_KEY must be configured.')
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

  const ticketsToNotify = (pendingTickets as QueueTicket[]).filter(
    (ticket, index) => index === 2 && ticket.email && !ticket.near_turn_notified
  )

  for (const ticket of ticketsToNotify) {
    try {
      await sendEmail(
        ticket.email!,
        `Your queue ticket Q-${ticket.ticket_number} is nearly ready`,
        `Hello ${ticket.name},\n\nThere are two people ahead of you. Please return to the service area soon.\n\nYour ticket: Q-${ticket.ticket_number}`
      )

      await supabase
        .from('user')
        .update({ near_turn_notified: true })
        .eq('number', ticket.number)
    } catch (notificationError) {
      console.error(`Could not notify ticket Q-${ticket.ticket_number}:`, notificationError)
    }
  }
}