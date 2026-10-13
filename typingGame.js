/* 10FastFingers Tarzı Türkçe Klavye Hız Testi Motoru */

// Sadece 4 ile 10 harf arasındaki Türkçe kelimeler
const turkceKelimeler = [
  "kitap", "bilgisayar", "yazılım", "internet", "telefon", "ekran", "klavye",
  "donanım", "sistem", "sunucu", "güvenlik", "mühendis", "tasarım", "arayüz",
  "değişken", "bellek", "işlemci", "tarayıcı", "makine", "öğrenme", "otomasyon",
  "proje", "yönetim", "analiz", "rapor", "birlikte", "gelecek", "başarı",
  "çalışma", "şirket", "toplantı", "çözüm", "üretim", "kalite", "kontrol",
  "iletişim", "kullanıcı", "deneyim", "muazzam", "harika", "bilgi", "öğrenmek",
  "etkili", "hızlı", "doğru", "yanlış", "süreç", "arkadaş", "kitaplar",
  "kahve", "sabah", "akşam", "zaman", "dönem", "geçmiş", "hayatımız",
  "dünya", "türkiye", "öğrenci", "akademik", "araştırma", "bilimsel", "teknoloji",
  "inovasyon", "elektrik", "finans", "ekonomi", "yatırım", "ticaret", "piyasa",
  "döviz", "bütçe", "kazanç", "maliyet", "ödeme", "abonelik", "yağmur",
  "fırtına", "sıcaklık", "soğuk", "mevsim", "yaprak", "pencere", "sandalye",
  "düşünce", "kelime", "cümle", "sözcük", "kalem", "defter", "sınav",
  "başlangıç", "gözlem", "duygu", "mantık", "sorumluluk", "gelişim", "değişim"
];

let aktifKelimeler = [];
let kelimeIndex = 0;
let dogruSayisi = 0;
let yanlisSayisi = 0;
let kalanSure = 60;
let timer = null;
let oyunBasladi = false;

const kelimeKutusu = document.getElementById("kelimeKutusu");
const oyunInput = document.getElementById("oyunInput");
const oyunSure = document.getElementById("oyunSure");
const oyunDkm = document.getElementById("oyunDkm");
const oyunSkor = document.getElementById("oyunSkor");
const oyunBaslatBtn = document.getElementById("oyunBaslatBtn");

const oyunSonucModal = document.getElementById("oyunSonucModal");
const modalDkm = document.getElementById("modalDkm");
const modalDogruluk = document.getElementById("modalDogruluk");
const modalDogruSayi = document.getElementById("modalDogruSayi");
const modalYanlisSayi = document.getElementById("modalYanlisSayi");
const oyunTekrarBtn = document.getElementById("oyunTekrarBtn");

export function oyunuKur() {
  if (!kelimeKutusu || !oyunInput) return;
  
  clearInterval(timer);
  oyunBasladi = false;
  kalanSure = 60;
  kelimeIndex = 0;
  dogruSayisi = 0;
  yanlisSayisi = 0;

  oyunSure.textContent = "60s";
  oyunDkm.textContent = "0";
  oyunSkor.textContent = "0 / 0";
  oyunInput.value = "";
  oyunInput.disabled = false;
  oyunSonucModal.classList.add("gizli");

  // Rastgele 180 Kelime Oluştur
  aktifKelimeler = [];
  for (let i = 0; i < 180; i++) {
    const r = Math.floor(Math.random() * turkceKelimeler.length);
    aktifKelimeler.push(turkceKelimeler[r]);
  }

  kelimeEkranaCiz();
  oyunInput.focus();
}

function kelimeEkranaCiz() {
  kelimeKutusu.innerHTML = "";
  aktifKelimeler.forEach((w, index) => {
    const span = document.createElement("span");
    span.className = "oyun-kelime";
    if (index === 0) span.classList.add("aktif");
    span.textContent = w;
    kelimeKutusu.appendChild(span);
  });
  kelimeKutusu.scrollTop = 0;
}

function oyunuBaslat() {
  if (oyunBasladi) return;
  oyunBasladi = true;

  timer = setInterval(() => {
    kalanSure--;
    oyunSure.textContent = kalanSure + "s";

    if (kalanSure <= 0) {
      oyunuBitir();
    }
  }, 1000);
}

function oyunuBitir() {
  clearInterval(timer);
  oyunInput.disabled = true;
  oyunBasladi = false;

  const toplamGiris = dogruSayisi + yanlisSayisi;
  const dkm = dogruSayisi;
  const dogruluk = toplamGiris > 0 ? Math.round((dogruSayisi / toplamGiris) * 100) : 0;

  modalDkm.textContent = dkm + " DKM";
  modalDogruluk.textContent = "%" + dogruluk;
  modalDogruSayi.textContent = dogruSayisi;
  modalYanlisSayi.textContent = yanlisSayisi;

  oyunSonucModal.classList.remove("gizli");
}

if (oyunInput) {
  const aktifSayfa = document.getElementById("oyunModul");
  if (aktifSayfa) {
    aktifSayfa.addEventListener("click", () => {
      if (!oyunInput.disabled) oyunInput.focus();
    });
  }

  oyunInput.addEventListener("keydown", (e) => {
    if (!oyunBasladi && e.key.length === 1) {
      oyunuBaslat();
    }

    const kelimeSpans = kelimeKutusu.querySelectorAll(".oyun-kelime");
    if (kelimeIndex >= kelimeSpans.length) return;

    const mevcutSpan = kelimeSpans[kelimeIndex];
    const hedefKelime = aktifKelimeler[kelimeIndex];

    if (e.key === " ") {
      e.preventDefault();
      const girilen = oyunInput.value.trim();
      
      if (girilen === "") return;

      if (girilen === hedefKelime) {
        mevcutSpan.classList.remove("aktif", "yanlis");
        mevcutSpan.classList.add("dogru");
        dogruSayisi++;
      } else {
        mevcutSpan.classList.remove("aktif", "dogru");
        mevcutSpan.classList.add("yanlis");
        yanlisSayisi++;
      }

      kelimeIndex++;
      oyunInput.value = "";

      if (kelimeIndex < kelimeSpans.length) {
        const yeniSpan = kelimeSpans[kelimeIndex];
        yeniSpan.classList.add("aktif");
        
        if (yeniSpan.offsetTop > kelimeKutusu.scrollTop + 70) {
          kelimeKutusu.scrollTop += 48;
        }
      } else {
        oyunuBitir();
      }

      oyunDkm.textContent = dogruSayisi;
      oyunSkor.textContent = `${dogruSayisi} / ${yanlisSayisi}`;
    }
  });

  oyunInput.addEventListener("input", () => {
    const kelimeSpans = kelimeKutusu.querySelectorAll(".oyun-kelime");
    if (kelimeIndex >= kelimeSpans.length) return;

    const mevcutSpan = kelimeSpans[kelimeIndex];
    const girilen = oyunInput.value.trim();
    const hedefKelime = aktifKelimeler[kelimeIndex];

    if (hedefKelime.startsWith(girilen)) {
      mevcutSpan.style.color = "var(--vurgu)";
    } else {
      mevcutSpan.style.color = "#c0392b";
    }
  });
}

if (oyunBaslatBtn) oyunBaslatBtn.addEventListener("click", oyunuKur);
if (oyunTekrarBtn) {
  oyunTekrarBtn.addEventListener("click", () => {
    oyunuKur();
  });
}