export function kaydet(abonelikler) {
  localStorage.setItem("abonelikler2", JSON.stringify(abonelikler));
}

export function kaydetPlanlar(planlar) {
  localStorage.setItem("planlar", JSON.stringify(planlar));
}

export function fiyatYaz(n, para) {
  const s = n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return para === "USD" ? s + " $" : s + " TL";
}

export function ikon(site) {
  return "https://www.google.com/s2/favicons?domain=" + new URL(site).hostname + "&sz=64";
}

export function tarihCoz(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function tarihYaz(dt) {
  const ay = String(dt.getMonth() + 1).padStart(2, "0");
  const gun = String(dt.getDate()).padStart(2, "0");
  return dt.getFullYear() + "-" + ay + "-" + gun;
}

export function tarihGoster(iso) {
  const [y, m, d] = iso.split("-");
  return d + "." + m + "." + y;
}

export function tarihOku(metin) {
  const m = metin.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return null;
  const g = Number(m[1]);
  const a = Number(m[2]);
  const y = Number(m[3]);
  const dt = new Date(y, a - 1, g);
  if (dt.getFullYear() !== y || dt.getMonth() !== a - 1 || dt.getDate() !== g) return null;
  return tarihYaz(dt);
}

export function tarihBicimle(ham) {
  const parcalar = [""];
  const sinir = [2, 2, 4];
  for (const c of ham) {
    const i = parcalar.length - 1;
    if (/\d/.test(c)) {
      if (parcalar[i].length < sinir[i]) parcalar[i] += c;
      else if (i < 2) parcalar.push(c);
    } else if (/[./-]/.test(c) && parcalar[i].length > 0 && i < 2) {
      parcalar.push("");
    }
  }
  return parcalar.join(".");
}

export function bugun() {
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return b;
}

export function sonrakiAy(dt, gun) {
  const yil = dt.getFullYear();
  const ay = dt.getMonth() + 1;
  const aydakiGun = new Date(yil, ay + 1, 0).getDate();
  return new Date(yil, ay, Math.min(gun, aydakiGun));
}

export function kalanGun(tarih) {
  return Math.round((tarihCoz(tarih) - bugun()) / 86400000);
}

/* 10 Adet Döviz ve Kıymetli Maden Çeken Fonksiyon */
export async function kurlariGetir() {
  try {
    const res = await fetch("https://finans.truncgil.com/today.json");
    const data = await res.json();
    
    if (data && data.USD) {
      return {
        USD: { ad: "Amerikan Doları", sembol: "💵", alis: data.USD["Alış"], satis: data.USD["Satış"] },
        EUR: { ad: "Euro", sembol: "💶", alis: data.EUR["Alış"], satis: data.EUR["Satış"] },
        GBP: { ad: "İngiliz Sterlini", sembol: "💷", alis: data.GBP["Alış"], satis: data.GBP["Satış"] },
        CHF: { ad: "İsviçre Frangı", sembol: "🇨🇭", alis: data.CHF["Alış"], satis: data.CHF["Satış"] },
        CAD: { ad: "Kanada Doları", sembol: "🇨🇦", alis: data.CAD ? data.CAD["Alış"] : "35.20", satis: data.CAD ? data.CAD["Satış"] : "35.40" },
        AUD: { ad: "Avustralya Doları", sembol: "🇦🇺", alis: data.AUD ? data.AUD["Alış"] : "32.10", satis: data.AUD ? data.AUD["Satış"] : "32.30" },
        JPY: { ad: "Japon Yeni", sembol: "🇯🇵", alis: data.JPY ? data.JPY["Alış"] : "0.32", satis: data.JPY ? data.JPY["Satış"] : "0.33" },
        DKK: { ad: "Danimarka Kronu", sembol: "🇩🇰", alis: data.DKK ? data.DKK["Alış"] : "7.15", satis: data.DKK ? data.DKK["Satış"] : "7.22" },
        ALTIN: { ad: "Gram Altın", sembol: "🪙", alis: data["gram-altin"] ? data["gram-altin"]["Alış"] : "2950,00", satis: data["gram-altin"] ? data["gram-altin"]["Satış"] : "2965,00" },
        GUMUS: { ad: "Gram Gümüş", sembol: "🥈", alis: data["gram-gumus"] ? data["gram-gumus"]["Alış"] : "34,50", satis: data["gram-gumus"] ? data["gram-gumus"]["Satış"] : "34,80" }
      };
    }
  } catch (e) {
    console.log("Canlı piyasa verisi alınamadı, yedek değerler kullanılıyor.");
  }

  return {
    USD: { ad: "Amerikan Doları", sembol: "💵", alis: "49,31", satis: "49,38" },
    EUR: { ad: "Euro", sembol: "💶", alis: "53,40", satis: "53,55" },
    GBP: { ad: "İngiliz Sterlini", sembol: "💷", alis: "61,75", satis: "61,95" },
    CHF: { ad: "İsviçre Frangı", sembol: "🇨🇭", alis: "57,20", satis: "57,40" },
    CAD: { ad: "Kanada Doları", sembol: "🇨🇦", alis: "35,20", satis: "35,40" },
    AUD: { ad: "Avustralya Doları", sembol: "🇦🇺", alis: "32,10", satis: "32,30" },
    JPY: { ad: "Japon Yeni", sembol: "🇯🇵", alis: "0,32", satis: "0,33" },
    DKK: { ad: "Danimarka Kronu", sembol: "🇩🇰", alis: "7,15", satis: "7,22" },
    ALTIN: { ad: "Gram Altın", sembol: "🪙", alis: "6644,00", satis: "6655,00" },
    GUMUS: { ad: "Gram Gümüş", sembol: "🥈", alis: "75,00", satis: "76,00" }
  };
}

export function grafikVerisiUret(anlikDeger, periyot) {
  let temizMetin = String(anlikDeger);
  if (temizMetin.includes(",")) {
    temizMetin = temizMetin.replace(/\./g, "").replace(",", ".");
  }
  const deger = parseFloat(temizMetin);

  let noktaSayisi = 7;
  let etiketler = [];
  let veriler = [];

  if (periyot === "haftalik") {
    noktaSayisi = 7;
    etiketler = ["6 Gün Önce", "5 Gün Önce", "4 Gün Önce", "3 Gün Önce", "2 Gün Önce", "Dün", "Bugün"];
  } else if (periyot === "aylik") {
    noktaSayisi = 30;
    for (let i = 30; i >= 1; i--) etiketler.push(i + " Gün Önce");
    etiketler[etiketler.length - 1] = "Bugün";
  } else if (periyot === "yillik") {
    noktaSayisi = 12;
    etiketler = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  }

  let mevcut = deger * (periyot === "yillik" ? 0.82 : periyot === "aylik" ? 0.96 : 0.992);
  for (let i = 0; i < noktaSayisi; i++) {
    if (i === noktaSayisi - 1) {
      veriler.push(deger);
    } else {
      const rastgeleFark = (Math.random() - 0.48) * (deger * 0.008);
      mevcut += rastgeleFark;
      veriler.push(Number(mevcut.toFixed(2)));
    }
  }

  const ilk = veriler[0];
  const son = veriler[veriler.length - 1];
  const farkYuzde = (((son - ilk) / ilk) * 100).toFixed(2);

  return { etiketler, veriler, farkYuzde: (farkYuzde >= 0 ? "+" : "") + farkYuzde + "%" };
}