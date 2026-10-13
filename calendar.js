import { aylar, gunIsimleri } from './data.js';
import { planlar, mevcutAy, mevcutYil, seciliTakvimGun, setMevcutAy, setMevcutYil, setSeciliTakvimGun } from './state.js';
import { kaydetPlanlar, tarihYaz, tarihGoster, bugun, tarihOku, tarihBicimle } from './storage.js';

const takvimGrid = document.getElementById("takvimGrid");
const takvimAyYil = document.getElementById("takvimAyYil");
const oncekiAyBtn = document.getElementById("oncekiAyBtn");
const sonrakiAyBtn = document.getElementById("sonrakiAyBtn");

const planTarihMetin = document.getElementById("planTarihMetin");
const planTarihSec = document.getElementById("planTarihSec");
const planTakvimBtn = document.getElementById("planTakvimBtn");

const planMetinInput = document.getElementById("planMetinInput");
const planEkleBtn = document.getElementById("planEkleBtn");

const planModal = document.getElementById("planModal");
const planModalTarih = document.getElementById("planModalTarih");
const modalPlanListe = document.getElementById("modalPlanListe");
const modalPlanInput = document.getElementById("modalPlanInput");
const modalPlanEkleBtn = document.getElementById("modalPlanEkleBtn");
const modalKapatBtn = document.getElementById("modalKapatBtn");

function getGunAdi(dt) {
  let gIndex = dt.getDay() - 1;
  if (gIndex === -1) gIndex = 6;
  return gunIsimleri[gIndex];
}

export function takvimCiz() {
  takvimGrid.innerHTML = "";
  takvimAyYil.textContent = aylar[mevcutAy] + " " + mevcutYil;

  const ilkGun = new Date(mevcutYil, mevcutAy, 1);
  const sonGun = new Date(mevcutYil, mevcutAy + 1, 0);

  let baslangicGunu = ilkGun.getDay() - 1;
  if (baslangicGunu === -1) baslangicGunu = 6;

  const toplamGun = sonGun.getDate();

  const oncekiAySonGun = new Date(mevcutYil, mevcutAy, 0).getDate();
  for (let i = baslangicGunu - 1; i >= 0; i--) {
    const gunSayisi = oncekiAySonGun - i;
    const dt = new Date(mevcutYil, mevcutAy - 1, gunSayisi);
    
    const gunDiv = document.createElement("div");
    gunDiv.className = "takvim-gun farklı-ay";

    const ust = document.createElement("div");
    ust.className = "takvim-gun-ust";

    const no = document.createElement("span");
    no.className = "takvim-gun-no";
    no.textContent = gunSayisi;

    const adi = document.createElement("span");
    adi.className = "takvim-gun-adi";
    adi.textContent = getGunAdi(dt);

    ust.append(no, adi);
    gunDiv.appendChild(ust);
    takvimGrid.appendChild(gunDiv);
  }

  const bugunStr = tarihYaz(bugun());
  for (let d = 1; d <= toplamGun; d++) {
    const dt = new Date(mevcutYil, mevcutAy, d);
    const gunDiv = document.createElement("div");
    gunDiv.className = "takvim-gun";

    const suAnkiTarih = tarihYaz(dt);
    if (suAnkiTarih === bugunStr) gunDiv.classList.add("bugun");

    const ust = document.createElement("div");
    ust.className = "takvim-gun-ust";

    const no = document.createElement("span");
    no.className = "takvim-gun-no";
    no.textContent = d;

    const adi = document.createElement("span");
    adi.className = "takvim-gun-adi";
    adi.textContent = getGunAdi(dt);

    ust.append(no, adi);
    gunDiv.appendChild(ust);

    const gunuPlanlari = planlar.filter((p) => p.tarih === suAnkiTarih);
    gunuPlanlari.forEach((p) => {
      const rozet = document.createElement("div");
      rozet.className = "takvim-plan-rozeti";
      rozet.textContent = p.metin;
      gunDiv.appendChild(rozet);
    });

    gunDiv.addEventListener("click", () => gunDetayAc(suAnkiTarih));

    takvimGrid.appendChild(gunDiv);
  }
}

oncekiAyBtn.addEventListener("click", () => {
  let yeniAy = mevcutAy - 1;
  let yeniYil = mevcutYil;
  if (yeniAy < 0) {
    yeniAy = 11;
    yeniYil--;
  }
  setMevcutAy(yeniAy);
  setMevcutYil(yeniYil);
  takvimCiz();
});

sonrakiAyBtn.addEventListener("click", () => {
  let yeniAy = mevcutAy + 1;
  let yeniYil = mevcutYil;
  if (yeniAy > 11) {
    yeniAy = 0;
    yeniYil++;
  }
  setMevcutAy(yeniAy);
  setMevcutYil(yeniYil);
  takvimCiz();
});

planTarihMetin.addEventListener("input", () => {
  planTarihMetin.value = tarihBicimle(planTarihMetin.value);
});

planTakvimBtn.addEventListener("click", () => {
  if (typeof planTarihSec.showPicker === "function") planTarihSec.showPicker();
  else planTarihSec.click();
});

planTarihSec.addEventListener("change", () => {
  if (planTarihSec.value) planTarihMetin.value = tarihGoster(planTarihSec.value);
});

planEkleBtn.addEventListener("click", () => {
  const tarih = tarihOku(planTarihMetin.value);
  const metin = planMetinInput.value.trim();

  if (!tarih || !metin) {
    alert("Lütfen geçerli bir tarih (gg.aa.yyyy) yazın veya seçin ve plan metnini girin.");
    return;
  }

  planlar.push({ id: Date.now(), tarih, metin });
  kaydetPlanlar(planlar);
  planMetinInput.value = "";
  planTarihMetin.value = "";
  planTarihSec.value = "";
  takvimCiz();
});

function gunDetayAc(tarihStr) {
  setSeciliTakvimGun(tarihStr);
  planModalTarih.textContent = tarihGoster(tarihStr) + " Planları";
  planModalListele();
  planModal.classList.remove("gizli");
}

function planModalListele() {
  modalPlanListe.innerHTML = "";
  const gunuPlanlari = planlar.filter((p) => p.tarih === seciliTakvimGun);

  if (gunuPlanlari.length === 0) {
    modalPlanListe.innerHTML = "<p style='color:var(--soluk); font-size:13px;'>Henüz plan yok.</p>";
    return;
  }

  gunuPlanlari.forEach((p) => {
    const item = document.createElement("div");
    item.className = "modal-plan-item";

    const span = document.createElement("span");
    span.textContent = p.metin;

    const silBtn = document.createElement("button");
    silBtn.className = "sil";
    silBtn.textContent = "✕";
    silBtn.addEventListener("click", () => {
      const index = planlar.findIndex((x) => x.id === p.id);
      if (index !== -1) planlar.splice(index, 1);
      kaydetPlanlar(planlar);
      planModalListele();
      takvimCiz();
    });

    item.append(span, silBtn);
    modalPlanListe.appendChild(item);
  });
}

modalPlanEkleBtn.addEventListener("click", () => {
  const metin = modalPlanInput.value.trim();
  if (!metin) return;

  planlar.push({ id: Date.now(), tarih: seciliTakvimGun, metin });
  kaydetPlanlar(planlar);
  modalPlanInput.value = "";
  planModalListele();
  takvimCiz();
});

modalKapatBtn.addEventListener("click", () => planModal.classList.add("gizli"));