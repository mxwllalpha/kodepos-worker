# 🔐 GitHub Secrets Setup Guide for kodepos-worker

## 📋 Required Secrets

### 1. Cloudflare API Token
- **Secret Name**: `CLOUDFLARE_API_TOKEN`
- **Description**: API token untuk autentikasi ke Cloudflare Workers
- **How to Create**:
  1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. Menuju: **Overview** → **Get your API token**
  3. Pilih **Create token** → **Edit Cloudflare Workers** template
  4. Customisasi token:
     - Nama: `kodepos-worker-prod`
     - Permissions: Cloudflare Workers Edit
     - Account: Pilih account yang tepat
     - Zone resources: All zones (untuk multi-account)
  5. Copy token value yang dihasilkan

### 2. Cloudflare Account ID
- **Secret Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Description**: Account ID untuk deploy worker
- **How to Find**:
  1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. Scroll ke bawah → **Overview**
  3. Account ID terdapat di sidebar kanan

## 🛠️ Cara Setup di GitHub Repository

### Method 1: Melalui GitHub Web Interface
1. Pergi ke repository: `https://github.com/mxwllalpha/kodepos-worker`
2. Klik **Settings** tab
3. Pilih **Secrets and variables** → **Actions**
4. Klik **New repository secret**
5. Isi detail:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Secret**: Paste API token dari Cloudflare
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Secret**: Paste Account ID dari Cloudflare
6. Klik **Add secret**
7. Ulangi untuk secret kedua

### Method 2: Menggunakan GitHub CLI
```bash
# Login ke GitHub terlebih dahulu
gh auth login

# Navigasi ke repository
cd kodepos-worker

# Tambahkan secrets
gh secret set CLOUDFLARE_API_TOKEN "paste_token_disini"
gh secret set CLOUDFLARE_ACCOUNT_ID "paste_account_id_disini"
```

## ⚠️ Security Notes

### ❌ JANGAN LAKUKAN:
- JANGAN commit secrets ke git repository
- JANGAN share secrets di tempat umum
- JANGAN gunakan token yang sama untuk production lain

### ✅ PRAKTEK BAIK:
- Gunakan token dengan permission minimal (Cloudflare Workers Edit saja)
- Batasi token hanya untuk account yang diperlukan
- Gunakan environment variables daripada hardcoding token

## 🔧 Konfigurasi Wrangler

Setelah secrets setup, Wrangler akan otomatis menggunakan:
- `CLOUDFLARE_API_TOKEN` untuk autentikasi
- `CLOUDFLARE_ACCOUNT_ID` untuk deploy ke account yang benar

## 📋 Testing Setup

Setelah setup secrets, jalankan perintah berikut:
```bash
# Test autentikasi
npx wrangler whoami

# Test deployment
npm run deploy
```

## 🚀 Deployment Workflow Akan Berjalan Otomatis

Setelah secrets dikonfigurasi dengan benar:
1. ✅ Authentication akan berhasil menggunakan `wrangler whoami`
2. ✅ Database akan diciptakan otomatis
3. ✅ Data import akan berjalan untuk production
4. ✅ Semua environment URL menggunakan `kodepos-worker.tekipik.workers.dev`

## 📞 Troubleshooting

Jika deployment gagal:
1. Periksa secrets di GitHub repository
2. Pastikan token memiliki permission yang cukup
3. Coba jalankan manual deployment untuk testing
4. Periksa log error di GitHub Actions

---
*Dokumentasi ini dibuat sebagai panduan setup untuk kodepos-worker*