/* ====== STATE & STORAGE ====== */
const KEY_BARANG = "daftarBarang"; // Mendefinisikan key agar tidak error
let daftarBarang = JSON.parse(localStorage.getItem(KEY_BARANG) || "[]");
let cart = {};
let editId = null;
const formatRupiah = n => "Rp " + (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");

/* ====== TABS ====== */
function showTab(t){
  document.getElementById("tabMenu").classList.toggle("hidden", t!=="menu");
  document.getElementById("tabKasir").classList.toggle("hidden", t!=="kasir");
  document.getElementById("tabInvoice").classList.toggle("hidden", t!=="invoice");
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  document.getElementById("tabBtn"+t.charAt(0).toUpperCase()+t.slice(1)).classList.add("active");
}

document.getElementById("tabBtnMenu").onclick = ()=>showTab("menu");
document.getElementById("tabBtnKasir").onclick = ()=>showTab("kasir");
document.getElementById("tabBtnInvoice").onclick = ()=>{showTab("invoice"); renderInvoice();};

document.getElementById("btnHapusInvoice").onclick = () => {
  if (confirm("Hapus data invoice terakhir dari memori?")) {
    localStorage.removeItem("lastInvoice");
    document.getElementById("invTanggal").textContent = "-";
    document.getElementById("invNomor").textContent = "INV: -";
    document.getElementById("invKasir").textContent = "Kasir: -";
    document.getElementById("invItems").innerHTML = "";
    document.getElementById("invTotal").textContent = "Rp 0";
    document.getElementById("invUang").textContent = "Rp 0";
    document.getElementById("invKembali").textContent = "Rp 0";
    alert("Data invoice telah dibersihkan!");
  }
};

/* ====== MENU LOGIC ====== */
const listBarang = document.getElementById("listBarang");

function renderBarang(){
  listBarang.innerHTML="";
  daftarBarang.forEach(b=>{
    const div = document.createElement("div");
    div.className="card";
    div.innerHTML = `
      <h4>${b.nama}</h4>
      <div class="price">${formatRupiah(b.harga)}</div>
    `;
    listBarang.appendChild(div);
  });
}

function saveBarang(){ 
    localStorage.setItem(KEY_BARANG, JSON.stringify(daftarBarang)); 
}

document.getElementById("btnTambah").onclick = ()=>{
  const nama = document.getElementById("namaBarang").value.trim();
  const harga = +document.getElementById("hargaBarang").value;
  if(!nama || !harga) return alert("Lengkapi data");

  if(editId){
    const item = daftarBarang.find(x=>x.id===editId);
    item.nama = nama; item.harga = harga;
    editId = null;
    document.getElementById("btnBatalEdit").style.display="none";
  }else{
    daftarBarang.push({id:"b"+Date.now(), nama, harga});
  }
  saveBarang(); renderBarang(); renderKasir();
  document.getElementById("namaBarang").value="";
  document.getElementById("hargaBarang").value="";
};

/* ====== 🔥 FITUR EXPORT & IMPORT JSON 🔥 ====== */

// 1. Logika Export
document.getElementById("btnExport").onclick = () => {
  if (daftarBarang.length === 0) return alert("Tidak ada data untuk diekspor");
  
  const dataStr = JSON.stringify(daftarBarang, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `Data_Barang_XYZ_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// 2. Logika Import (Memicu klik input file)
document.getElementById("btnImport").onclick = () => {
  document.getElementById("fileImport").click();
};

// 3. Logika Membaca File JSON
document.getElementById("fileImport").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsedData = JSON.parse(event.target.result);
      if (Array.isArray(parsedData)) {
        if (confirm("Data saat ini akan ditimpa dengan data dari file. Lanjutkan?")) {
          daftarBarang = parsedData;
          saveBarang(); // Simpan ke LocalStorage
          renderBarang(); // Refresh UI Menu
          renderKasir(); // Refresh UI Kasir
          alert("✅ Data berhasil di-import!");
        }
      } else {
        alert("❌ Format file tidak valid!");
      }
    } catch (err) {
      alert("❌ Gagal membaca file JSON!");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // Reset agar bisa pilih file yang sama lagi
};

/* ====== KASIR & SEARCH ====== */
function filterKasir(){ renderKasir(); }
function renderKasir(){
  const grid = document.getElementById("gridKasir");
  const query = document.getElementById("searchKasir").value.toLowerCase();
  grid.innerHTML="";
  daftarBarang.filter(b=>b.nama.toLowerCase().includes(query)).forEach(b=>{
    const qty = cart[b.id]?.qty || 0;
    const div = document.createElement("div");
    div.className="card";
    div.innerHTML = `${qty>0?`<div class="badge-qty">${qty}</div>`:''}<h4>${b.nama}</h4><div class="price">${formatRupiah(b.harga)}</div>`;
    div.onclick = ()=>{
      cart[b.id] = cart[b.id] || {nama:b.nama, harga:b.harga, qty:0};
      cart[b.id].qty++; renderCart(); renderKasir();
    };
    grid.appendChild(div);
  });
}

function renderCart(){
  const tb = document.getElementById("tbodyCart");
  tb.innerHTML=""; let total=0;
  Object.values(cart).forEach(it=>{
    const sub = it.harga*it.qty; total+=sub;
    tb.innerHTML+=`<tr><td>${it.nama}</td><td>${formatRupiah(it.harga)}</td><td>${it.qty}</td><td>${formatRupiah(sub)}</td></tr>`;
  });
  document.getElementById("totalAkhir").textContent = formatRupiah(total);
  const bayar = +document.getElementById("uangPembeli").value || 0;
  document.getElementById("kembalian").textContent = "Kembalian: "+formatRupiah(bayar-total);
}

document.getElementById("uangPembeli").oninput = renderCart;
document.getElementById("btnClearCart").onclick = ()=>{ if(confirm("Hapus keranjang?")){ cart={}; renderCart(); renderKasir(); } };

/* ====== INVOICE LOGIC ====== */
document.getElementById("btnBuatInvoice").onclick = () => {
  const items = Object.values(cart);
  if (!items.length) return alert("Keranjang kosong");

  const total = items.reduce((a, b) => a + (b.harga * b.qty), 0);
  const uang = +document.getElementById("uangPembeli").value || 0;
  
  // Ambil input kasir
  const namaKasir = document.getElementById("namaKasir").value || "Kasir1";
  
  // LOGIKA FORMAT TANGGAL YYYYMMDD-HHMM
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  
  const timestamp = `${yyyy}${mm}${dd}-${hh}${min}`;
  
  // Gabungkan format: KYZ-{kasir}-YYYYMMDD-HHMM
  // Menghapus spasi pada nama kasir agar format nomor invoice tetap rapi
  const cleanKasir = namaKasir.replace(/\s+/g, ''); 
  const nomorInvoice = `KYZ-${cleanKasir}-${timestamp}`;

  const inv = {
    tanggal: now.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }),
    jam: now.toLocaleTimeString("id-ID"),
    kasir: namaKasir,
    nomor: nomorInvoice,
    items,
    total,
    uang,
    kembali: uang - total
  };

  localStorage.setItem("lastInvoice", JSON.stringify(inv));
  showTab("invoice");
  renderInvoice();
};

function renderInvoice(){
  const data = JSON.parse(localStorage.getItem("lastInvoice") || "null");
  if(!data) return;
  document.getElementById("invTanggal").textContent = data.tanggal + " " + data.jam;
  document.getElementById("invNomor").textContent = "INV: " + data.nomor;
  document.getElementById("invKasir").textContent = "Kasir: " + data.kasir;
  document.getElementById("invItems").innerHTML = data.items.map(i=>
    `<tr><td>${i.nama}</td><td>${i.qty}</td><td>${formatRupiah(i.harga)}</td><td>${formatRupiah(i.harga*i.qty)}</td></tr>`
  ).join("");
  document.getElementById("invTotal").textContent = formatRupiah(data.total);
  document.getElementById("invUang").textContent = formatRupiah(data.uang);
  document.getElementById("invKembali").textContent = formatRupiah(data.kembali);
}

function exportToImage() {
  const element = document.getElementById('bingContainer');
  html2canvas(element, { useCORS: true, scale: 3 }).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = "Invoice_" + Date.now() + ".png";
    link.click();
  });
}

// Init
renderBarang();
renderKasir();