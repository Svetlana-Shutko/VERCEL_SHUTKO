"use strict";

/* ===== Данные ===== */
const TRACKS = [
  "Fight Back",
  "Rumors",
  "Grateful",
  "Cold",
  "Best of Me",
  "Destiny",
  "Soldier",
  "Comeback",
  "Crown",
  "Life",
];

const FAV_KEY = "neffex-favorites";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Хранилище (с защитой от ошибок) ===== */
function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(set) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  } catch {
    /* хранилище недоступно — избранное просто не сохранится */
  }
}

/* ===== Уведомление ===== */
const toastEl = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
}

/* ===== Мобильное меню ===== */
function initMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ===== Шапка и активный пункт меню ===== */
function initScrollState() {
  const header = document.getElementById("siteHeader");
  const links = document.querySelectorAll(".site-nav__link");

  window.addEventListener(
    "scroll",
    () => header.classList.toggle("is-scrolled", window.scrollY > 10),
    { passive: true }
  );

  // Подсвечиваем только ссылки на разделы этой же страницы (вида "#story")
  const sections = [...links]
    .map((link) => link.getAttribute("href"))
    .filter((href) => href.startsWith("#"))
    .map((href) => document.querySelector(href))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ===== Сетка «100 недель» ===== */
function initWeeks() {
  const grid = document.getElementById("weeksGrid");
  const counter = document.getElementById("weeksCount");
  const replay = document.getElementById("weeksReplay");
  if (!grid || !counter || !replay) return;
  const cells = [];
  let timer;

  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("span");
    cell.className = "weeks__cell";
    grid.appendChild(cell);
    cells.push(cell);
  }

  function fillAll() {
    cells.forEach((c) => c.classList.add("is-on"));
    counter.textContent = "100";
  }

  function run() {
    clearInterval(timer);
    cells.forEach((c) => c.classList.remove("is-on", "is-latest"));
    counter.textContent = "0";

    if (reduceMotion) {
      fillAll();
      return;
    }

    let i = 0;
    timer = setInterval(() => {
      if (i > 0) cells[i - 1].classList.remove("is-latest");
      if (i >= cells.length) {
        clearInterval(timer);
        return;
      }
      cells[i].classList.add("is-on", "is-latest");
      i++;
      counter.textContent = String(i);
    }, 28);
  }

  replay.addEventListener("click", run);
  run();
}

/* ===== Список треков ===== */
const HEART_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;

function spotifyUrl(title) {
  return `https://open.spotify.com/search/${encodeURIComponent(`NEFFEX ${title}`)}`;
}

function youtubeUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`NEFFEX ${title}`)}`;
}

function initTracks() {
  const list = document.getElementById("trackList");
  const empty = document.getElementById("tracksEmpty");
  const search = document.getElementById("trackSearch");
  const favFilter = document.getElementById("favFilter");
  const favCount = document.getElementById("favCount");
  if (!list || !search || !favFilter) return;

  const favorites = loadFavorites();
  let onlyFavorites = false;

  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = TRACKS.filter((t) => {
      if (onlyFavorites && !favorites.has(t)) return false;
      return t.toLowerCase().includes(query);
    });

    list.innerHTML = "";
    visible.forEach((title) => {
      const isFav = favorites.has(title);
      const li = document.createElement("li");
      li.className = "track";
      li.innerHTML = `
        <button class="track__fav" type="button" aria-pressed="${isFav}"
                aria-label="${isFav ? "Убрать из избранного" : "Добавить в избранное"}: ${title}">
          ${HEART_SVG}
        </button>
        <span class="track__title">${title}</span>
        <span class="track__links">
          <a class="track__link" href="${youtubeUrl(title)}" target="_blank" rel="noopener">YouTube</a>
          <a class="track__link" href="${spotifyUrl(title)}" target="_blank" rel="noopener">Spotify</a>
        </span>`;
      li.querySelector(".track__fav").addEventListener("click", (e) => toggleFavorite(title, e.currentTarget));
      list.appendChild(li);
    });

    favCount.textContent = String(favorites.size);

    if (visible.length === 0) {
      empty.hidden = false;
      empty.textContent = onlyFavorites && favorites.size === 0
        ? "В избранном пока пусто. Нажмите на сердце рядом с треком, чтобы добавить его."
        : "Ничего не нашлось. Попробуйте другое название или очистите поиск.";
    } else {
      empty.hidden = true;
    }
  }

  function toggleFavorite(title, button) {
    const adding = !favorites.has(title);
    adding ? favorites.add(title) : favorites.delete(title);
    saveFavorites(favorites);

    if (!reduceMotion && button) {
      button.classList.add("is-popping");
      setTimeout(() => button.classList.remove("is-popping"), 150);
    }

    showToast(adding ? `«${title}» добавлен в избранное` : `«${title}» убран из избранного`);
    // Небольшая задержка, чтобы анимация кнопки успела сыграть
    setTimeout(render, reduceMotion ? 0 : 150);
  }

  search.addEventListener("input", render);

  favFilter.addEventListener("click", () => {
    onlyFavorites = !onlyFavorites;
    favFilter.setAttribute("aria-pressed", String(onlyFavorites));
    render();
  });

  render();
}

/* ===== Генератор подписи ===== */
function initCredit() {
  const form = document.getElementById("creditForm");
  const trackInput = document.getElementById("creditTrack");
  const langSelect = document.getElementById("creditLang");
  const output = document.getElementById("creditOutput");
  const error = document.getElementById("creditError");
  const datalist = document.getElementById("trackOptions");
  if (!form) return;

  TRACKS.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    datalist.appendChild(opt);
  });

  function buildText() {
    const track = trackInput.value.trim();
    if (!track) {
      output.value = "";
      return "";
    }
    const text = langSelect.value === "en"
      ? `Music: NEFFEX — ${track}\nListen: https://www.youtube.com/@NEFFEX`
      : `Музыка: NEFFEX — ${track}\nСлушать: https://www.youtube.com/@NEFFEX`;
    output.value = text;
    return text;
  }

  trackInput.addEventListener("input", () => {
    error.hidden = true;
    buildText();
  });
  langSelect.addEventListener("change", buildText);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = buildText();

    if (!text) {
      error.hidden = false;
      trackInput.focus();
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast("Подпись скопирована");
    } catch {
      // Запасной вариант для браузеров без Clipboard API
      output.select();
      const ok = document.execCommand && document.execCommand("copy");
      showToast(ok ? "Подпись скопирована" : "Выделите текст и скопируйте вручную");
    }
  });
}

/* ===== Галерея и просмотр крупно ===== */
function initGallery() {
  const dialog = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const caption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");
  if (!dialog || typeof dialog.showModal !== "function") return;

  let lastTrigger = null;

  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
      const source = item.querySelector("img");
      img.src = source.src;
      img.alt = source.alt;
      caption.textContent = item.dataset.caption || "";
      lastTrigger = item;
      dialog.showModal();
    });
  });

  const close = () => dialog.close();
  closeBtn.addEventListener("click", close);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });
  dialog.addEventListener("close", () => {
    if (lastTrigger) lastTrigger.focus();
  });
}

/* ===== Запуск ===== */
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initScrollState();
  initWeeks();
  initTracks();
  initCredit();
  initGallery();
});
