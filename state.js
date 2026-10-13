export let abonelikler = JSON.parse(localStorage.getItem("abonelikler2")) || [];
export let planlar = JSON.parse(localStorage.getItem("planlar")) || [];
export let seciliServis = null;
export let seciliPaket = null;
export let bugunTarih = new Date();
export let mevcutAy = bugunTarih.getMonth();
export let mevcutYil = bugunTarih.getFullYear();
export let seciliTakvimGun = null;

export function setSeciliServis(val) { seciliServis = val; }
export function setSeciliPaket(val) { seciliPaket = val; }
export function setMevcutAy(val) { mevcutAy = val; }
export function setMevcutYil(val) { mevcutYil = val; }
export function setSeciliTakvimGun(val) { seciliTakvimGun = val; }