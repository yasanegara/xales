import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/prisma'
import { rateLimit, getIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (!rateLimit(`register:${ip}`, 5, 60_000))
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Tunggu 1 menit.' }, { status: 429 })

  try {
    const { name, username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Field wajib diisi' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username hanya boleh huruf, angka, dan underscore' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, username, email, passwordHash },
    })

    return NextResponse.json({ id: user.id, username: user.username }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
