import { servisler } from './data.js';
import { abonelikler, seciliServis, seciliPaket, setSeciliServis, setSeciliPaket } from './state.js';
import { kaydet, fiyatYaz, ikon, tarihCoz, tarihYaz, tarihGoster, bugun, sonrakiAy, kalanGun } from './storage.js';

const ara = document.getElementById("ara");
const servisListe = document.getElementById("servisListe");
const paketlerEl = document.getElementById("paketler");
const paketBaslik = document.getElementById("paketBaslik");
const paketLink = document.getElementById("paketLink");
const secimOzet = document.getElementById("secimOzet");
const liste = document.getElementById("liste");
const toplamEl = document.getElementById("toplam");
const zilBtn = document.getElementById("zilBtn");
const zilPanel = document.getElementById("zilPanel");
const rozet = document.getElementById("rozet");

const analitikOzetGrid = document.getElementById("analitikOzetGrid");
const kategoriListe = document.getElementById("kategoriListe");
let kategoriChartInstance = null;

export function tarihleriGuncelle() {
  const b = bugun();
  abonelikler.forEach((a) => {
    let t = tarihCoz(a.tarih);
    while (t < b) t = sonrakiAy(t, a.gun);
    a.tarih = tarihYaz(t);
  });
  kaydet(abonelikler);
}

export function excelRaporuIndir() {
  if (abonelikler.length === 0) {
    alert("İndirilecek abonelik kaydı bulunamadı!");
    return;
  }
  let csv = "\uFEFFServis,Paket,Kategori,Ücret,Para Birimi,Yenileme Tarihi\n";
  abonelikler.forEach(a => {
    const servisDetay = servisler.find(s => s.ad === a.ad);
    const kat = servisDetay ? servisDetay.kategori : "Diğer";
    csv += `"${a.ad}","${a.paket}","${kat}",${a.ucret},"${a.para}","${a.tarih}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'abonelik_raporu_' + new Date().toISOString().slice(0, 10) + '.csv');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function pdfRaporuYazdir() {
  if (abonelikler.length === 0) {
    alert("Yazdırılacak abonelik kaydı bulunamadı!");
    return;
  }
  window.print();
}

export function analitigiGuncelle() {
  if (!analitikOzetGrid) return;

  const guncelUSD = 49.38;
  let tlToplam = 0;
  let usdToplam = 0;
  const kategoriHarcamalari = {};

  abonelikler.forEach((a) => {
    const servisDetay = servisler.find((s) => s.ad === a.ad);
    const kat = servisDetay ? servisDetay.kategori : "Diğer";
    
    let tlKarsilik = a.ucret;
    if (a.para === "USD") {
      usdToplam += a.ucret;
      tlKarsilik = a.ucret * guncelUSD;
    } else {
      tlToplam += a.ucret;
    }

    kategoriHarcamalari[kat] = (kategoriHarcamalari[kat] || 0) + tlKarsilik;
  });

  const genelAylikTL = tlToplam + (usdToplam * guncelUSD);
  const genelYillikTL = genelAylikTL * 12;

  analitikOzetGrid.innerHTML = `
    <div class="analitik-kutu">
      <small>Aktif Abonelik</small>
      <strong>${abonelikler.length} Adet</strong>
    </div>
    <div class="analitik-kutu">
      <small>TL Harcama</small>
      <strong>${fiyatYaz(tlToplam, "TRY")}</strong>
    </div>
    <div class="analitik-kutu">
      <small>USD Harcama</small>
      <strong>${fiyatYaz(usdToplam, "USD")}</strong>
    </div>
    <div class="analitik-kutu vurgu-kutu">
      <small>Tahmini Aylık Toplam</small>
      <strong>${fiyatYaz(genelAylikTL, "TRY")}</strong>
    </div>
    <div class="analitik-kutu">
      <small>Tahmini Yıllık Bütçe</small>
      <strong>${fiyatYaz(genelYillikTL, "TRY")}</strong>
    </div>
  `;

  const katEtiketler = Object.keys(kategoriHarcamalari);
  const katDegerler = Object.values(kategoriHarcamalari);

  kategoriListe.innerHTML = "";
  if (katEtiketler.length === 0) {
    kategoriListe.innerHTML = "<p style='color:var(--soluk); margin:0;'>Henüz abonelik eklenmedi.</p>";
  } else {
    katEtiketler.forEach((kat) => {
      const harcama = kategoriHarcamalari[kat];
      const yuzde = genelAylikTL > 0 ? ((harcama / genelAylikTL) * 100).toFixed(1) : 0;
      const div = document.createElement("div");
      div.className = "kategori-liste-item";
      div.innerHTML = `
        <span>${kat}</span>
        <strong>${fiyatYaz(harcama, "TRY")} (%${yuzde})</strong>
      `;
      kategoriListe.appendChild(div);
    });
  }

  const canvas = document.getElementById("kategoriGrafikCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (kategoriChartInstance) kategoriChartInstance.destroy();

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const renkler = ["#8A63FF", "#2b59c3", "#27ae60", "#e67e22", "#e74c3c", "#9b59b6", "#1abc9c"];

  kategoriChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: katEtiketler.length > 0 ? katEtiketler : ["Kayıt Yok"],
      datasets: [{
        data: katDegerler.length > 0 ? katDegerler : [1],
        backgroundColor: katEtiketler.length > 0 ? renkler.slice(0, katEtiketler.length) : [isDark ? "#382558" : "#dde1e8"],
        borderWidth: 2,
        borderColor: isDark ? "#24163B" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: isDark ? "#e8eaf3" : "#1c1f26",
            font: { size: 12, weight: "bold" }
          }
        }
      },
      cutout: "65%"
    }
  });
}

export function toplamYaz() {
  let tlToplam = 0;
  let usdToplam = 0;
  abonelikler.forEach((a) => {
    if (a.para === "USD") usdToplam += a.ucret;
    else tlToplam += a.ucret;
  });
  const parcalar = [];
  if (tlToplam > 0 || usdToplam === 0) parcalar.push(fiyatYaz(tlToplam, "TRY"));
  if (usdToplam > 0) parcalar.push(fiyatYaz(usdToplam, "USD"));

  analitigiGuncelle();
  return "Aylık toplam: " + parcalar.join(" + ");
}

export function servisListesiniDoldur(filtre) {
  servisListe.innerHTML = "";
  const f = filtre.toLocaleLowerCase("tr");
  servisler
    .filter((s) => s.ad.toLocaleLowerCase("tr").includes(f))
    .forEach((s) => {
      const li = document.createElement("li");
      if (s === seciliServis) li.classList.add("secili");
      const img = document.createElement("img");
      img.src = ikon(s.site);
      img.alt = "";
      const span = document.createElement("span");
      span.textContent = s.ad;
      li.append(img, span);
      li.addEventListener("click", () => servisSec(s));
      servisListe.appendChild(li);
    });
}

function servisSec(s) {
  if (s === seciliServis) return;
  setSeciliServis(s);
  setSeciliPaket(null);
  servisListesiniDoldur(ara.value);
  paketleriCiz();
  ozetiGuncelle();
}

export function paketleriCiz() {
  paketlerEl.innerHTML = "";

  if (!seciliServis) {
    paketBaslik.textContent = "Paketler";
    paketLink.classList.add("gizli");
    const p = document.createElement("p");
    p.className = "bos";
    p.textContent = "Soldan bir servis seç.";
    paketlerEl.appendChild(p);
    return;
  }

  paketBaslik.textContent = "Paketler: " + seciliServis.ad;
  paketLink.href = seciliServis.site;
  paketLink.classList.remove("gizli");

  seciliServis.paketler.forEach((paket) => {
    const kart = document.createElement("div");
    kart.className = "paket";

    const ad = document.createElement("strong");
    ad.textContent = paket.ad;
    const fiyat = document.createElement("div");
    fiyat.className = "fiyat";
    fiyat.textContent = fiyatYaz(paket.fiyat, paket.para);
    kart.append(ad, fiyat);

    kart.addEventListener("click", () => {
      setSeciliPaket(paket);
      paketlerEl.querySelectorAll(".paket").forEach((k) => k.classList.remove("secili"));
      kart.classList.add("secili");
      ozetiGuncelle();
    });

    paketlerEl.appendChild(kart);
  });
}

export function ozetiGuncelle() {
  if (!seciliServis || !seciliPaket) {
    secimOzet.textContent = "Henüz paket seçilmedi.";
    return;
  }
  secimOzet.textContent =
    seciliServis.ad + " / " + seciliPaket.ad + " / " + fiyatYaz(seciliPaket.fiyat, seciliPaket.para);
}

export function bildirimleriCiz() {
  const yaklasan = abonelikler.filter((a) => kalanGun(a.tarih) <= 7);
  zilPanel.innerHTML = "";

  if (yaklasan.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Yaklaşan yenileme yok.";
    zilPanel.appendChild(p);
    rozet.classList.add("gizli");
    return;
  }

  yaklasan.forEach((a) => {
    const p = document.createElement("p");
    const gun = kalanGun(a.tarih);
    p.textContent = a.ad + " (" + a.paket + "): " + (gun === 0 ? "bugün" : gun + " gün sonra") +
      " yenilenecek, " + fiyatYaz(a.ucret, a.para);
    zilPanel.appendChild(p);
  });

  rozet.textContent = yaklasan.length;
  rozet.classList.remove("gizli");
}

export function ciz() {
  liste.innerHTML = "";

  [...abonelikler]
    .sort((a, b) => tarihCoz(a.tarih) - tarihCoz(b.tarih))
    .forEach((a) => {
      const gun = kalanGun(a.tarih);
      const li = document.createElement("li");

      const img = document.createElement("img");
      img.src = ikon(a.site);
      img.alt = "";

      const bilgi = document.createElement("div");
      bilgi.className = "bilgi";
      const ad = document.createElement("strong");
      ad.textContent = a.ad + " / " + a.paket;
      const fiyat = document.createElement("small");
      fiyat.textContent = fiyatYaz(a.ucret, a.para) + " / ay";
      const alt = document.createElement("small");
      alt.textContent = "Yenileme: " + tarihGoster(a.tarih) + " (" + gun + " gün kaldı)";
      if (gun <= 7) alt.classList.add("yakin");
      bilgi.append(ad, fiyat, alt);

      const linkler = document.createElement("div");
      linkler.className = "linkler";
      const git = document.createElement("a");
      git.href = a.site;
      git.target = "_blank";
      git.rel = "noopener";
      git.textContent = "Uygulamaya git";
      const iptal = document.createElement("a");
      iptal.href = a.iptal;
      iptal.target = "_blank";
      iptal.rel = "noopener";
      iptal.textContent = "İptal et";
      linkler.append(git, iptal);

      const sil = document.createElement("button");
      sil.className = "sil";
      sil.textContent = "✕";
      sil.addEventListener("click", () => {
        const index = abonelikler.findIndex((x) => x.id === a.id);
        if (index !== -1) abonelikler.splice(index, 1);
        kaydet(abonelikler);
        ciz();
      });

      li.append(img, bilgi, linkler, sil);
      liste.appendChild(li);
    });

  toplamEl.textContent = toplamYaz();
  bildirimleriCiz();
}