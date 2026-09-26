"use server"

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/server'
import { notifyTicketsNearTurn } from '@/lib/email'

export async function serveNextPending(_formData: FormData): Promise<void> {
    const { data: servingTicket, error: servingError } = await supabase
        .from('user')
        .select('number')
        .eq('status', 'Serving')
        .order('number', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (servingError) {
        throw new Error(`Could not find the serving ticket: ${servingError.message}`)
    }

    if (servingTicket) {
        const { error: completeError } = await supabase
            .from('user')
            .update({ status: 'Complete' })
            .eq('number', servingTicket.number)
            .eq('status', 'Serving')

        if (completeError) {
            throw new Error(`Could not complete the serving ticket: ${completeError.message}`)
        }
    }

    const { data, error } = await supabase
        .from('user')
        .select('number, ticket_number')
        .eq('status', 'Pending')
        .order('number', { ascending: true })
        .limit(1)

    if(error) {
        throw new Error(`Could not find a pending ticket: ${error.message}`)
    }

    if (!data || data.length === 0) {
        revalidatePath('/admin/main')
        revalidatePath('/', 'layout')
        return
    }

    const firstTicket = data[0]
    const { data: updatedTicket, error: updateError } = await supabase
            .from('user')
            .update({ status: 'Serving' })
            .eq('number', firstTicket.number)
            .eq('status', 'Pending')
            .select('number, status')
            .single()

    if (updateError) {
        throw new Error(`Could not update ticket status: ${updateError.message}`)
    }

    console.log('Ticket status updated:', updatedTicket)
    try {
        await notifyTicketsNearTurn()
    } catch (notificationError) {
        console.error('Queue email notification failed:', notificationError)
    }
    revalidatePath('/admin/main')
    revalidatePath('/', 'layout')
}

export async function showCurrentQueue() {
    const { data, error } = await supabase
        .from('user')
        .select('ticket_number, name, transaction_type')
        .eq('status', 'Serving')
        .order('number', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) {
        throw new Error(`Could not find the serving ticket: ${error.message}`)
    }

    return data
}