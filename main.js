import { abonelikler, setSeciliServis, setSeciliPaket } from './state.js';
import { tarihOku, tarihBicimle, tarihGoster, kurlariGetir, grafikVerisiUret } from './storage.js';
import { servisListesiniDoldur, paketleriCiz, ozetiGuncelle, tarihleriGuncelle, ciz, excelRaporuIndir, pdfRaporuYazdir } from './subscriptions.js';
import { takvimCiz } from './calendar.js';
import { oyunuKur } from './typingGame.js';

const ara = document.getElementById("ara");
const tarihMetin = document.getElementById("tarihMetin");
const tarihSec = document.getElementById("tarihSec");
const takvimBtn = document.getElementById("takvimBtn");
const ekleBtn = document.getElementById("ekleBtn");
const zilBtn = document.getElementById("zilBtn");
const zilPanel = document.getElementById("zilPanel");
const temaBtn = document.getElementById("temaBtn");

const uyariModal = document.getElementById("uyariModal");
const uyariTamamBtn = document.getElementById("uyariTamamBtn");
const modulBtnler = document.querySelectorAll(".modul-btn");
const modulSayfalar = document.querySelectorAll(".modul-sayfa");
const geriDonBtn = document.getElementById("geriDonBtn");
const paketlerEl = document.getElementById("paketler");
const modulGecisBtnler = document.querySelectorAll(".modul-gecis-btn");

// Yedek ve Rapor
const yedekIndirBtn = document.getElementById("yedekIndirBtn");
const yedekYukleBtn = document.getElementById("yedekYukleBtn");
const dosyaSecInput = document.getElementById("dosyaSecInput");
const excelIndirBtn = document.getElementById("excelIndirBtn");
const pdfRaporBtn = document.getElementById("pdfRaporBtn");

// Canlı Kurlar
const kurGrid = document.getElementById("kurGrid");
const kurlariGuncelleBtn = document.getElementById("kurlariGuncelleBtn");

// PC Saat & Hava
const pcSaat = document.getElementById("pcSaat");
const pcTarih = document.getElementById("pcTarih");
const pcHava = document.getElementById("pcHava");
const pcKonum = document.getElementById("pcKonum");
const havaIkon = document.getElementById("havaIkon");

// Ana Sayfa Abonelik Özeti
const anaSayfaAbonelikOzet = document.getElementById("anaSayfaAbonelikOzet");

// Kur Detay Modalı
const kurDetayModal = document.getElementById("kurDetayModal");
const kurModalBaslik = document.getElementById("kurModalBaslik");
const kurModalKapatBtn = document.getElementById("kurModalKapatBtn");
const kurModalKapatAltBtn = document.getElementById("kurModalKapatAltBtn");
const degisimHaftalik = document.getElementById("degisimHaftalik");
const degisimAylik = document.getElementById("degisimAylik");
const degisimYillik = document.getElementById("degisimYillik");
const grafikPeriyotBtnler = document.querySelectorAll(".grafik-periyot-btn");

let aktifKurObjesi = null;
let aktifPeriyot = "haftalik";
let kurChartInstance = null;

/* Uyarı Modal */
if (!sessionStorage.getItem("uyariGosterildi")) {
  uyariModal.classList.remove("gizli");
}

uyariTamamBtn.addEventListener("click", () => {
  uyariModal.classList.add("gizli");
  sessionStorage.setItem("uyariGosterildi", "true");
});

/* Modül Geçişleri */
modulBtnler.forEach((btn) => {
  btn.addEventListener("click", () => {
    modulBtnler.forEach((b) => b.classList.remove("aktif"));
    modulSayfalar.forEach((s) => s.classList.add("gizli"));

    btn.classList.add("aktif");
    const hedefId = btn.getAttribute("data-target");
    const hedefSayfa = document.getElementById(hedefId);
    if (hedefSayfa) hedefSayfa.classList.remove("gizli");

    if (hedefId === "takvimModul") {
      takvimCiz();
    }
    if (hedefId === "anaSayfaModul") {
      anaSayfaAbonelikOzetiniGuncelle();
    }
    if (hedefId === "oyunModul") {
      setTimeout(() => oyunuKur(), 50); // DOM tam oturduktan sonra kelimeleri yükle
    }
  });
});

modulGecisBtnler.forEach((btn) => {
  btn.addEventListener("click", () => {
    const hedef = btn.getAttribute("data-hedef");
    const hedefBtn = document.querySelector(`.modul-btn[data-target="${hedef}"]`);
    if (hedefBtn) hedefBtn.click();
  });
});

geriDonBtn.addEventListener("click", () => {
  modulBtnler[0].click();
  setSeciliServis(null);
  setSeciliPaket(null);
  servisListesiniDoldur("");
  paketleriCiz();
  ozetiGuncelle();
});

/* PC Saat ve Hava Durumu */
function pcZamanGuncelle() {
  if (!pcSaat) return;
  const simdi = new Date();
  pcSaat.textContent = simdi.toLocaleTimeString("tr-TR");
  pcTarih.textContent = simdi.toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(pcZamanGuncelle, 1000);
pcZamanGuncelle();

if (navigator.geolocation && pcHava) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data && data.current_weather) {
        const sicaklik = data.current_weather.temperature;
        pcHava.textContent = `${sicaklik}°C (Anlık)`;
        pcKonum.textContent = "Cihaz Konumu Tespit Edildi";
        if (sicaklik > 25) havaIkon.textContent = "☀️";
        else if (sicaklik > 15) havaIkon.textContent = "🌤️";
        else havaIkon.textContent = "🌥️";
      }
    } catch (e) {
      pcHava.textContent = "22°C (Varsayılan)";
      pcKonum.textContent = "Türkiye Geneli";
    }
  }, () => {
    pcHava.textContent = "21°C (Parçalı Bulutlu)";
    pcKonum.textContent = "Konum İzni Verilmedi";
  });
} else {
  if (pcHava) {
    pcHava.textContent = "21°C";
    pcKonum.textContent = "Standart Mod";
  }
}

/* Ana Sayfa Abonelik Özeti */
export function anaSayfaAbonelikOzetiniGuncelle() {
  if (!anaSayfaAbonelikOzet) return;
  const guncelUSD = 49.38;
  let tlToplam = 0;
  let usdToplam = 0;

  abonelikler.forEach((a) => {
    if (a.para === "USD") usdToplam += a.ucret;
    else tlToplam += a.ucret;
  });

  const aylikToplamTL = tlToplam + (usdToplam * guncelUSD);

  anaSayfaAbonelikOzet.innerHTML = `
    <div class="analitik-kutu">
      <small>Aktif Abonelik</small>
      <strong>${abonelikler.length} Adet</strong>
    </div>
    <div class="analitik-kutu">
      <small>Aylık Toplam Maliyet</small>
      <strong>${aylikToplamTL.toLocaleString("tr-TR", {maximumFractionDigits: 2})} ₺</strong>
    </div>
    <div class="analitik-kutu">
      <small>Yıllık Tahmini Bütçe</small>
      <strong>${(aylikToplamTL * 12).toLocaleString("tr-TR", {maximumFractionDigits: 2})} ₺</strong>
    </div>
  `;
}

/* Rapor Olayları */
excelIndirBtn.addEventListener("click", excelRaporuIndir);
pdfRaporBtn.addEventListener("click", pdfRaporuYazdir);

/* Canlı Kurlar */
async function kurEkranaCiz() {
  if (!kurGrid) return;
  kurGrid.innerHTML = '<p style="color: var(--soluk); text-align: center; width: 100%; padding: 20px;">10 Varlık kurları güncelleniyor...</p>';
  
  const aktifKurVerisi = await kurlariGetir();
  kurGrid.innerHTML = "";

  Object.values(aktifKurVerisi).forEach((kur) => {
    const kart = document.createElement("div");
    kart.className = "kur-karti";

    const baslik = document.createElement("div");
    baslik.className = "kur-baslik";
    baslik.innerHTML = `<span>${kur.sembol}</span> <span>${kur.ad}</span>`;

    const alisDetay = document.createElement("div");
    alisDetay.className = "kur-detay";
    alisDetay.innerHTML = `<span>Alış:</span> <span class="kur-deger">${kur.alis} ₺</span>`;

    const satisDetay = document.createElement("div");
    satisDetay.className = "kur-detay";
    satisDetay.innerHTML = `<span>Satış:</span> <span class="kur-deger">${kur.satis} ₺</span>`;

    kart.append(baslik, alisDetay, satisDetay);
    kart.addEventListener("click", () => kurDetayAc(kur));
    kurGrid.appendChild(kart);
  });
}

function kurDetayAc(kur) {
  aktifKurObjesi = kur;
  kurModalBaslik.textContent = kur.sembol + " " + kur.ad + " Detayı";
  
  const hVeri = grafikVerisiUret(kur.satis, "haftalik");
  const aVeri = grafikVerisiUret(kur.satis, "aylik");
  const yVeri = grafikVerisiUret(kur.satis, "yillik");

  degisimHaftalik.textContent = hVeri.farkYuzde;
  degisimHaftalik.style.color = hVeri.farkYuzde.startsWith("+") ? "#27ae60" : "#c0392b";

  degisimAylik.textContent = aVeri.farkYuzde;
  degisimAylik.style.color = aVeri.farkYuzde.startsWith("+") ? "#27ae60" : "#c0392b";

  degisimYillik.textContent = yVeri.farkYuzde;
  degisimYillik.style.color = yVeri.farkYuzde.startsWith("+") ? "#27ae60" : "#c0392b";

  kurGrafikCiz(aktifPeriyot);
  kurDetayModal.classList.remove("gizli");
}

function kurGrafikCiz(periyot) {
  aktifPeriyot = periyot;
  const veriSeti = grafikVerisiUret(aktifKurObjesi.satis, periyot);

  const ctx = document.getElementById("kurGrafikCanvas").getContext("2d");
  if (kurChartInstance) kurChartInstance.destroy();

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const renk = isDark ? "#8A63FF" : "#2b59c3";

  kurChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: veriSeti.etiketler,
      datasets: [{
        label: aktifKurObjesi.ad + " Satış (₺)",
        data: veriSeti.veriler,
        borderColor: renk,
        backgroundColor: renk + "22",
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? "#9aa1b8" : "#5b6270", font: { size: 11 } } },
        y: { ticks: { color: isDark ? "#9aa1b8" : "#5b6270", font: { size: 11 } } }
      }
    }
  });
}

grafikPeriyotBtnler.forEach((btn) => {
  btn.addEventListener("click", () => {
    grafikPeriyotBtnler.forEach((b) => {
      b.style.background = "var(--bg)";
      b.style.color = "var(--yazi)";
    });
    btn.style.background = "var(--vurgu)";
    btn.style.color = "#fff";
    kurGrafikCiz(btn.getAttribute("data-periyot"));
  });
});

kurModalKapatBtn.addEventListener("click", () => kurDetayModal.classList.add("gizli"));
kurModalKapatAltBtn.addEventListener("click", () => kurDetayModal.classList.add("gizli"));
kurlariGuncelleBtn.addEventListener("click", kurEkranaCiz);

/* Yedek İndir */
let sonIndirmeZamani = 0;
yedekIndirBtn.addEventListener("click", () => {
  const simdi = Date.now();
  if (simdi - sonIndirmeZamani < 3000) return;

  const aboneliklerVeri = JSON.parse(localStorage.getItem("abonelikler2")) || [];
  const planlarVeri = JSON.parse(localStorage.getItem("planlar")) || [];

  if (aboneliklerVeri.length === 0 && planlarVeri.length === 0) {
    alert("Yedeklenecek kayıt veya plan bulunamadı!");
    return;
  }

  sonIndirmeZamani = simdi;
  yedekIndirBtn.disabled = true;
  yedekIndirBtn.style.opacity = "0.5";

  setTimeout(() => {
    yedekIndirBtn.disabled = false;
    yedekIndirBtn.style.opacity = "1";
  }, 3000);

  const veri = { abonelikler: aboneliklerVeri, planlar: planlarVeri };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(veri, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "abonelik_plan_yedek_" + new Date().toISOString().slice(0, 10) + ".json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

yedekYukleBtn.addEventListener("click", () => dosyaSecInput.click());

dosyaSecInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const yuklenenVeri = JSON.parse(event.target.result);
      if (yuklenenVeri.abonelikler) {
        localStorage.setItem("abonelikler2", JSON.stringify(yuklenenVeri.abonelikler));
        if (yuklenenVeri.planlar) localStorage.setItem("planlar", JSON.stringify(yuklenenVeri.planlar));
        alert("Yedek başarıyla yüklendi! Sayfa yenileniyor.");
        location.reload();
      } else {
        alert("Geçersiz yedek dosyası formatı!");
      }
    } catch (err) {
      alert("Dosya okunurken bir hata oluştu.");
    }
  };
  reader.readAsText(file);
});

/* Tema */
function temaUygula(tema) {
  document.documentElement.setAttribute("data-theme", tema);
}

const kayitliTema = localStorage.getItem("tema");
const saat = new Date().getHours();
temaUygula(kayitliTema || (saat >= 6 && saat < 19 ? "light" : "dark"));

temaBtn.addEventListener("click", () => {
  const yeni = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  temaUygula(yeni);
  localStorage.setItem("tema", yeni);
  ciz();
});

/* Olaylar ve Başlangıç */
ara.addEventListener("input", () => servisListesiniDoldur(ara.value));
zilBtn.addEventListener("click", () => zilPanel.classList.toggle("gizli"));

document.addEventListener("click", (e) => {
  if (!e.target.closest(".bildirim")) zilPanel.classList.add("gizli");
});

tarihMetin.addEventListener("input", () => {
  tarihMetin.value = tarihBicimle(tarihMetin.value);
});

takvimBtn.addEventListener("click", () => {
  if (typeof tarihSec.showPicker === "function") tarihSec.showPicker();
  else tarihSec.click();
});

tarihSec.addEventListener("change", () => {
  if (tarihSec.value) tarihMetin.value = tarihGoster(tarihSec.value);
});

ekleBtn.addEventListener("click", () => {
  import('./state.js').then(({ seciliServis, seciliPaket }) => {
    if (!seciliServis || !seciliPaket) {
      alert("Önce bir servis ve paket seç.");
      return;
    }

    const tarih = tarihOku(tarihMetin.value);
    if (!tarih) {
      alert("Yenileme tarihini gg.aa.yyyy şeklinde yaz ya da takvimden seç.");
      return;
    }

    abonelikler.push({
      id: Date.now(),
      ad: seciliServis.ad,
      paket: seciliPaket.ad,
      ucret: seciliPaket.fiyat,
      para: seciliPaket.para || "TRY",
      site: seciliServis.site,
      iptal: seciliServis.iptal,
      tarih: tarih,
      gun: new Date(tarih).getDate(),
    });

    tarihleriGuncelle();
    ciz();
    anaSayfaAbonelikOzetiniGuncelle();

    tarihMetin.value = "";
    tarihSec.value = "";
    setSeciliPaket(null);
    paketlerEl.querySelectorAll(".paket.secili").forEach((k) => k.classList.remove("secili"));
    ozetiGuncelle();
  });
});

/* Başlangıç */
servisListesiniDoldur("");
paketleriCiz();
tarihleriGuncelle();
ciz();
kurEkranaCiz();
anaSayfaAbonelikOzetiniGuncelle();
oyunuKur(); // Sayfa açıldığında oyun kelimelerini hazırla