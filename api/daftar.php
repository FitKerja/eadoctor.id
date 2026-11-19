<?php
/* =========================================================
   POST api/daftar.php
   Simpan pendaftar baru ke MySQL lalu kirim email "Selamat".
   Balasan selalu JSON: { ok: bool, pesan: string }
   ========================================================= */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';
require __DIR__ . '/email-selamat.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function balas(int $kode, bool $ok, string $pesan): void
{
    http_response_code($kode);
    echo json_encode(['ok' => $ok, 'pesan' => $pesan], JSON_UNESCAPED_UNICODE);
    exit;
}

function catat(string $teks): void
{
    error_log('[' . date('c') . '] ' . $teks . PHP_EOL, 3, __DIR__ . '/error.log');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    balas(405, false, 'Metode tidak diizinkan.');
}

$cfg = require __DIR__ . '/config.php';

/* ---------- ambil & bersihkan input ---------- */
$nama  = trim((string)($_POST['nama'] ?? ''));
$email = strtolower(trim((string)($_POST['email'] ?? '')));
$wa    = preg_replace('/\D+/', '', (string)($_POST['wa'] ?? ''));
$sandi = (string)($_POST['sandi'] ?? '');

/* honeypot: kolom tersembunyi yang hanya diisi bot */
if (!empty($_POST['situs'])) {
    balas(200, true, 'Pendaftaran berhasil.');
}

/* nomor WA → format internasional 62xxxx */
if (str_starts_with($wa, '0')) {
    $wa = '62' . substr($wa, 1);
}

/* ---------- validasi ---------- */
$panjangNama = mb_strlen($nama);
if ($panjangNama < 3 || $panjangNama > 100) {
    balas(422, false, 'Nama lengkap minimal 3 karakter.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    balas(422, false, 'Alamat email tidak valid.');
}
if (strlen($wa) < 10 || strlen($wa) > 15) {
    balas(422, false, 'Nomor WhatsApp tidak valid.');
}
if (strlen($sandi) < 8) {
    balas(422, false, 'Kata sandi minimal 8 karakter.');
}

/* ---------- simpan ke database ---------- */
try {
    $db = new PDO(
        "mysql:host={$cfg['db']['host']};dbname={$cfg['db']['nama']};charset=utf8mb4",
        $cfg['db']['user'],
        $cfg['db']['sandi'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $cek = $db->prepare('SELECT 1 FROM pengguna WHERE email = ? LIMIT 1');
    $cek->execute([$email]);
    if ($cek->fetchColumn()) {
        balas(409, false, 'Email ini sudah terdaftar. Silakan login.');
    }

    $simpan = $db->prepare(
        'INSERT INTO pengguna (nama, email, wa, sandi_hash) VALUES (?, ?, ?, ?)'
    );
    $simpan->execute([$nama, $email, $wa, password_hash($sandi, PASSWORD_DEFAULT)]);
} catch (PDOException $e) {
    /* 23000 = email kembar (jika dua pendaftaran masuk bersamaan) */
    if ($e->getCode() === '23000') {
        balas(409, false, 'Email ini sudah terdaftar. Silakan login.');
    }
    catat('DB: ' . $e->getMessage());
    balas(500, false, 'Server sedang bermasalah. Coba lagi beberapa saat.');
}

/* ---------- kirim email selamat ---------- */
$terkirim = true;
try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $cfg['smtp']['host'];
    $mail->Port       = (int)$cfg['smtp']['port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['smtp']['user'];
    $mail->Password   = $cfg['smtp']['sandi'];
    $mail->SMTPSecure = $mail->Port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($cfg['smtp']['user'], $cfg['pengirim_nama']);
    if (!empty($cfg['balas_ke'])) {
        $mail->addReplyTo($cfg['balas_ke'], $cfg['pengirim_nama']);
    }
    $mail->addAddress($email, $nama);

    $mail->isHTML(true);
    $mail->Subject = 'Selamat bergabung di EADOCTOR, ' . $nama . '!';
    $mail->Body    = email_selamat_html($nama, $cfg['url_situs']);
    $mail->AltBody = email_selamat_teks($nama, $cfg['url_situs']);

    $mail->send();
} catch (MailException $e) {
    $terkirim = false;
    catat('MAIL ke ' . $email . ': ' . ($mail->ErrorInfo ?? $e->getMessage()));
}

/* akun tetap tersimpan walau email gagal terkirim */
balas(
    201,
    true,
    $terkirim
        ? 'Pendaftaran berhasil! Cek email Anda untuk ucapan selamat dari kami.'
        : 'Pendaftaran berhasil! (Email konfirmasi belum terkirim, admin akan menghubungi Anda.)'
);
