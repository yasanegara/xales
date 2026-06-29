import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllFees, setFee } from '@/lib/fees'
import { db } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

async function getStringConfig(key: string): Promise<string> {
  const row = await db.config.findUnique({ where: { key } })
  return row?.value ?? ''
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const [fees, tweakWa] = await Promise.all([getAllFees(), getStringConfig('tweak_wa')])
  return NextResponse.json({ fees, tweakWa })
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

  if (body.tweakWa !== undefined) {
    const wa = String(body.tweakWa).replace(/\D/g, '')
    if (wa && !/^(0|62)?8\d{7,11}$/.test(wa)) {
      return NextResponse.json({ error: 'Nomor WA Tweak tidak valid' }, { status: 400 })
    }
    await db.config.upsert({
      where: { key: 'tweak_wa' },
      update: { value: wa },
      create: { key: 'tweak_wa', value: wa },
    })
  }

  const [fees, tweakWa] = await Promise.all([getAllFees(), getStringConfig('tweak_wa')])
  return NextResponse.json({ fees, tweakWa })
}
