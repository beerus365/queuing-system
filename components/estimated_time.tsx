const estimatedTimeByTransaction: Record<string, number> = {
    Enrollment: 20,
    Payment: 7,
    'Request Documents': 10,
    'ID Validation': 5,
    Claim: 5,
}

export function getEstimatedTime(transactionType: string): number {
    return estimatedTimeByTransaction[transactionType] ?? 0
}
