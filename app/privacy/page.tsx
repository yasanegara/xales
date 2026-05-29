import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = { title: 'Kebijakan Privasi | Tweak' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '0.75rem' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9375rem', color: '#4a4540', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c9690', marginBottom: '0.75rem' }}>
            Legal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '0.75rem' }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#9c9690', lineHeight: 1.6 }}>
            Terakhir diperbarui: 1 Juni 2025
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e0d8', marginBottom: '2.5rem' }} />

        <p style={{ fontSize: '0.9375rem', color: '#4a4540', lineHeight: 1.75, marginBottom: '2rem' }}>
          Tweak berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform Tweak.
        </p>

        <Section title="Informasi yang Kami Kumpulkan">
          <p>Kami mengumpulkan informasi berikut saat Anda menggunakan Tweak:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}><strong>Data akun:</strong> nama, alamat email, username, dan foto profil;</li>
            <li style={{ marginBottom: '0.375rem' }}><strong>Data pembayaran:</strong> informasi rekening bank atau QRIS yang Anda berikan untuk menerima pembayaran (tidak disimpan secara penuh di sistem kami);</li>
            <li style={{ marginBottom: '0.375rem' }}><strong>Konten:</strong> artikel, app, dan file yang Anda publikasikan;</li>
            <li style={{ marginBottom: '0.375rem' }}><strong>Data aktivitas:</strong> konten yang dilihat, disukai, atau disimpan;</li>
            <li><strong>Data teknis:</strong> alamat IP, jenis browser, dan data penggunaan untuk keperluan diagnostik dan peningkatan layanan.</li>
          </ul>
        </Section>

        <Section title="Bagaimana Kami Menggunakan Informasi Anda">
          <p>Informasi Anda kami gunakan untuk:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}>Mengelola dan mengoperasikan akun Anda;</li>
            <li style={{ marginBottom: '0.375rem' }}>Memproses transaksi pembelian konten;</li>
            <li style={{ marginBottom: '0.375rem' }}>Menampilkan konten yang relevan berdasarkan preferensi Anda;</li>
            <li style={{ marginBottom: '0.375rem' }}>Meningkatkan fitur dan pengalaman platform;</li>
            <li style={{ marginBottom: '0.375rem' }}>Mengirim notifikasi layanan yang relevan;</li>
            <li>Mencegah penyalahgunaan dan menjaga keamanan platform.</li>
          </ul>
        </Section>

        <Section title="Penyimpanan & Keamanan Data">
          <p>
            Data Anda disimpan di server yang aman. Kami menggunakan enkripsi standar industri untuk melindungi data sensitif. Password disimpan dalam bentuk hash dan tidak dapat dibaca oleh siapapun, termasuk tim Tweak.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Meskipun kami mengambil langkah-langkah teknis yang wajar, tidak ada sistem yang 100% aman. Kami tidak dapat menjamin keamanan mutlak atas data yang Anda transmisikan ke platform.
          </p>
        </Section>

        <Section title="Berbagi Informasi dengan Pihak Ketiga">
          <p>
            Tweak tidak menjual, menukar, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi hanya dalam kondisi berikut:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}>Dengan persetujuan eksplisit dari Anda;</li>
            <li style={{ marginBottom: '0.375rem' }}>Jika diwajibkan oleh hukum atau otoritas berwenang di Indonesia;</li>
            <li>Untuk melindungi hak, properti, atau keselamatan Tweak dan pengguna lainnya.</li>
          </ul>
        </Section>

        <Section title="Cookie & Teknologi Serupa">
          <p>
            Tweak menggunakan cookie untuk menjaga sesi login Anda dan mengingat preferensi tampilan. Cookie ini bersifat esensial untuk fungsi platform. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur platform mungkin tidak berfungsi dengan baik.
          </p>
        </Section>

        <Section title="Hak Anda atas Data">
          <p>Anda memiliki hak untuk:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}>Mengakses dan mengunduh data pribadi Anda;</li>
            <li style={{ marginBottom: '0.375rem' }}>Memperbarui atau mengoreksi informasi yang tidak akurat;</li>
            <li style={{ marginBottom: '0.375rem' }}>Menghapus akun dan data Anda dari platform;</li>
            <li>Menolak pemrosesan data untuk tujuan tertentu.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Untuk menggunakan hak-hak ini, hubungi kami di <a href="mailto:hello@tweak.id" style={{ color: '#1a1a1a', fontWeight: 600 }}>hello@tweak.id</a>.
          </p>
        </Section>

        <Section title="Konten yang Dipublikasikan">
          <p>
            Konten yang Anda publikasikan di Tweak (artikel, app, komentar) dapat dilihat oleh pengguna lain sesuai dengan pengaturan privasi yang Anda pilih. Konten yang ditandai sebagai privat hanya dapat dilihat oleh Anda sendiri.
          </p>
        </Section>

        <Section title="Akun Anak di Bawah Umur">
          <p>
            Tweak tidak dengan sengaja mengumpulkan informasi dari pengguna di bawah usia 17 tahun. Jika kami mengetahui bahwa kami telah mengumpulkan data dari pengguna di bawah usia tersebut, kami akan menghapusnya segera.
          </p>
        </Section>

        <Section title="Perubahan Kebijakan Privasi">
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Kelanjutan penggunaan Anda setelah perubahan berlaku dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.
          </p>
        </Section>

        <Section title="Hubungi Kami">
          <p>
            Jika Anda memiliki pertanyaan atau kekhawatiran mengenai Kebijakan Privasi ini atau cara kami menangani data Anda, silakan hubungi:
          </p>
          <div style={{ marginTop: '0.75rem', padding: '1rem 1.25rem', background: '#f7f5f2', borderRadius: '8px', border: '1px solid #e5e0d8' }}>
            <p style={{ margin: 0 }}><strong>Tweak</strong></p>
            <p style={{ margin: '0.25rem 0 0' }}>Email: <a href="mailto:hello@tweak.id" style={{ color: '#1a1a1a', fontWeight: 600 }}>hello@tweak.id</a></p>
          </div>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e0d8', margin: '2.5rem 0 1.5rem' }} />

        <div style={{ fontSize: '0.8125rem', color: '#9c9690', lineHeight: 1.7 }}>
          <p>Kebijakan ini tunduk pada hukum yang berlaku di Republik Indonesia.</p>
          <p>© {new Date().getFullYear()} Tweak. Hak Cipta Dilindungi Undang-Undang.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <a href="/terms" style={{ color: '#9c9690', textDecoration: 'none', borderBottom: '1px solid #d5c9b0' }}>Syarat & Ketentuan</a>
          </p>
        </div>
      </main>
    </>
  )
}
