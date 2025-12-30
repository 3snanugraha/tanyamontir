Create Order
Gunakan endpoint ini untuk menginisiasi pembayaran. Sistem akan men-generate QRIS dinamis yang valid selama 10 menit.

Post
https://cashi.id/api/create-order
Parameters (JSON)
Field Type Required Description
amount Number Yes Nominal (Min. 2000)
order_id String No\* ID Unik dari sistem Anda (Disarankan)
Example Request
{
"amount": 15000,
"order_id": "INV-9921",
}
Example Response
{
"success": true,
"order_id": "INV-9921",
"amount": 15023,
"checkout_url": "https://cashi.id/pay/ORD-123",
"qrUrl": "data:image/png;..."
}
Nominal Unik: Cashi akan menambahkan angka unik (1-99) pada nominal transfer untuk verifikasi otomatis. Pastikan user mentransfer sesuai nominal yang muncul di checkout page.

Check Status
Verifikasi status transaksi menggunakan Order ID.

Get
https://cashi.id/api/check-status/:orderId
Response Schema
{
"success": true,
"status": "SETTLED",
"amount": 50078,
"order_id": "INV-123",
"provider_tx_id": "31277571482"
}

Webhooks
Sinkronkan database Anda secara real-time saat pembayaran selesai.

PHP SDK
NODEJS SDK
nodejs Handler
// Express.js Example
app.post('/webhook', (req, res) => {
const { event, data } = req.body;

if (event === 'PAYMENT_SETTLED') {
// 1. HANDLE TEST WEBHOOK DARI DASHBOARD
if (data.order_id.startsWith('TEST-')) {
console.log('Cashi Test Connection Received');
return res.status(200).send('Test OK');
}

    // 2. LOGIC TRANSAKSI ASLI
    if (data.status === 'SETTLED') {
      // Update DB Anda
    }

    res.status(200).send('OK');

}
});
Peringatan Keamanan:

1. Selalu validasi bahwa status adalah SETTLED sebelum memberikan produk digital.

2. Pastikan endpoint Webhook Anda bisa diakses publik (tidak di localhost).

3. Return 200 OK untuk menghentikan retries notifikasi.

Cara Testing Webhook
Anda dapat menguji koneksi server Anda melalui Dashboard Merchant:

Masuk ke Settings > Webhook
Masukkan URL Webhook Anda (harus https)
Klik tombol Test Webhook
Cashi akan mengirimkan payload dengan order_id berawalan TEST-xxxx
Jika server Anda merespon 200 OK, indikator status akan berubah menjadi hijau.

<div class="border rounded-[2.5rem] p-8 space-y-8 bg-slate-900 border-slate-800"><div class="flex justify-between items-center"><div class="flex items-center gap-3"><div class="bg-emerald-500 p-2 rounded-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg></div><h3 class="text-sm font-black uppercase tracking-widest text-white">Endpoints</h3></div><div class="flex gap-2"><button class="flex items-center gap-2 text-[10px] font-bold px-5 py-2.5 rounded-xl transition-all border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg> Test</button><button class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save inline mr-2" aria-hidden="true"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg>Save Config</button></div></div><div class="grid grid-cols-1 gap-6"><div class="space-y-3"><label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Webhook URL (Callback)</label><div class="flex items-center p-2 rounded-2xl border transition-colors bg-slate-950 border-slate-800"><span class="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase ml-2">URL</span><input placeholder="https://yourserver.com/api/webhook" class="flex-1 bg-transparent px-4 py-2 text-xs font-mono outline-none text-blue-400" value=""></div></div><div class="space-y-3"><label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Success Redirect URL</label><div class="flex items-center p-2 rounded-2xl border transition-colors bg-slate-950 border-slate-800"><span class="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase ml-2">URL</span><input placeholder="https://yourstore.com/checkout/success" class="flex-1 bg-transparent px-4 py-2 text-xs font-mono outline-none text-blue-400" value=""></div></div></div></div>
