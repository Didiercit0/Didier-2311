const messages: Record<string, string> = {
  invalid_card: 'La tarjeta ficticia no es válida. Revisa sus 16 dígitos.',
  card_declined: 'La tarjeta fue rechazada. Prueba otra tarjeta ficticia.',
  insufficient_funds: 'La tarjeta ficticia no tiene fondos suficientes.',
  invalid_expiration: 'La fecha de vencimiento no es válida para esta simulación.',
  expired_card: 'La tarjeta ficticia está vencida.',
  invalid_cvv: 'El CVV no es correcto. Revisa los datos de prueba.',
  invalid_data: 'Revisa los datos de la recarga e intenta de nuevo.',
}

export function paymentMessage(outcome: 'approved' | 'rejected' | 'error' | 'timeout', detail = ''): string {
  if (outcome === 'approved') return 'Recarga aprobada. Tu saldo ya está disponible en la tribuna.'
  if (outcome === 'timeout') return 'El servicio de pagos tardó demasiado. Intenta de nuevo.'
  if (outcome === 'error') return 'El servicio de pagos no está disponible por ahora.'
  return messages[detail] ?? 'La recarga fue rechazada. Revisa los datos e intenta de nuevo.'
}
