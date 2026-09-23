export function createTicketNumber(sequence: number) {
    const DEFAULT_CHAR = 'Q'
    console.log(sequence)
    return `${DEFAULT_CHAR}-${sequence}`
}