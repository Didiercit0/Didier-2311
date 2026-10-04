export const validPayment = {
  fullName: 'Socio de prueba',
  payerId: 'usuario-prueba',
  payerEmail: 'socio@example.com',
  amount: 25.5,
  cardNumber: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
};

export const paymentFields = [
  'id',
  'status',
  'status_detail',
  'transaction_amount',
  'date_created',
  'authorization_code',
  'reference',
  'payer_id',
  'payer_email',
  'card_number',
  'cvv',
];
