"use strict";

/* ===== Вопросы ===== */
const QUESTIONS = [
  {
    text: "В каком году появился NEFFEX?",
    options: ["2011", "2014", "2017", "2020"],
    answer: 1,
    note: "Проект основали в 2014 году.",
  },
  {
    text: "Кто основал NEFFEX?",
    options: [
      "Брайс Сэвидж и Кэмерон Уэйлс",
      "Брайс Сэвидж в одиночку",
      "Кэмерон Уэйлс и его брат",
      "Продюсерский лейбл",
    ],
    answer: 0,
    note: "Вокалист Брайс Сэвидж и продюсер Кэмерон Уэйлс — друзья ещё со школьной панк-группы.",
  },
  {
    text: "Где появился проект?",
    options: ["В Нью-Йорке", "В Торонто", "В Орандж-Каунти, Калифорния", "В Лондоне"],
    answer: 2,
    note: "NEFFEX родом из Орандж-Каунти в Калифорнии.",
  },
  {
    text: "Сколько недель длился знаменитый челлендж с новой песней каждую неделю?",
    options: ["52", "75", "100", "365"],
    answer: 2,
    note: "Сто недель подряд — по одной песне каждую неделю.",
  },
  {
    text: "Как называется первый полноформатный альбом NEFFEX?",
    options: ["Born a Rockstar", "New Beginnings", "100 Weeks", "Fight Back"],
    answer: 1,
    note: "Альбом New Beginnings вышел в 2020 году. Born a Rockstar — это название тура.",
  },
  {
    text: "Что произошло с проектом в 2021 году?",
    options: [
      "NEFFEX распался навсегда",
      "Проект сменил название",
      "Уэйлс ушёл, а Сэвидж продолжил NEFFEX один",
      "Дуэт стал трио",
    ],
    answer: 2,
    note: "Расставание было дружеским: Уэйлс занялся сольным проектом, а Сэвидж продолжил NEFFEX.",
  },
  {
    text: "В скольких городах прошёл тур Born a Rockstar в 2023 году?",
    options: ["10", "25", "50", "100"],
    answer: 1,
    note: "Тур охватил 25 городов Европы и Северной Америки.",
  },
  {
    text: "Чем NEFFEX особенно известен среди авторов видео?",
    options: [
      "Снимал ролики вместо клипов",
      "Разрешал бесплатно использовать свои песни в видео",
      "Выпускал только инструментальную музыку",
      "Записывал песни на заказ",
    ],
    answer: 1,
    note: "Поэтому его треки звучат в тысячах роликов на YouTube и в соцсетях.",
  },
];

const BEST_KEY = "neffex-quiz-best";

/* ===== Хранилище лучшего результата ===== */
function loadBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* хранилище недоступно — не страшно */
  }
}

/* ===== Викторина ===== */
function initQuiz() {
  const progress = document.getElementById("quizProgress");
  const questionScreen = document.getElementById("quizQuestion");
  const resultScreen = document.getElementById("quizResult");
  const stepEl = document.getElementById("quizStep");
  const textEl = document.getElementById("quizText");
  const optionsEl = document.getElementById("quizOptions");
  const feedbackEl = document.getElementById("quizFeedback");
  const nextBtn = document.getElementById("quizNext");
  const restartBtn = document.getElementById("quizRestart");
  const resultScore = document.getElementById("resultScore");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("resultText");
  const bestEl = document.getElementById("bestScore");
  if (!progress || !optionsEl) return;

  let current = 0;
  let score = 0;
  const results = []; // true / false по каждому вопросу

  // Сегменты прогресса
  QUESTIONS.forEach(() => {
    const seg = document.createElement("span");
    seg.className = "quiz__segment";
    progress.appendChild(seg);
  });
  const segments = [...progress.children];

  function showBest() {
    const best = loadBest();
    if (best > 0) {
      bestEl.hidden = false;
      bestEl.textContent = `Ваш лучший результат: ${best} из ${QUESTIONS.length}`;
    }
  }

  function updateProgress() {
    segments.forEach((seg, i) => {
      seg.className = "quiz__segment";
      if (i < results.length) seg.classList.add(results[i] ? "is-right" : "is-wrong");
      else if (i === current) seg.classList.add("is-current");
    });
  }

  function renderQuestion() {
    const q = QUESTIONS[current];
    stepEl.textContent = `Вопрос ${current + 1} из ${QUESTIONS.length}`;
    textEl.textContent = q.text;
    feedbackEl.hidden = true;
    feedbackEl.className = "quiz__feedback";
    nextBtn.hidden = true;
    nextBtn.textContent = current === QUESTIONS.length - 1 ? "Узнать результат" : "Следующий вопрос";

    optionsEl.innerHTML = "";
    q.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz__option";
      btn.innerHTML = `<span class="quiz__letter">${"АБВГ"[index]}</span><span>${option}</span>`;
      btn.addEventListener("click", () => choose(index));
      optionsEl.appendChild(btn);
    });

    updateProgress();
  }

  function choose(index) {
    const q = QUESTIONS[current];
    const correct = index === q.answer;
    const buttons = [...optionsEl.children];

    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add("is-right");
      if (i === index && !correct) btn.classList.add("is-wrong");
    });

    if (correct) score++;
    results.push(correct);

    feedbackEl.hidden = false;
    feedbackEl.classList.add(correct ? "is-right" : "is-wrong");
    feedbackEl.textContent = `${correct ? "Верно!" : "Не совсем."} ${q.note}`;

    nextBtn.hidden = false;
    nextBtn.focus();
    updateProgress();
  }

  function showResult() {
    questionScreen.hidden = true;
    resultScreen.hidden = false;
    resultScore.textContent = String(score);

    let title;
    let text;
    if (score === QUESTIONS.length) {
      title = "Настоящий фанат";
      text = "Ни одной ошибки. Сто недель подряд вы бы точно продержались.";
    } else if (score >= 5) {
      title = "Хороший результат";
      text = "Вы неплохо знаете историю NEFFEX. Пара деталей — и будет максимум.";
    } else {
      title = "Есть куда расти";
      text = "Загляните в раздел с историей на главной — там есть все ответы.";
    }
    resultTitle.textContent = title;
    resultText.textContent = text;

    if (score > loadBest()) {
      saveBest(score);
      if (typeof showToast === "function") showToast("Новый лучший результат!");
    }
    showBest();
    resultTitle.focus();
  }

  function next() {
    current++;
    if (current < QUESTIONS.length) {
      renderQuestion();
      textEl.focus();
    } else {
      updateProgress();
      showResult();
    }
  }

  function restart() {
    current = 0;
    score = 0;
    results.length = 0;
    resultScreen.hidden = true;
    questionScreen.hidden = false;
    renderQuestion();
    textEl.focus();
  }

  nextBtn.addEventListener("click", next);
  restartBtn.addEventListener("click", restart);

  showBest();
  renderQuestion();
}

document.addEventListener("DOMContentLoaded", initQuiz);
