/* ====== STATE & STORAGE ====== */
let daftarBarang = JSON.parse(localStorage.getItem("daftarBarang") || "[]");
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
    // 1. Hapus dari penyimpanan permanen (LocalStorage)
    localStorage.removeItem("lastInvoice");
    
    // 2. Kosongkan tampilan di layar secara instan
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
/* ====== MENU BARANG (ADD + EDIT + DELETE) ====== */
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
function saveBarang(){ localStorage.setItem(KEY_BARANG, JSON.stringify(daftarBarang)); }

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
document.getElementById("btnBatalEdit").onclick = ()=>{
  editId=null;
  document.getElementById("btnBatalEdit").style.display="none";
  document.getElementById("namaBarang").value="";
  document.getElementById("hargaBarang").value="";
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
document.getElementById("btnBuatInvoice").onclick = ()=>{
  const items = Object.values(cart);
  if(!items.length) return alert("Keranjang kosong");
  const total = items.reduce((a,b)=>a+(b.harga*b.qty),0);
  const uang = +document.getElementById("uangPembeli").value || 0;
  const inv = {
    tanggal: new Date().toLocaleDateString("id-ID", {day:'2-digit', month:'short', year:'numeric'}),
    jam: new Date().toLocaleTimeString("id-ID"),
    kasir: document.getElementById("namaKasir").value || "Kasir 1",
    nomor: "XYZ-" + Date.now().toString().slice(-6),
    items, total, uang, kembali: uang-total
  };
  localStorage.setItem("lastInvoice", JSON.stringify(inv));
  showTab("invoice"); renderInvoice();
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