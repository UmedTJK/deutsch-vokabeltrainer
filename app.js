// ========== DOM ЭЛЕМЕНТЫ ==========
// Главная страница
const dashboard = document.getElementById("dashboard");
const loadBtn = document.getElementById("loadBtn");
const repeatUnknownBtn = document.getElementById("repeatUnknownBtn");
const randomWordBtn = document.getElementById("randomWordBtn");
const toggleSoundBtn = document.getElementById("toggleSoundBtn");
const dayBtns = document.querySelectorAll(".day-btn");
const currentDayName = document.getElementById("currentDayName");

// Экраны режимов
const cardsScreen = document.getElementById("cardsScreen");
const testScreen = document.getElementById("testScreen");
const presentationScreen = document.getElementById("presentationScreen");

// Элементы карточек
const cardsCounter = document.getElementById("cardsCounter");
const cardWord = document.getElementById("cardWord");
const cardAnswer = document.getElementById("cardAnswer");
const cardTranslation = document.getElementById("cardTranslation");
const cardExampleDe = document.getElementById("cardExampleDe");
const cardExampleRu = document.getElementById("cardExampleRu");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const knowBtn = document.getElementById("knowBtn");
const dontKnowBtn = document.getElementById("dontKnowBtn");
const wordStatus = document.getElementById("wordStatus");
const autoNextCheckbox = document.getElementById("autoNextCheckbox");
const cardsModeSelect = document.getElementById("cardsModeSelect");
const cardsTypingModeBtn = document.getElementById("cardsTypingModeBtn");
const cardsTypingSection = document.getElementById("cardsTypingSection");
const cardsTypingInput = document.getElementById("cardsTypingInput");
const cardsCheckTypingBtn = document.getElementById("cardsCheckTypingBtn");
const cardsTypingFeedback = document.getElementById("cardsTypingFeedback");
const cardsTypingMessage = document.getElementById("cardsTypingMessage");
const cardsTypingCorrectAnswer = document.getElementById("cardsTypingCorrectAnswer");
const cardsSpeakBtn = document.getElementById("cardsSpeakBtn");

// Элементы теста
const testCounter = document.getElementById("testCounter");
const testWord = document.getElementById("testWord");
const answersContainer = document.getElementById("answersContainer");
const testMessage = document.getElementById("testMessage");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const restartTestBtn = document.getElementById("restartTestBtn");
const resultBox = document.getElementById("resultBox");
const testSpeakBtn = document.getElementById("testSpeakBtn");

// Элементы презентации
const presentationWord = document.getElementById("presentationWord");
const presentationTranslation = document.getElementById("presentationTranslation");
const presentationExamples = document.getElementById("presentationExamples");
const presentationExampleDe = document.getElementById("presentationExampleDe");
const presentationExampleRu = document.getElementById("presentationExampleRu");
const presentationCounter = document.getElementById("presentationCounter");
const presentationProgressBar = document.getElementById("presentationProgressBar");
const presentationPauseBtn = document.getElementById("presentationPauseBtn");
const presentationSpeakBtn = document.getElementById("presentationSpeakBtn");
const presentationSidebar = document.getElementById("presentationSidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const wordsListContainer = document.getElementById("wordsList");
const presentationMain = document.getElementById("presentationMain");

// Элементы статистики
const statTotal = document.getElementById("statTotal");
const statKnown = document.getElementById("statKnown");
const statUnknown = document.getElementById("statUnknown");
const statProgress = document.getElementById("statProgress");

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
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

let typingModeActive = false;
let currentCorrectAnswer = "";

let presentationModeActive = false;
let presentationWordsList = [];
let presentationCurrentIndex = 0;
let presentationTimer = null;
let presentationInterval = 11000;
let presentationPaused = false;
let presentationAnimationFrame = null;

let soundEnabled = true;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

let currentDay = "tag1";

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
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

function updateDashboardStats() {
  if (!words.length) {
    statTotal.textContent = "0";
    statKnown.textContent = "0";
    statUnknown.textContent = "0";
    statProgress.textContent = "0%";
    return;
  }

  const total = words.length;
  const known = words.filter(w => w.status === "known").length;
  const unknown = words.filter(w => w.status === "unknown").length;
  const progress = Math.round((known / total) * 100);

  statTotal.textContent = total;
  statKnown.textContent = known;
  statUnknown.textContent = unknown;
  statProgress.textContent = `${progress}%`;
}

// ========== ЗАГРУЗКА СЛОВ ==========
async function loadWords() {
  const filePath = `data/${currentDay}.json`;

  try {
    const res = await fetch(filePath);
    const data = await res.json();

    words = data.map(w => ({ ...w, status: null }));
    words = loadProgress(currentDay, words);
    words = shuffleArray(words);

    isFilteredMode = false;
    filteredWords = [];
    currentSearchTerm = "";
    currentCardIndex = 0;
    
    if (typingModeActive) {
      toggleTypingMode();
    }

    updateDashboardStats();
    createTestQuestions();
    resetTestUI();

    alert(`Загружено ${words.length} слов из ${currentDay.toUpperCase()}`);

  } catch (e) {
    alert("Ошибка загрузки слов. Проверьте наличие файла data/" + currentDay + ".json");
  }
}

// ========== УПРАВЛЕНИЕ ЭКРАНАМИ ==========
function showScreen(screenName) {
  dashboard.classList.add("hidden");
  cardsScreen.classList.add("hidden");
  testScreen.classList.add("hidden");
  presentationScreen.classList.add("hidden");

  if (screenName === "dashboard") {
    dashboard.classList.remove("hidden");
    updateDashboardStats();
  } else if (screenName === "cards") {
    cardsScreen.classList.remove("hidden");
    showCard();
  } else if (screenName === "test") {
    testScreen.classList.remove("hidden");
    if (testQuestions.length) resetTestUI();
  } else if (screenName === "presentation") {
    presentationScreen.classList.remove("hidden");
    startPresentationMode();
  }
}

// ========== КАРТОЧКИ ==========
function showCard() {
  const source = isFilteredMode ? filteredWords : words;

  if (!source.length) {
    cardWord.textContent = "Нет слов";
    updateDashboardStats();
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
  updateDashboardStats();
  
  if (typingModeActive) {
    prepareTypingMode();
  }
}

function updateWordStatus(status) {
  if (status === "known") wordStatus.textContent = "Знаю";
  else if (status === "unknown") wordStatus.textContent = "Не знаю";
  else wordStatus.textContent = "—";
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
  saveProgress(currentDay, words);
  updateDashboardStats();

  if (autoNextCheckbox.checked && !typingModeActive) showNextCard();
}

function repeatUnknownWords() {
  filteredWords = words.filter(w => w.status === "unknown");
  if (!filteredWords.length) return alert("Нет сложных слов");
  isFilteredMode = true;
  currentCardIndex = 0;
  showCard();
  showScreen("cards");
}

function showRandomWord() {
  const source = isFilteredMode ? filteredWords : words;
  currentCardIndex = Math.floor(Math.random() * source.length);
  showCard();
}

// ========== РЕЖИМ ВВОДА (ВНУТРИ КАРТОЧЕК) ==========
function toggleTypingMode() {
  typingModeActive = !typingModeActive;
  
  if (typingModeActive) {
    cardsTypingModeBtn.classList.add("active");
    cardsTypingSection.classList.remove("hidden");
    cardAnswer.classList.add("hidden");
    prepareTypingMode();
  } else {
    cardsTypingModeBtn.classList.remove("active");
    cardsTypingSection.classList.add("hidden");
    hideTypingFeedback();
  }
}

function prepareTypingMode() {
  const source = isFilteredMode ? filteredWords : words;
  if (!source.length) return;
  
  const w = source[currentCardIndex];
  
  if (cardMode === "de-to-ru") {
    currentCorrectAnswer = w.translation.toLowerCase().trim();
  } else {
    currentCorrectAnswer = w.word.toLowerCase().trim();
  }
  
  cardsTypingInput.value = "";
  hideTypingFeedback();
}

function checkTypingAnswer() {
  const userAnswer = cardsTypingInput.value.toLowerCase().trim();
  
  if (userAnswer === currentCorrectAnswer) {
    cardsTypingFeedback.className = "typing-feedback correct";
    cardsTypingMessage.textContent = "✅ Правильно! Отлично!";
    cardsTypingCorrectAnswer.textContent = "";
    
    markWord("known");
    
    if (autoNextCheckbox.checked) {
      setTimeout(() => {
        showNextCard();
        if (typingModeActive) prepareTypingMode();
      }, 1000);
    }
  } else {
    cardsTypingFeedback.className = "typing-feedback wrong";
    cardsTypingMessage.textContent = "❌ Неправильно. Попробуйте ещё раз!";
    cardsTypingCorrectAnswer.textContent = `Правильный ответ: ${currentCorrectAnswer}`;
    
    markWord("unknown");
  }
  
  cardsTypingFeedback.classList.remove("hidden");
}

function hideTypingFeedback() {
  cardsTypingFeedback.classList.add("hidden");
  cardsTypingInput.value = "";
}

// ========== АУДИО ФУНКЦИИ ==========
function speakText(text, lang = 'de-DE') {
  if (!soundEnabled) return;
  
  if (currentUtterance) {
    speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  
  currentUtterance = utterance;
  speechSynthesis.speak(utterance);
  
  utterance.onend = () => {
    currentUtterance = null;
  };
}

function speakCardWord() {
  const source = isFilteredMode ? filteredWords : words;
  if (!source.length) return;
  
  const w = source[currentCardIndex];
  
  if (cardMode === "de-to-ru") {
    speakText(w.word, 'de-DE');
  } else {
    speakText(w.translation, 'ru-RU');
  }
}

function speakTestWord() {
  if (testQuestions.length && currentTestIndex < testQuestions.length) {
    const q = testQuestions[currentTestIndex];
    speakText(q.word, 'de-DE');
  }
}

function speakPresentationWord() {
  if (presentationModeActive && presentationCurrentIndex < presentationWordsList.length) {
    const w = presentationWordsList[presentationCurrentIndex];
    speakText(w.word, 'de-DE');
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    toggleSoundBtn.textContent = "🔊 Звук вкл";
    toggleSoundBtn.classList.remove("sound-off");
  } else {
    toggleSoundBtn.textContent = "🔇 Звук выкл";
    toggleSoundBtn.classList.add("sound-off");
    if (currentUtterance) {
      speechSynthesis.cancel();
      currentUtterance = null;
    }
  }
}

// ========== ТЕСТ ==========
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
  if (currentTestIndex >= testQuestions.length) {
    showTestResult();
    return;
  }

  const q = testQuestions[currentTestIndex];
  testWord.textContent = q.word;
  answersContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("answer-btn");
    btn.onclick = () => handleTestAnswer(btn, opt, q.correct);
    answersContainer.appendChild(btn);
  });
}

function handleTestAnswer(btn, selected, correct) {
  if (answered) return;
  answered = true;
  
  if (selected === correct) {
    score++;
    btn.classList.add("correct");
    testMessage.textContent = "✅ Правильно!";
  } else {
    btn.classList.add("wrong");
    testMessage.textContent = `❌ Неправильно. Правильно: ${correct}`;
    
    const btns = document.querySelectorAll(".answer-btn");
    btns.forEach(b => {
      if (b.textContent === correct) {
        b.classList.add("correct");
      }
    });
  }
  
  nextQuestionBtn.classList.remove("hidden");
}

function showTestResult() {
  testWord.textContent = "Тест завершён!";
  answersContainer.innerHTML = "";
  testMessage.textContent = "";
  nextQuestionBtn.classList.add("hidden");
  restartTestBtn.classList.remove("hidden");
  
  const percent = Math.round((score / testQuestions.length) * 100);
  resultBox.textContent = `Результат: ${score} из ${testQuestions.length} (${percent}%)`;
}

function resetTestUI() {
  currentTestIndex = 0;
  score = 0;
  answered = false;
  testMessage.textContent = "";
  resultBox.textContent = "";
  nextQuestionBtn.classList.add("hidden");
  restartTestBtn.classList.add("hidden");
  
  if (testQuestions.length) {
    showTestQuestion();
  }
}

function nextTestQuestion() {
  currentTestIndex++;
  answered = false;
  testMessage.textContent = "";
  nextQuestionBtn.classList.add("hidden");
  showTestQuestion();
}

function restartTest() {
  resetTestUI();
}

// ========== РЕЖИМ ПРЕЗЕНТАЦИИ ==========
function startPresentationMode() {
  if (!words.length) {
    alert("Сначала загрузите слова");
    showScreen("dashboard");
    return;
  }
  
  presentationModeActive = true;
  presentationWordsList = [...words];
  presentationCurrentIndex = 0;
  presentationPaused = false;
  
  presentationPauseBtn.textContent = "⏸ Пауза";
  
  if (presentationSidebar && presentationMain) {
    if (!presentationSidebar.classList.contains("collapsed")) {
      presentationMain.classList.add("with-sidebar");
    } else {
      presentationMain.classList.remove("with-sidebar");
    }
  }
  
  updateWordsList();
  showPresentationSlide();
}

function updateWordsList() {
  if (!wordsListContainer) return;
  
  wordsListContainer.innerHTML = "";
  
  presentationWordsList.forEach((word, index) => {
    const wordItem = document.createElement("div");
    wordItem.className = "word-item";
    
    if (index === presentationCurrentIndex) {
      wordItem.classList.add("current");
    } else if (index < presentationCurrentIndex) {
      wordItem.classList.add("passed");
    }
    
    wordItem.innerHTML = `
      <span class="word-number">${index + 1}.</span>
      <span class="word-text">${word.word}</span>
    `;
    
    wordItem.onclick = () => {
      if (presentationModeActive && !presentationPaused) {
        if (presentationTimer) clearTimeout(presentationTimer);
        if (presentationAnimationFrame) cancelAnimationFrame(presentationAnimationFrame);
        
        presentationCurrentIndex = index;
        showPresentationSlide();
      }
    };
    
    wordsListContainer.appendChild(wordItem);
  });
  
  const currentItem = wordsListContainer.querySelector(".word-item.current");
  if (currentItem) {
    currentItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function showPresentationSlide() {
  if (presentationCurrentIndex >= presentationWordsList.length) {
    presentationCurrentIndex = 0;
    updateWordsList();
  }
  
  const word = presentationWordsList[presentationCurrentIndex];
  
  presentationCounter.textContent = `${presentationCurrentIndex + 1} / ${presentationWordsList.length}`;
  
  presentationTranslation.style.opacity = "0";
  presentationExamples.style.opacity = "0";
  presentationTranslation.textContent = "";
  presentationExampleDe.textContent = "";
  presentationExampleRu.textContent = "";
  
  presentationWord.textContent = word.word;
  presentationWord.style.opacity = "1";
  
  updateWordsList();
  startProgressBar();
  
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused) {
      speakText(word.word, 'de-DE');
    }
  }, 500);
  
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused && presentationCurrentIndex < presentationWordsList.length) {
      presentationTranslation.textContent = word.translation;
      presentationTranslation.style.opacity = "1";
    }
  }, 1000);
  
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused && presentationCurrentIndex < presentationWordsList.length) {
      presentationExampleDe.textContent = word.example_de;
      presentationExampleRu.textContent = word.example_ru;
      presentationExamples.style.opacity = "1";
    }
  }, 2000);
  
  if (presentationTimer) clearTimeout(presentationTimer);
  
  presentationTimer = setTimeout(() => {
    if (presentationModeActive && !presentationPaused) {
      presentationCurrentIndex++;
      showPresentationSlide();
    }
  }, presentationInterval);
}

function startProgressBar() {
  let startTime = Date.now();
  const duration = presentationInterval;
  
  if (presentationAnimationFrame) {
    cancelAnimationFrame(presentationAnimationFrame);
    presentationAnimationFrame = null;
  }
  
  function updateProgress() {
    if (!presentationModeActive || presentationPaused) {
      presentationAnimationFrame = requestAnimationFrame(updateProgress);
      return;
    }
    
    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / duration) * 100, 100);
    presentationProgressBar.style.width = `${percent}%`;
    
    if (percent < 100) {
      presentationAnimationFrame = requestAnimationFrame(updateProgress);
    } else {
      presentationAnimationFrame = null;
    }
  }
  
  presentationAnimationFrame = requestAnimationFrame(updateProgress);
}

function pausePresentation() {
  if (!presentationModeActive) return;
  
  presentationPaused = !presentationPaused;
  
  if (presentationPaused) {
    presentationPauseBtn.textContent = "▶ Старт";
    if (presentationTimer) {
      clearTimeout(presentationTimer);
      presentationTimer = null;
    }
  } else {
    presentationPauseBtn.textContent = "⏸ Пауза";
    
    const currentWidth = parseFloat(presentationProgressBar.style.width) || 0;
    const remainingPercent = 100 - currentWidth;
    const remainingTime = (remainingPercent / 100) * presentationInterval;
    
    const startTime = Date.now();
    const duration = remainingTime;
    
    if (presentationAnimationFrame) {
      cancelAnimationFrame(presentationAnimationFrame);
    }
    
    function resumeProgress() {
      if (!presentationModeActive || presentationPaused) {
        presentationAnimationFrame = requestAnimationFrame(resumeProgress);
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      const newWidth = currentWidth + percent;
      presentationProgressBar.style.width = `${Math.min(newWidth, 100)}%`;
      
      if (percent < 100) {
        presentationAnimationFrame = requestAnimationFrame(resumeProgress);
      } else {
        presentationAnimationFrame = null;
      }
    }
    
    presentationAnimationFrame = requestAnimationFrame(resumeProgress);
    
    presentationTimer = setTimeout(() => {
      if (presentationModeActive && !presentationPaused) {
        presentationCurrentIndex++;
        showPresentationSlide();
      }
    }, remainingTime);
  }
}

function exitPresentation() {
  if (presentationTimer) {
    clearTimeout(presentationTimer);
    presentationTimer = null;
  }
  if (presentationAnimationFrame) {
    cancelAnimationFrame(presentationAnimationFrame);
    presentationAnimationFrame = null;
  }
  
  if (presentationMain) {
    presentationMain.classList.remove("with-sidebar");
  }
  
  presentationModeActive = false;
  showScreen("dashboard");
}

function toggleSidebar() {
  if (!presentationSidebar || !presentationMain) return;
  
  presentationSidebar.classList.toggle("collapsed");
  
  if (presentationSidebar.classList.contains("collapsed")) {
    presentationMain.classList.remove("with-sidebar");
  } else {
    presentationMain.classList.add("with-sidebar");
  }
}

// ========== ВЫБОР ДНЯ ==========
dayBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    dayBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDay = btn.getAttribute("data-day");
    const dayName = btn.textContent.split(" ")[0];
    currentDayName.textContent = dayName;
  });
});

// ========== ЗАПУСК РЕЖИМОВ С ГЛАВНОЙ ==========
document.querySelectorAll(".mode-start-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    if (!words.length) {
      alert("Сначала загрузите слова!");
      return;
    }
    
    const mode = btn.getAttribute("data-mode");
    if (mode === "cards") {
      showScreen("cards");
    } else if (mode === "typing") {
      toggleTypingMode();
      showScreen("cards");
    } else if (mode === "test") {
      showScreen("test");
    } else if (mode === "presentation") {
      showScreen("presentation");
    }
  });
});

// ========== КНОПКИ НАЗАД ==========
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (presentationModeActive) {
      exitPresentation();
    }
    showScreen("dashboard");
  });
});

// ========== EVENTS ==========
loadBtn.onclick = loadWords;
repeatUnknownBtn.onclick = repeatUnknownWords;
randomWordBtn.onclick = showRandomWord;
toggleSoundBtn.onclick = toggleSound;

showAnswerBtn.onclick = () => cardAnswer.classList.remove("hidden");
prevBtn.onclick = showPrevCard;
nextBtn.onclick = showNextCard;
knowBtn.onclick = () => markWord("known");
dontKnowBtn.onclick = () => markWord("unknown");

cardsModeSelect.onclick = () => {
  if (cardMode === "de-to-ru") {
    cardMode = "ru-to-de";
    cardsModeSelect.textContent = "RU → DE";
  } else {
    cardMode = "de-to-ru";
    cardsModeSelect.textContent = "DE → RU";
  }
  showCard();
};

cardsTypingModeBtn.onclick = toggleTypingMode;
cardsCheckTypingBtn.onclick = checkTypingAnswer;
cardsTypingInput.onkeypress = (e) => {
  if (e.key === "Enter") checkTypingAnswer();
};
cardsSpeakBtn.onclick = speakCardWord;

testSpeakBtn.onclick = speakTestWord;
nextQuestionBtn.onclick = nextTestQuestion;
restartTestBtn.onclick = restartTest;

presentationPauseBtn.onclick = pausePresentation;
presentationSpeakBtn.onclick = speakPresentationWord;
toggleSidebarBtn.onclick = toggleSidebar;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
// Устанавливаем активный день по умолчанию
document.querySelector('.day-btn[data-day="tag1"]').classList.add("active");
currentDayName.textContent = "Tag 1";
updateDashboardStats();
showScreen("dashboard");
