# EADOCTOR

Situs Expert Advisor trading. Situs statis (HTML/CSS/JS), tema zamrud gelap dengan aksen emas, diturunkan dari gaya SLIMFie.

## Struktur

```
index.html          Halaman utama: Home, Tentang, Investor, Promosi
daftar.html         Halaman Daftar (kerangka, belum terhubung server)
masuk.html          Halaman Login (kerangka, belum terhubung server)
assets/favicon.svg  Logo/ikon
assets/css/style.css
assets/js/main.js   Navigasi, menu seluler, tombol WhatsApp, animasi
assets/img/         Foto & gambar
```

## Mengisi konten

- Cari teks `[Konten menyusul]`, `[...]`, dan `—` di `index.html`, lalu ganti dengan konten asli.
- Bagian yang perlu diisi ditandai komentar `<!-- KONTEN: ... -->`.
- Foto: simpan di `assets/img/`, lalu ganti `<div class="bingkai-foto">` dengan `<img>`.

## WhatsApp

Isi nomor di `assets/js/main.js`:

```js
var NOMOR_WA = "6281234567890"; // format internasional tanpa +
```

Selama kosong, tombol menampilkan "Nomor WhatsApp admin segera tersedia".

## Belum ada

- Sistem akun (Daftar/Login) masih tampilan saja.
- Deploy & domain.

## Cache CSS/JS

Hostinger CDN dan browser menyimpan `style.css` dan `main.js` hingga 7 hari. Setiap kali kedua file itu diubah, naikkan angka versi di semua halaman HTML agar pengunjung langsung mendapat versi baru:

```html
<link rel="stylesheet" href="assets/css/style.css?v=20261119" />
<script src="assets/js/main.js?v=20261119" defer></script>
```

Ganti `20261119` dengan tanggal hari ini (cari-ganti di semua file `.html`).
