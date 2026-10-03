export interface TopUpInput {
  cardNumber: string
  expirationDate: string
  cvv: string
  fullName: string
  amount: string
}

export interface Payment {
  id: string
  status: 'approved' | 'rejected' | 'error'
  status_detail: string
  transaction_amount: number
  date_created: string
  authorization_code: string | null
  reference: string
  payer_id: string
  payer_email: string
  card_number: string | null
  cvv: string | null
}

export interface TopUpResult {
  outcome: 'approved' | 'rejected' | 'error' | 'timeout'
  message: string
  balance?: number
}
