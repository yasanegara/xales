import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllFees, setFee } from '@/lib/fees'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const fees = await getAllFees()
  return NextResponse.json({ fees })
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['service_fee_article', 'service_fee_app', 'transaction_fee'] as const

  for (const key of allowed) {
    if (body[key] !== undefined) {
      const val = parseInt(body[key])
      if (isNaN(val) || val < 0) return NextResponse.json({ error: `Nilai ${key} tidak valid` }, { status: 400 })
      await setFee(key, val)
    }
  }

  const fees = await getAllFees()
  return NextResponse.json({ fees })
}
