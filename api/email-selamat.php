<?php
/* Template email "Selamat bergabung" untuk pendaftar baru. */

function email_selamat_html(string $nama, string $urlSitus): string
{
    $n = htmlspecialchars($nama, ENT_QUOTES, 'UTF-8');
    $login = htmlspecialchars(rtrim($urlSitus, '/') . '/masuk.html', ENT_QUOTES, 'UTF-8');
    $tahun = date('Y');

    return <<<HTML
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Selamat bergabung di EADOCTOR</title></head>
<body style="margin:0;padding:0;background:#021713;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#021713;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#04211b;border:1px solid #3a4a2a;border-radius:16px;">
        <tr><td style="padding:28px 32px 8px;font-size:22px;font-weight:bold;color:#ffffff;">
          EA<span style="color:#e6c766;">DOCTOR</span>
        </td></tr>
        <tr><td style="padding:12px 32px 0;">
          <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;">Selamat, {$n}! 🎉</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#c9d6cf;">
            Pendaftaran akun EADOCTOR Anda berhasil. Terima kasih telah bergabung bersama kami.
          </p>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#c9d6cf;">
            Kini Anda dapat login untuk melihat informasi <strong style="color:#e6c766;">EAJO Copytrade</strong>,
            robot trading emas (XAUUSD) dengan manajemen risiko yang disiplin.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <a href="{$login}" style="display:inline-block;background:#d4af37;color:#04211b;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 26px;border-radius:999px;">Login ke akun saya</a>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;font-size:13px;line-height:1.6;color:#8fa59a;">
          Jika Anda tidak merasa mendaftar di EADOCTOR, abaikan email ini.<br>
          Semoga kita mendapatkan keuntungan yang berkah.
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #3a4a2a;font-size:12px;color:#6f857a;">
          © EADOCTOR {$tahun}. Trading mengandung risiko; hasil masa lalu tidak menjamin hasil di masa depan.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}

function email_selamat_teks(string $nama, string $urlSitus): string
{
    $login = rtrim($urlSitus, '/') . '/masuk.html';
    return "Selamat, {$nama}!\n\n"
        . "Pendaftaran akun EADOCTOR Anda berhasil. Terima kasih telah bergabung.\n"
        . "Login di: {$login}\n\n"
        . "Jika Anda tidak merasa mendaftar, abaikan email ini.\n\n"
        . "© EADOCTOR " . date('Y');
}
