const daySelect = document.getElementById("daySelect");
const loadBtn = document.getElementById("loadBtn");

const repeatUnknownBtn = document.getElementById("repeatUnknownBtn");
const showAllBtn = document.getElementById("showAllBtn");
const randomWordBtn = document.getElementById("randomWordBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetSearchBtn = document.getElementById("resetSearchBtn");

const autoNextCheckbox = document.getElementById("autoNextCheckbox");

const cardsModeBtn = document.getElementById("cardsModeBtn");
const testModeBtn = document.getElementById("testModeBtn");

const cardsSection = document.getElementById("cardsSection");
const testSection = document.getElementById("testSection");

const cardsCounter = document.getElementById("cardsCounter");
const cardWord = document.getElementById("cardWord");
const cardAnswer = document.getElementById("cardAnswer");
const cardTranslation = document.getElementById("cardTranslation");
const cardExampleDe = document.getElementById("cardExampleDe");
const cardExampleRu = document.getElementById("cardExampleRu");
const statsBox = document.getElementById("statsBox");
const cardModeSelect = document.getElementById("cardModeSelect");

const showAnswerBtn = document.getElementById("showAnswerBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const knowBtn = document.getElementById("knowBtn");
const dontKnowBtn = document.getElementById("dontKnowBtn");
const wordStatus = document.getElementById("wordStatus");

const testCounter = document.getElementById("testCounter");
const testWord = document.getElementById("testWord");
const answersContainer = document.getElementById("answersContainer");
const testMessage = document.getElementById("testMessage");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const restartTestBtn = document.getElementById("restartTestBtn");
const resultBox = document.getElementById("resultBox");

const STORAGE_KEY = "germanTrainerProgress";

let words = [];
let filteredWords = [];
let isFilteredMode = false;
let currentCardIndex = 0;
let cardMode = "de-to-ru";
let currentSearchTerm = "";

let testQuestions = [];
let currentTestIndex = 0;
let score = 0;
let answered = false;

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function saveProgress(day, words) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  stored[day] = words.reduce((acc, word) => {
    acc[word.word] = word.status || null;
    return acc;
  }, {});
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function loadProgress(day, words) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!stored || !stored[day]) return words;

  return words.map((word) => ({
    ...word,
    status: stored[day][word.word] || null
  }));
}

async function loadWords() {
  const filePath = `data/${daySelect.value}.json`;

  try {
    const res = await fetch(filePath);
    const data = await res.json();

    words = data.map(w => ({ ...w, status: null }));
    words = loadProgress(daySelect.value, words);
    words = shuffleArray(words);

    isFilteredMode = false;
    filteredWords = [];
    currentSearchTerm = "";
    searchInput.value = "";
    currentCardIndex = 0;

    showCard();
    createTestQuestions();
    resetTestUI();

  } catch (e) {
    alert("Ошибка загрузки");
  }
}

function showCard() {
  const source = isFilteredMode ? filteredWords : words;

  if (!source.length) {
    cardWord.textContent = "Нет слов";
    updateStats();
    return;
  }

  const w = source[currentCardIndex];

  cardsCounter.textContent = `${currentCardIndex + 1} / ${source.length}`;

  if (cardMode === "de-to-ru") {
    cardWord.textContent = w.word;
    cardTranslation.textContent = w.translation;
  } else {
    cardWord.textContent = w.translation;
    cardTranslation.textContent = w.word;
  }

  cardExampleDe.textContent = w.example_de;
  cardExampleRu.textContent = w.example_ru;

  updateWordStatus(w.status);
  cardAnswer.classList.add("hidden");
  updateStats();
}

function updateWordStatus(status) {
  if (status === "known") wordStatus.textContent = "Знаю";
  else if (status === "unknown") wordStatus.textContent = "Не знаю";
  else wordStatus.textContent = "—";
}

function updateStats() {
  const source = isFilteredMode ? filteredWords : words;
  let k = 0, u = 0, n = 0;

  source.forEach(w => {
    if (w.status === "known") k++;
    else if (w.status === "unknown") u++;
    else n++;
  });

  statsBox.textContent = `✅ ${k} | ❌ ${u} | ⚪ ${n}`;
}

function showNextCard() {
  const source = isFilteredMode ? filteredWords : words;
  if (currentCardIndex < source.length - 1) {
    currentCardIndex++;
    showCard();
  }
}

function showPrevCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    showCard();
  }
}

function markWord(status) {
  const source = isFilteredMode ? filteredWords : words;
  if (!source.length) return;

  source[currentCardIndex].status = status;
  saveProgress(daySelect.value, words);
  updateStats();

  if (autoNextCheckbox.checked) showNextCard();
}

function repeatUnknownWords() {
  filteredWords = words.filter(w => w.status === "unknown");
  if (!filteredWords.length) return alert("Нет сложных слов");
  isFilteredMode = true;
  currentCardIndex = 0;
  showCard();
}

function showAllWords() {
  isFilteredMode = false;
  filteredWords = [];
  currentCardIndex = 0;
  showCard();
}

function searchWords() {
  const t = searchInput.value.toLowerCase();
  if (!t) return;

  filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(t) ||
    w.translation.toLowerCase().includes(t)
  );

  isFilteredMode = true;
  currentCardIndex = 0;
  showCard();
}

function resetSearch() {
  searchInput.value = "";
  showAllWords();
}

function showRandomWord() {
  const source = isFilteredMode ? filteredWords : words;
  currentCardIndex = Math.floor(Math.random() * source.length);
  showCard();
}

/* TEST */

function createTestQuestions() {
  testQuestions = words.map(w => ({
    word: w.word,
    correct: w.translation,
    options: shuffleArray([
      w.translation,
      ...shuffleArray(words.map(x => x.translation)).slice(0, 3)
    ])
  }));
}

function showTestQuestion() {
  if (currentTestIndex >= testQuestions.length) return;

  const q = testQuestions[currentTestIndex];
  testWord.textContent = q.word;
  answersContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      if (opt === q.correct) score++;
      currentTestIndex++;
      showTestQuestion();
    };
    answersContainer.appendChild(btn);
  });
}

function resetTestUI() {
  currentTestIndex = 0;
  score = 0;
}

/* EVENTS */

loadBtn.onclick = loadWords;
showAnswerBtn.onclick = () => cardAnswer.classList.remove("hidden");

prevBtn.onclick = showPrevCard;
nextBtn.onclick = showNextCard;

knowBtn.onclick = () => markWord("known");
dontKnowBtn.onclick = () => markWord("unknown");

repeatUnknownBtn.onclick = repeatUnknownWords;
showAllBtn.onclick = showAllWords;
randomWordBtn.onclick = showRandomWord;

searchBtn.onclick = searchWords;
resetSearchBtn.onclick = resetSearch;

cardModeSelect.onchange = () => {
  cardMode = cardModeSelect.value;
  showCard();
};
