-- Jalankan sekali di phpMyAdmin (hPanel → Databases → phpMyAdmin → tab SQL)
CREATE TABLE IF NOT EXISTS pengguna (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  wa            VARCHAR(20)  NOT NULL,
  sandi_hash    VARCHAR(255) NOT NULL,
  dibuat        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
