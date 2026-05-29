import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = { title: 'Syarat & Ketentuan | Tweak' }

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '0.75rem' }}>
        {num}. {title}
      </h2>
      <div style={{ fontSize: '0.9375rem', color: '#4a4540', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c9690', marginBottom: '0.75rem' }}>
            Legal
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '0.75rem' }}>
            Syarat &amp; Ketentuan
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#9c9690', lineHeight: 1.6 }}>
            Terakhir diperbarui: 1 Juni 2025
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e0d8', marginBottom: '2.5rem' }} />

        <Section num={1} title="Ketentuan Penggunaan">
          <p>
            Tweak ditawarkan kepada Anda, pengguna, dengan syarat bahwa Anda menerima ketentuan, syarat, dan pemberitahuan yang terkandung dalam dokumen ini. Dengan mengakses dan menggunakan platform Tweak, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini, serta aturan lain yang berlaku pada setiap bagian dari platform ini.
          </p>
        </Section>

        <Section num={2} title="Gambaran Umum">
          <p>
            Penggunaan platform ini merupakan persetujuan Anda terhadap semua ketentuan dan pemberitahuan yang berlaku. Dengan menggunakan Tweak, Anda setuju terhadap Syarat dan Ketentuan ini tanpa batasan atau pengecualian. Jika Anda tidak setuju, Anda harus menghentikan penggunaan platform ini segera.
          </p>
        </Section>

        <Section num={3} title="Perubahan Syarat & Ketentuan">
          <p>
            Tweak berhak untuk mengubah, memodifikasi, memperbarui, atau menghentikan ketentuan, pemberitahuan, dan isi platform ini kapan saja tanpa pemberitahuan sebelumnya. Harga konten dapat disesuaikan sewaktu-waktu. Kelanjutan penggunaan Anda setelah perubahan dilakukan dianggap sebagai persetujuan Anda terhadap perubahan tersebut.
          </p>
        </Section>

        <Section num={4} title="Lisensi Penggunaan">
          <p>
            Tweak memberikan Anda hak non-eksklusif dan tidak dapat dipindahkan untuk mengakses dan menggunakan platform ini semata-mata untuk keperluan pribadi atau bisnis internal Anda. Anda tidak boleh: (a) memodifikasi, mendekompilasi, atau melakukan rekayasa balik terhadap komponen platform; (b) membuat karya turunan berdasarkan platform; (c) mengizinkan pihak ketiga mengakses komponen platform tanpa izin.
          </p>
        </Section>

        <Section num={5} title="Hak Kekayaan Intelektual">
          <p>
            Platform Tweak dan dokumentasinya adalah milik Tweak atau pemberi lisensinya. Konten yang dipublikasikan oleh kreator di platform ini adalah hak milik kreator masing-masing. Anda hanya boleh menggunakan konten sesuai ketentuan yang ditetapkan kreator.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Seluruh materi platform Tweak — termasuk merek dagang, logo, dan desain — dilindungi oleh hukum hak cipta Indonesia dan internasional. Tidak ada materi yang boleh disalin, direproduksi, atau didistribusikan tanpa izin tertulis dari Tweak.
          </p>
        </Section>

        <Section num={6} title="Pendaftaran Akun">
          <p>
            Anda perlu mendaftar untuk membeli atau mempublikasikan konten di Tweak. Anda bertanggung jawab menjaga kerahasiaan username dan password Anda. Tweak tidak bertanggung jawab atas aktivitas yang terjadi di bawah akun Anda akibat kelalaian Anda dalam menjaga keamanan akun.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Anda tidak boleh berbagi akses, menyamar sebagai orang lain, atau memberikan informasi yang menyesatkan dalam proses pendaftaran.
          </p>
        </Section>

        <Section num={7} title="Biaya & Pembayaran">
          <p>
            Konten premium dijual dengan harga yang ditetapkan oleh kreator. Setiap transaksi pembelian bersifat final dan tidak dapat dibatalkan kecuali terdapat kesalahan yang dapat dibuktikan dari pihak penjual. Tweak tidak bertanggung jawab atas sengketa pembayaran antara pembeli dan kreator.
          </p>
        </Section>

        <Section num={8} title="Kelayakan & Batasan Usia">
          <p>
            Platform ini ditujukan untuk pengguna berusia 17 tahun ke atas. Dengan mendaftar, Anda menyatakan bahwa Anda memenuhi persyaratan usia minimum. Tweak berhak menangguhkan akun yang terbukti tidak memenuhi persyaratan ini.
          </p>
        </Section>

        <Section num={9} title="Konten Pengguna">
          <p>
            Anda menjamin bahwa konten yang Anda publikasikan di Tweak adalah milik Anda dan tidak melanggar hak pihak ketiga. Konten tidak boleh mengandung: materi yang melanggar hukum, konten pornografi, ujaran kebencian, informasi palsu yang menyesatkan, atau kode berbahaya (virus, malware, dll.).
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Tweak berhak menghapus konten yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.
          </p>
        </Section>

        <Section num={10} title="Penghentian Layanan">
          <p>Tweak dapat menangguhkan atau menghentikan akun Anda dengan efek segera jika:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}>Anda melanggar ketentuan penggunaan ini secara material;</li>
            <li style={{ marginBottom: '0.375rem' }}>Anda mempublikasikan konten yang melanggar hukum atau hak pihak ketiga;</li>
            <li style={{ marginBottom: '0.375rem' }}>Anda menggunakan platform untuk tujuan penipuan atau menyesatkan pengguna lain;</li>
            <li>Anda melakukan aktivitas yang membahayakan infrastruktur platform.</li>
          </ul>
        </Section>

        <Section num={11} title="Kerahasiaan & Keamanan">
          <p>
            Tweak mengambil langkah-langkah teknis yang wajar untuk mencegah pelanggaran keamanan. Namun, Anda memahami bahwa tidak ada sistem yang sepenuhnya aman, dan Tweak tidak memberikan jaminan keamanan mutlak atas data Anda.
          </p>
        </Section>

        <Section num={12} title="Kebijakan Privasi">
          <p>
            Informasi Anda aman bersama kami. Tweak memahami bahwa privasi sangat penting bagi pengguna. Data pribadi Anda tidak akan disalahgunakan, dijual, atau disebarkan kepada pihak ketiga tanpa persetujuan Anda. Kami hanya menggunakan informasi pribadi Anda untuk keperluan layanan platform.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Lihat <a href="/privacy" style={{ color: '#1a1a1a', fontWeight: 600 }}>Kebijakan Privasi</a> lengkap kami untuk detail lebih lanjut.
          </p>
        </Section>

        <Section num={13} title="Garansi & Tanggung Jawab">
          <p>Tweak berupaya untuk:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.375rem' }}>Menyediakan layanan dengan upaya terbaik sesuai dengan ketentuan ini;</li>
            <li>Memiliki wewenang penuh untuk menyediakan layanan kepada Anda.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Tweak tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kerusakan data yang timbul dari penggunaan platform ini.
          </p>
        </Section>

        <Section num={14} title="Ganti Rugi">
          <p>
            Anda setuju untuk membebaskan Tweak dari segala klaim, kewajiban, kerugian, atau pengeluaran (termasuk biaya hukum) yang timbul dari penggunaan platform oleh Anda atau pelanggaran Anda terhadap Syarat dan Ketentuan ini.
          </p>
        </Section>

        <Section num={15} title="Hukum yang Berlaku">
          <p>
            Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Setiap sengketa diselesaikan melalui jalur musyawarah atau pengadilan yang berwenang di Indonesia.
          </p>
        </Section>

        <Section num={16} title="Pertanyaan & Masukan">
          <p>
            Kami menyambut pertanyaan, komentar, dan masukan Anda mengenai privasi atau informasi apa pun yang dikumpulkan dari Anda. Silakan kirim pertanyaan atau masukan ke:{' '}
            <a href="mailto:hello@tweak.id" style={{ color: '#1a1a1a', fontWeight: 600 }}>hello@tweak.id</a>
          </p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e0d8', margin: '2.5rem 0 1.5rem' }} />

        <div style={{ fontSize: '0.8125rem', color: '#9c9690', lineHeight: 1.7 }}>
          <p><strong style={{ color: '#6e6a65' }}>Catatan Hukum</strong></p>
          <p>Tweak adalah platform publishing digital untuk kreator Indonesia.</p>
          <p>© {new Date().getFullYear()} Tweak. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </main>
    </>
  )
}
