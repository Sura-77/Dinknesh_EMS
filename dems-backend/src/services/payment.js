// Chapa payment gateway integration
const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';

export async function initializePayment(payload) {
  const res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Payment initialization failed');

  return { checkout_url: data.data.checkout_url, tx_ref: payload.tx_ref };
}

export async function verifyPayment(tx_ref) {
  const res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`, {
    headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Payment verification failed');

  return { status: data.data.status, amount: data.data.amount };
}
