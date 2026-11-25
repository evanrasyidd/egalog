import { BackLink } from "@/components/back-link";

export default function PrivasiPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <BackLink href="/karir" label="Kembali ke Karier" />

      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        EGALOG/KARIER/PRIVASI
      </p>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
        Kebijakan Privasi Pelamar
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Berlaku untuk data yang kamu kirim lewat formulir lamaran di halaman karir EgaLog.
      </p>

      <div className="space-y-7 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Data yang kami kumpulkan</h2>
          <p>
            Nama lengkap, email, nomor HP, ringkasan pengalaman, dan file CV
            (PDF/DOC/DOCX) yang kamu unggah. Kami tidak meminta data sensitif
            seperti NIK, nomor rekening, atau riwayat kesehatan pada tahap
            lamaran.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Tujuan pemrosesan</h2>
          <p>
            Data dipakai hanya untuk menilai kesesuaian profilmu dengan posisi
            yang dilamar, menghubungi kamu soal proses seleksi, dan menyimpan
            catatan rekrutmen internal. Kami tidak menjual atau membagikan data
            pelamar ke pihak ketiga untuk tujuan pemasaran.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Penyimpanan & akses</h2>
          <p>
            Data disimpan di sistem internal EgaLog dan hanya bisa diakses oleh
            tim HR serta pihak yang berwenang menangani rekrutmen. CV tidak
            ditampilkan di halaman publik.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Masa simpan</h2>
          <p>
            Data pelamar yang tidak dilanjutkan disimpan maksimal 12 bulan sejak
            lamaran dikirim, lalu dihapus. Kamu bisa meminta penghapusan lebih
            awal kapan saja.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Hak kamu</h2>
          <p>
            Kamu berhak meminta salinan, koreksi, atau penghapusan data lamaran.
            Kirim permintaan ke{" "}
            <a href="mailto:karir@egalog.co.id" className="text-primary underline">
              karir@egalog.co.id
            </a>{" "}
            dengan subjek &ldquo;Permintaan Data Pelamar&rdquo;.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Persetujuan</h2>
          <p>
            Dengan mencentang kotak persetujuan di formulir lamaran, kamu
            menyetujui pemrosesan data sesuai kebijakan ini. Kamu bisa menarik
            persetujuan kapan saja lewat kontak di atas.
          </p>
        </section>
      </div>
    </div>
  );
}
