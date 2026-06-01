import { NextRequest, NextResponse } from 'next/server'
import { getServiceFee } from '@/lib/fees'

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type') ?? 'markdown'
  const fee  = await getServiceFee(type)
  return NextResponse.json({ serviceFee: fee }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
