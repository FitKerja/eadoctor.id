/* EADOCTOR — skrip situs: navigasi melekat, menu seluler, tautan aktif,
   tombol WhatsApp, formulir kerangka, animasi masuk. */
(function () {
  "use strict";

  /* ---------- pengaturan ---------- */
  /* Isi nomor WhatsApp admin (format internasional tanpa +), contoh: "6281234567890".
     Selama kosong, tombol WhatsApp menampilkan pesan "segera tersedia". */
  var NOMOR_WA = "62887437171917";
  var PESAN_WA = "Halo EADOCTOR, saya ingin konsultasi";

  /* ---------- navigasi ---------- */
  var nav = document.querySelector("[data-nav]");
  var tautan = document.querySelector("[data-nav-tautan]");
  var tombolMenu = document.querySelector("[data-nav-tombol]");

  function perbaruiNav() {
    var melekat =
      nav.hasAttribute("data-nav-tetap") ||
      window.scrollY > 24 ||
      tautan.classList.contains("nav__pil--buka");
    nav.classList.toggle("nav--melekat", melekat);
  }
  function tutupMenu() {
    tautan.classList.remove("nav__pil--buka");
    tombolMenu.setAttribute("aria-expanded", "false");
    tombolMenu.setAttribute("aria-label", "Buka menu");
    perbaruiNav();
  }

  if (nav && tautan && tombolMenu) {
    perbaruiNav();
    window.addEventListener("scroll", perbaruiNav, { passive: true });

    tombolMenu.addEventListener("click", function () {
      var buka = tautan.classList.toggle("nav__pil--buka");
      tombolMenu.setAttribute("aria-expanded", buka ? "true" : "false");
      tombolMenu.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
      perbaruiNav();
    });
    tautan.addEventListener("click", function (e) {
      if (e.target.closest("a")) tutupMenu();
    });
    document.addEventListener("click", function (e) {
      if (
        tautan.classList.contains("nav__pil--buka") &&
        !e.target.closest("[data-nav]")
      )
        tutupMenu();
    });

    /* dropdown "More": buka/tutup, tutup saat klik di luar atau tekan Esc */
    var lagi = document.querySelector("[data-nav-lagi]");
    var tombolLagi = document.querySelector("[data-nav-lagi-tombol]");
    function aturLagi(buka) {
      lagi.classList.toggle("nav__lagi--buka", buka);
      tombolLagi.setAttribute("aria-expanded", buka ? "true" : "false");
    }
    if (lagi && tombolLagi) {
      tombolLagi.addEventListener("click", function (e) {
        e.stopPropagation();
        aturLagi(!lagi.classList.contains("nav__lagi--buka"));
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest("[data-nav-lagi]") || e.target.closest("a")) aturLagi(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lagi.classList.contains("nav__lagi--buka")) {
          aturLagi(false);
          tombolLagi.focus();
        }
      });
      /* tandai "More" bila sedang berada di salah satu halamannya */
      var halaman = location.pathname.split("/").pop();
      lagi.querySelectorAll(".nav__lagi-menu a").forEach(function (a) {
        if (a.getAttribute("href") === halaman) {
          a.setAttribute("aria-current", "page");
          tombolLagi.setAttribute("aria-current", "true");
        }
      });
    }

    /* tandai menu utama (Tentang, Data, Promosi) saat halamannya sedang dibuka */
    var halamanIni = location.pathname.split("/").pop();
    if (halamanIni && halamanIni !== "index.html") {
      tautan.querySelectorAll(":scope > a").forEach(function (a) {
        if (a.getAttribute("href") === halamanIni) a.setAttribute("aria-current", "true");
      });
    }

    /* tandai tautan navigasi sesuai bagian yang sedang dibaca */
    var tautanNav = Array.prototype.slice.call(
      tautan.querySelectorAll('a[href^="#"]'),
    );
    if ("IntersectionObserver" in window) {
      var pengamatBagian = new IntersectionObserver(
        function (entri) {
          entri.forEach(function (e) {
            if (!e.isIntersecting) return;
            tautanNav.forEach(function (a) {
              if (a.getAttribute("href") === "#" + e.target.id)
                a.setAttribute("aria-current", "true");
              else a.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      tautanNav.forEach(function (a) {
        var sasaran = document.querySelector(a.getAttribute("href"));
        if (sasaran) pengamatBagian.observe(sasaran);
      });
    }
  }

  /* ---------- WhatsApp mengambang ---------- */
  /* Semua elemen [data-wa] (tombol mengambang, Konsultasi, Gabung jadi promoter)
     memakai nomor yang sama. Pesan awal bisa diganti per tombol lewat data-wa-teks. */
  var pesanWa = document.querySelector("[data-wa-pesan]");
  var waktuPesanWa;
  document.querySelectorAll("[data-wa]").forEach(function (tombolWa) {
    if (NOMOR_WA) {
      tombolWa.href =
        "https://wa.me/" + NOMOR_WA + "?text=" +
        encodeURIComponent(tombolWa.getAttribute("data-wa-teks") || PESAN_WA);
    } else {
      tombolWa.addEventListener("click", function (e) {
        e.preventDefault();
        if (!pesanWa) return;
        pesanWa.hidden = false;
        clearTimeout(waktuPesanWa);
        waktuPesanWa = setTimeout(function () {
          pesanWa.hidden = true;
        }, 3500);
      });
    }
  });

  /* ---------- berita berjalan: ulangi isi hingga selebar layar, lalu gandakan
     satu grup agar geseran -50% berputar mulus ---------- */
  document.querySelectorAll("[data-berjalan]").forEach(function (wadah) {
    var jalur = wadah.querySelector(".berjalan__jalur");
    var grup = jalur.querySelector(".berjalan__grup");
    var asli = Array.prototype.slice.call(grup.children);
    var batas = 0;
    while (grup.scrollWidth < wadah.clientWidth && batas++ < 10) {
      asli.forEach(function (li) {
        var salinan = li.cloneNode(true);
        salinan.setAttribute("aria-hidden", "true");
        grup.appendChild(salinan);
      });
    }
    var kembar = grup.cloneNode(true);
    kembar.setAttribute("aria-hidden", "true");
    jalur.appendChild(kembar);
    /* kecepatan tetap ±60px/detik berapa pun panjang isinya */
    jalur.style.setProperty("--durasi-berjalan", Math.round(grup.scrollWidth / 60) + "s");
  });

  /* ---------- testimoni berjalan: gandakan isi agar putaran mulus ---------- */
  document.querySelectorAll("[data-gandakan]").forEach(function (jalur) {
    var salinan = jalur.firstElementChild.cloneNode(true);
    salinan.setAttribute("aria-hidden", "true");
    jalur.appendChild(salinan);
  });

  /* ---------- formulir Daftar → api/daftar.php ---------- */
  /* Setelah pendaftaran berhasil, pengguna diarahkan ke link ini */
  var LINK_LANJUT_DAFTAR = "https://vigco.co/la-s1com-inv/id/kVxIS4rZ";
  /* MODE_DUMMY = true → formulir tidak divalidasi / tidak dikirim ke api/daftar.php,
     tombol Daftar langsung membuka LINK_LANJUT_DAFTAR. Ubah ke false untuk mengaktifkan lagi. */
  var MODE_DUMMY = true;
  document.querySelectorAll("[data-formulir-daftar]").forEach(function (f) {
    var info = f.querySelector("[data-formulir-info]");
    var tombol = f.querySelector('button[type="submit"]');
    var teksTombol = tombol ? tombol.textContent : "";

    function tampilkan(pesan, gagal) {
      if (!info) return;
      info.textContent = pesan;
      info.style.color = gagal ? "#ff9b8a" : "";
      info.hidden = false;
    }

    /* hapus tanda merah begitu kolom diisi */
    f.addEventListener("input", function (e) {
      if (e.target.value.trim() !== "") e.target.setAttribute("aria-invalid", "false");
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      if (MODE_DUMMY) {
        window.location.href = LINK_LANJUT_DAFTAR;
        return;
      }

      /* kolom kosong → tetap di halaman ini, tandai kolomnya */
      var label = { nama: "Nama lengkap", email: "Email", wa: "Nomor WhatsApp", sandi: "Kata sandi" };
      var kosong = [];
      Object.keys(label).forEach(function (k) {
        var isKosong = f[k].value.trim() === "";
        f[k].setAttribute("aria-invalid", isKosong ? "true" : "false");
        if (isKosong) kosong.push(label[k]);
      });
      if (kosong.length) {
        f[Object.keys(label).filter(function (k) { return f[k].value.trim() === ""; })[0]].focus();
        return tampilkan("Mohon lengkapi: " + kosong.join(", ") + ".", true);
      }

      /* validasi sisi browser (server tetap memvalidasi ulang) */
      var nama = f.nama.value.trim();
      var email = f.email.value.trim();
      var wa = f.wa.value.replace(/\D+/g, "");
      var sandi = f.sandi.value;
      if (nama.length < 3) return tampilkan("Nama lengkap minimal 3 karakter.", true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return tampilkan("Alamat email tidak valid.", true);
      if (wa.length < 10 || wa.length > 15) return tampilkan("Nomor WhatsApp tidak valid.", true);
      if (sandi.length < 8) return tampilkan("Kata sandi minimal 8 karakter.", true);

      if (tombol) { tombol.disabled = true; tombol.textContent = "Memproses…"; }
      if (info) info.hidden = true;

      fetch(f.action, { method: "POST", body: new FormData(f) })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: false, pesan: "Server tidak merespons dengan benar." };
          });
        })
        .then(function (hasil) {
          tampilkan(hasil.pesan || "Terjadi kesalahan.", !hasil.ok);
          if (hasil.ok) {
            f.reset();
            /* langkah berikutnya: buka akun trading di Vantage (link afiliasi) */
            tampilkan(hasil.pesan + " Mengarahkan ke pembukaan akun trading…", false);
            setTimeout(function () { window.location.href = LINK_LANJUT_DAFTAR; }, 2000);
          }
        })
        .catch(function () {
          tampilkan("Gagal terhubung ke server. Periksa koneksi Anda.", true);
        })
        .finally(function () {
          if (tombol) { tombol.disabled = false; tombol.textContent = teksTombol; }
        });
    });
  });

  /* ---------- formulir Login (kerangka, belum terhubung server) ---------- */
  document.querySelectorAll("[data-formulir-kerangka]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var info = f.querySelector("[data-formulir-info]");
      if (info) info.hidden = false;
    });
  });

  /* ---------- tab varian di Data Analytic ----------
     Tanpa JavaScript ketiga panel tampil berurutan; dengan JavaScript
     tab muncul dan hanya satu panel yang ditampilkan. */
  var daftarTab = document.querySelector("[data-da-tab]");
  if (daftarTab) {
    var tombolTab = Array.prototype.slice.call(daftarTab.querySelectorAll("[role=tab]"));
    var pilihTab = function (tombol, fokus) {
      tombolTab.forEach(function (t) {
        var aktif = t === tombol;
        t.setAttribute("aria-selected", aktif ? "true" : "false");
        t.tabIndex = aktif ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !aktif;
      });
      if (fokus) tombol.focus();
    };
    tombolTab.forEach(function (t, i) {
      t.addEventListener("click", function () { pilihTab(t, false); });
      t.addEventListener("keydown", function (e) {
        var arah = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!arah) return;
        e.preventDefault();
        pilihTab(tombolTab[(i + arah + tombolTab.length) % tombolTab.length], true);
      });
    });
    daftarTab.hidden = false;
    pilihTab(tombolTab[0], false);
  }

  /* ---------- tombol Copy nomor telepon (QnA) ---------- */
  document.querySelectorAll("[data-salin]").forEach(function (tombol) {
    var teksAwal = tombol.textContent;
    var selesai = function () {
      tombol.textContent = "Tersalin";
      tombol.classList.add("tersalin");
      clearTimeout(tombol._waktu);
      tombol._waktu = setTimeout(function () {
        tombol.textContent = teksAwal;
        tombol.classList.remove("tersalin");
      }, 2000);
    };
    tombol.addEventListener("click", function () {
      var nomor = tombol.getAttribute("data-salin");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(nomor).then(selesai, function () { salinCadangan(nomor) && selesai(); });
      } else if (salinCadangan(nomor)) {
        selesai();
      }
    });
  });
  /* cadangan untuk browser lama / halaman yang dibuka tanpa https */
  function salinCadangan(teks) {
    var kotak = document.createElement("textarea");
    kotak.value = teks;
    kotak.setAttribute("readonly", "");
    kotak.style.position = "fixed";
    kotak.style.opacity = "0";
    document.body.appendChild(kotak);
    kotak.select();
    var berhasil = false;
    try { berhasil = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(kotak);
    return berhasil;
  }

  /* ---------- animasi masuk ----------
     Hanya elemen di bawah layar saat dimuat yang disembunyikan,
     jadi halaman tetap lengkap tanpa JavaScript. */
  var animasi = document.querySelectorAll("[data-animasi]");
  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    var pengamatAnimasi = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("tampil");
          e.target.classList.remove("tunggu");
          pengamatAnimasi.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    animasi.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("tunggu");
        pengamatAnimasi.observe(el);
      }
    });
  }
})();
