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
const presentationModeBtn = document.getElementById("presentationModeBtn");

const cardsSection = document.getElementById("cardsSection");
const testSection = document.getElementById("testSection");
const presentationSection = document.getElementById("presentationSection");

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

// Элементы режима ввода
const typingModeBtn = document.getElementById("typingModeBtn");
const typingSection = document.getElementById("typingSection");
const typingInput = document.getElementById("typingInput");
const checkTypingBtn = document.getElementById("checkTypingBtn");
const typingFeedback = document.getElementById("typingFeedback");
const typingMessage = document.getElementById("typingMessage");
const typingCorrectAnswer = document.getElementById("typingCorrectAnswer");

// Элементы режима презентации
const presentationWord = document.getElementById("presentationWord");
const presentationTranslation = document.getElementById("presentationTranslation");
const presentationExamples = document.getElementById("presentationExamples");
const presentationExampleDe = document.getElementById("presentationExampleDe");
const presentationExampleRu = document.getElementById("presentationExampleRu");
const presentationCounter = document.getElementById("presentationCounter");
const presentationProgressBar = document.getElementById("presentationProgressBar");
const presentationExitBtn = document.getElementById("presentationExitBtn");
const presentationPauseBtn = document.getElementById("presentationPauseBtn");
const presentationStopBtn = document.getElementById("presentationStopBtn");
const presentationSidebar = document.getElementById("presentationSidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const wordsListContainer = document.getElementById("wordsList");
const presentationMain = document.getElementById("presentationMain");

// Элементы аудио
const speakCardBtn = document.getElementById("speakCardBtn");
const speakPresentationBtn = document.getElementById("speakPresentationBtn");
const speakTestBtn = document.getElementById("speakTestBtn");
const toggleSoundBtn = document.getElementById("toggleSoundBtn");

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

// Переменные для режима ввода
let typingModeActive = false;
let currentCorrectAnswer = "";

// Переменные для режима презентации
let presentationModeActive = false;
let presentationWordsList = [];
let presentationCurrentIndex = 0;
let presentationTimer = null;
let presentationInterval = 11000;
let presentationPaused = false;
let presentationAnimationFrame = null;

// Переменные для аудио
let soundEnabled = true;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

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
    
    if (typingModeActive) {
      toggleTypingMode();
    }

    showCard();
    createTestQuestions();
    resetTestUI();

  } catch (e) {
    alert("Ошибка загрузки");
  }
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
  
  if (typingModeActive) {
    prepareTypingMode();
  }
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

  if (autoNextCheckbox.checked && !typingModeActive) showNextCard();
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

/* РЕЖИМ ВВОДА */
function toggleTypingMode() {
  typingModeActive = !typingModeActive;
  
  if (typingModeActive) {
    typingModeBtn.classList.add("active");
    typingSection.classList.remove("hidden");
    cardAnswer.classList.add("hidden");
    prepareTypingMode();
  } else {
    typingModeBtn.classList.remove("active");
    typingSection.classList.add("hidden");
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
  
  typingInput.value = "";
  hideTypingFeedback();
}

function checkTypingAnswer() {
  const userAnswer = typingInput.value.toLowerCase().trim();
  
  if (userAnswer === currentCorrectAnswer) {
    typingFeedback.className = "typing-feedback correct";
    typingMessage.textContent = "✅ Правильно! Отлично!";
    typingCorrectAnswer.textContent = "";
    
    markWord("known");
    
    if (autoNextCheckbox.checked) {
      setTimeout(() => {
        showNextCard();
        if (typingModeActive) prepareTypingMode();
      }, 1000);
    }
  } else {
    typingFeedback.className = "typing-feedback wrong";
    typingMessage.textContent = "❌ Неправильно. Попробуйте ещё раз!";
    typingCorrectAnswer.textContent = `Правильный ответ: ${currentCorrectAnswer}`;
    
    markWord("unknown");
  }
  
  typingFeedback.classList.remove("hidden");
}

function hideTypingFeedback() {
  typingFeedback.classList.add("hidden");
  typingInput.value = "";
}

/* АУДИО ФУНКЦИИ */
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

function getCurrentWordForSpeaking() {
  const source = isFilteredMode ? filteredWords : words;
  if (!source.length) return null;
  
  const w = source[currentCardIndex];
  
  if (cardMode === "de-to-ru") {
    return { text: w.word, lang: 'de-DE' };
  } else {
    return { text: w.translation, lang: 'ru-RU' };
  }
}

function speakCardWord() {
  const word = getCurrentWordForSpeaking();
  if (word) {
    speakText(word.text, word.lang);
  }
}

function speakPresentationWord() {
  if (presentationModeActive && presentationCurrentIndex < presentationWordsList.length) {
    const w = presentationWordsList[presentationCurrentIndex];
    speakText(w.word, 'de-DE');
  }
}

function speakTestWord() {
  if (testQuestions.length && currentTestIndex < testQuestions.length) {
    const q = testQuestions[currentTestIndex];
    speakText(q.word, 'de-DE');
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

/* БОКОВАЯ ПАНЕЛЬ ПРЕЗЕНТАЦИИ */
function toggleSidebar() {
  if (!presentationSidebar || !presentationMain) return;
  
  presentationSidebar.classList.toggle("collapsed");
  const btn = toggleSidebarBtn;
  
  if (presentationSidebar.classList.contains("collapsed")) {
    btn.textContent = "▶";
    btn.title = "Показать панель";
    presentationMain.classList.remove("with-sidebar");
  } else {
    btn.textContent = "◀";
    btn.title = "Скрыть панель";
    presentationMain.classList.add("with-sidebar");
  }
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
        // Очищаем таймеры перед переходом
        if (presentationTimer) clearTimeout(presentationTimer);
        if (presentationAnimationFrame) cancelAnimationFrame(presentationAnimationFrame);
        
        presentationCurrentIndex = index;
        showPresentationSlide();
      }
    };
    
    wordsListContainer.appendChild(wordItem);
  });
  
  // Автоматически прокручиваем к текущему слову
  const currentItem = wordsListContainer.querySelector(".word-item.current");
  if (currentItem) {
    currentItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* РЕЖИМ ПРЕЗЕНТАЦИИ */
function startPresentationMode() {
  if (!words.length) {
    alert("Сначала загрузите слова");
    return;
  }
  
  presentationModeActive = true;
  presentationWordsList = [...words];
  presentationCurrentIndex = 0;
  presentationPaused = false;
  
  cardsSection.classList.add("hidden");
  testSection.classList.add("hidden");
  presentationSection.classList.remove("hidden");
  
  cardsModeBtn.classList.remove("active");
  testModeBtn.classList.remove("active");
  presentationModeBtn.classList.add("active");
  
  presentationPauseBtn.textContent = "⏸ Пауза";
  
  // Сбрасываем состояние боковой панели
  if (presentationSidebar && presentationMain) {
    // Проверяем, была ли панель скрыта
    if (!presentationSidebar.classList.contains("collapsed")) {
      presentationMain.classList.add("with-sidebar");
    } else {
      presentationMain.classList.remove("with-sidebar");
    }
  }
  
  // Обновляем список слов
  updateWordsList();
  
  showPresentationSlide();
}

function showPresentationSlide() {
  if (presentationCurrentIndex >= presentationWordsList.length) {
    // Презентация завершена, начинаем сначала или останавливаемся
    presentationCurrentIndex = 0;
    updateWordsList();
  }
  
  const word = presentationWordsList[presentationCurrentIndex];
  
  presentationCounter.textContent = `${presentationCurrentIndex + 1} / ${presentationWordsList.length}`;
  
  // Сброс анимаций
  presentationTranslation.style.opacity = "0";
  presentationExamples.style.opacity = "0";
  presentationTranslation.textContent = "";
  presentationExampleDe.textContent = "";
  presentationExampleRu.textContent = "";
  
  presentationWord.textContent = word.word;
  presentationWord.style.opacity = "1";
  
  // Обновляем список слов с подсветкой текущего
  updateWordsList();
  
  // Запускаем прогресс-бар
  startProgressBar();
  
  // Озвучивание слова
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused) {
      speakText(word.word, 'de-DE');
    }
  }, 500);
  
  // Показ перевода
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused && presentationCurrentIndex < presentationWordsList.length) {
      presentationTranslation.textContent = word.translation;
      presentationTranslation.style.opacity = "1";
    }
  }, 1000);
  
  // Показ примеров
  setTimeout(() => {
    if (presentationModeActive && !presentationPaused && presentationCurrentIndex < presentationWordsList.length) {
      presentationExampleDe.textContent = word.example_de;
      presentationExampleRu.textContent = word.example_ru;
      presentationExamples.style.opacity = "1";
    }
  }, 2000);
  
  // Очищаем предыдущий таймер
  if (presentationTimer) clearTimeout(presentationTimer);
  
  // Устанавливаем таймер для следующего слова
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
  
  // Очищаем предыдущую анимацию
  if (presentationAnimationFrame) {
    cancelAnimationFrame(presentationAnimationFrame);
    presentationAnimationFrame = null;
  }
  
  function updateProgress() {
    if (!presentationModeActive || presentationPaused) {
      // Если на паузе, продолжаем запрашивать кадры, но не обновляем прогресс
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
    // Анимация прогресс-бара останавливается, но requestAnimationFrame продолжает работать
    // с проверкой presentationPaused, поэтому прогресс не обновляется
  } else {
    presentationPauseBtn.textContent = "⏸ Пауза";
    
    // Вычисляем оставшееся время на основе текущей ширины прогресс-бара
    const currentWidth = parseFloat(presentationProgressBar.style.width) || 0;
    const remainingPercent = 100 - currentWidth;
    const remainingTime = (remainingPercent / 100) * presentationInterval;
    
    // Перезапускаем прогресс-бар с оставшегося времени
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
    
    // Перезапускаем таймер
    presentationTimer = setTimeout(() => {
      if (presentationModeActive && !presentationPaused) {
        presentationCurrentIndex++;
        showPresentationSlide();
      }
    }, remainingTime);
  }
}

function stopPresentation() {
  if (!presentationModeActive) return;
  
  if (confirm("Остановить презентацию и вернуться к карточкам?")) {
    // Очищаем все таймеры
    if (presentationTimer) {
      clearTimeout(presentationTimer);
      presentationTimer = null;
    }
    if (presentationAnimationFrame) {
      cancelAnimationFrame(presentationAnimationFrame);
      presentationAnimationFrame = null;
    }
    
    presentationModeActive = false;
    switchToCards();
  }
}

function exitPresentation() {
  // Очищаем все таймеры
  if (presentationTimer) {
    clearTimeout(presentationTimer);
    presentationTimer = null;
  }
  if (presentationAnimationFrame) {
    cancelAnimationFrame(presentationAnimationFrame);
    presentationAnimationFrame = null;
  }
  
  // Сбрасываем состояние боковой панели
  if (presentationMain) {
    presentationMain.classList.remove("with-sidebar");
  }
  
  presentationModeActive = false;
  switchToCards();
}

/* ТЕСТ */
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

/* ПЕРЕКЛЮЧЕНИЕ МЕЖДУ РЕЖИМАМИ */
function switchToCards() {
  cardsSection.classList.remove("hidden");
  testSection.classList.add("hidden");
  presentationSection.classList.add("hidden");
  cardsModeBtn.classList.add("active");
  testModeBtn.classList.remove("active");
  presentationModeBtn.classList.remove("active");
}

function switchToTest() {
  cardsSection.classList.add("hidden");
  testSection.classList.remove("hidden");
  presentationSection.classList.add("hidden");
  testModeBtn.classList.add("active");
  cardsModeBtn.classList.remove("active");
  presentationModeBtn.classList.remove("active");
  
  if (testQuestions.length) {
    resetTestUI();
  }
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

typingModeBtn.onclick = toggleTypingMode;
checkTypingBtn.onclick = checkTypingAnswer;

typingInput.onkeypress = (e) => {
  if (e.key === "Enter") {
    checkTypingAnswer();
  }
};

presentationModeBtn.onclick = startPresentationMode;
presentationExitBtn.onclick = exitPresentation;
presentationPauseBtn.onclick = pausePresentation;
presentationStopBtn.onclick = stopPresentation;
toggleSidebarBtn.onclick = toggleSidebar;

cardsModeBtn.onclick = switchToCards;
testModeBtn.onclick = switchToTest;

nextQuestionBtn.onclick = nextTestQuestion;
restartTestBtn.onclick = restartTest;

// Аудио кнопки
if (speakCardBtn) speakCardBtn.onclick = speakCardWord;
if (speakPresentationBtn) speakPresentationBtn.onclick = speakPresentationWord;
if (speakTestBtn) speakTestBtn.onclick = speakTestWord;
if (toggleSoundBtn) toggleSoundBtn.onclick = toggleSound;

loadWords();
