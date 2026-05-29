import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// All photos from Pexels (free license, no attribution required)
// Sources verified: Indonesian photographers or Indonesia-located photos
const AVATARS = [
  {
    username: 'hustle.halal',
    // Wanita berhijab, jalanan Tangerang — foto: Tubagus Alief Leo (🇮🇩)
    // https://www.pexels.com/photo/girl-in-hijab-on-street-15478731/
    profilePic: 'https://images.pexels.com/photos/15478731/pexels-photo-15478731.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
  },
  {
    username: 'fiqh.muamalah',
    // Pendidik pria berpeci di meja kerja — foto: Rasyid Ahmad (🇮🇩)
    // https://www.pexels.com/photo/teacher-wearing-traditional-hat-sitting-by-desk-5415446/
    profilePic: 'https://images.pexels.com/photos/5415446/pexels-photo-5415446.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
  },
  {
    username: 'marketing.kreatif',
    // Wanita hijab putih, studio, percaya diri — Pexels free license
    // https://www.pexels.com/photo/portrait-of-woman-in-hijab-against-red-background-32322332/
    profilePic: 'https://images.pexels.com/photos/32322332/pexels-photo-32322332.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
  },
  {
    username: 'keluarga.sakinah',
    // Wanita hijab hitam, taman, senyum — foto: Ruly Nurul Ihsan (🇮🇩)
    // https://www.pexels.com/photo/young-woman-smiling-in-a-scenic-outdoor-garden-30160802/
    profilePic: 'https://images.pexels.com/photos/30160802/pexels-photo-30160802.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
  },
  {
    username: 'manajemen.produktif',
    // Pria muda jas hitam, Jawa Tengah — foto: Mufid Hanif (🇮🇩)
    // https://www.pexels.com/photo/young-professional-in-business-suit-outdoors-36292200/
    profilePic: 'https://images.pexels.com/photos/36292200/pexels-photo-36292200.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
  },
]

async function main() {
  for (const { username, profilePic } of AVATARS) {
    const user = await db.user.update({
      where: { username },
      data: { profilePic },
      select: { username: true, name: true },
    })
    console.log(`✅ @${user.username} (${user.name}) — avatar updated`)
  }
  console.log('\nSemua avatar berhasil diperbarui.')
}

main().catch(console.error).finally(() => db.$disconnect())
