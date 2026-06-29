import MidtransClient from 'midtrans-client'

function getConfig() {
  const isSandbox = (process.env.MIDTRANS_ENV ?? 'production') !== 'production'
  const serverKey = isSandbox
    ? process.env.MIDTRANS_SERVER_KEY_SANDBOX!
    : process.env.MIDTRANS_SERVER_KEY_PROD!
  const clientKey = isSandbox
    ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX!
    : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PROD!
  return { isSandbox, serverKey, clientKey }
}

export type MidtransOrderType = 'article' | 'file' | 'bundle'

export interface CreateSnapTokenParams {
  orderId: string
  amount: number
  itemName: string
  buyerName: string
  buyerEmail: string
  orderType: MidtransOrderType
}

export async function createSnapToken({
  orderId,
  amount,
  itemName,
  buyerName,
  buyerEmail,
  orderType,
}: CreateSnapTokenParams): Promise<{ token: string; redirectUrl: string }> {
  const { isSandbox, serverKey, clientKey } = getConfig()

  const snapClient = new MidtransClient.Snap({
    isProduction: !isSandbox,
    serverKey,
    clientKey,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tweak.my.id'
  const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1')

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: [
      {
        id: orderId,
        price: amount,
        quantity: 1,
        name: itemName.slice(0, 50),
        category: orderType,
      },
    ],
    customer_details: {
      first_name: buyerName,
      email: buyerEmail,
    },
    enabled_payments: [
      'bca_va', 'bni_va', 'bri_va', 'permata_va', 'mandiri_bill', 'other_va',
      'gopay', 'qris',
    ],
    callbacks: {
      finish: `${appUrl}/payment/finish`,
    },
    ...(!isLocalhost && { notification_url: `${appUrl}/api/midtrans/notification` }),
  }

  const transaction = await snapClient.createTransaction(parameter)
  return { token: transaction.token, redirectUrl: transaction.redirect_url }
}

export function getMidtransServerKey() {
  return getConfig().serverKey
}

export function getMidtransBaseUrl() {
  const { isSandbox } = getConfig()
  return isSandbox
    ? 'https://api.sandbox.midtrans.com'
    : 'https://api.midtrans.com'
}
