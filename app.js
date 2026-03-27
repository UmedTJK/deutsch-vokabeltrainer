const daySelect = document.getElementById("daySelect");
const loadBtn = document.getElementById("loadBtn");

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
let currentCardIndex = 0;

let testQuestions = [];
let currentTestIndex = 0;
let score = 0;
let answered = false;

function saveProgress(day, words) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  stored[day] = words.map((word) => word.status);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function loadProgress(day, words) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (!stored || !stored[day]) {
    return words;
  }

  return words.map((word, index) => ({
    ...word,
    status: stored[day][index] || null
  }));
}

async function loadWords() {
  const selectedDay = daySelect.value;
  const filePath = `data/${selectedDay}.json`;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error("Не удалось загрузить JSON");
    }

    const loadedWords = await response.json();

    words = loadedWords.map((item) => ({
      ...item,
      status: null
    }));

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("Файл пустой или формат неверный");
    }

    words = loadProgress(selectedDay, words);

    currentCardIndex = 0;
    showCard();

    createTestQuestions();
    resetTestUI();

    alert(`Загружено слов: ${words.length}`);
  } catch (error) {
    console.error(error);
    alert("Ошибка при загрузке слов. Проверь JSON и локальный сервер.");
  }
}

function showCard() {
  if (words.length === 0) {
    cardWord.textContent = "Нет загруженных слов";
    cardsCounter.textContent = "Слово 0 / 0";
    cardAnswer.classList.add("hidden");
    updateWordStatus(null);
    return;
  }

  const currentWord = words[currentCardIndex];

  cardsCounter.textContent = `Слово ${currentCardIndex + 1} / ${words.length}`;
  cardWord.textContent = currentWord.word;
  cardTranslation.textContent = `Перевод: ${currentWord.translation}`;
  cardExampleDe.textContent = currentWord.example_de;
  cardExampleRu.textContent = currentWord.example_ru;

  updateWordStatus(currentWord.status);
  cardAnswer.classList.add("hidden");
}

function updateWordStatus(status) {
  if (status === "known") {
    wordStatus.textContent = "Статус: Знаю";
  } else if (status === "unknown") {
    wordStatus.textContent = "Статус: Не знаю";
  } else {
    wordStatus.textContent = "Статус: Пока не отмечено";
  }
}

function showPrevCard() {
  if (words.length === 0) return;

  if (currentCardIndex > 0) {
    currentCardIndex--;
    showCard();
  }
}

function showNextCard() {
  if (words.length === 0) return;

  if (currentCardIndex < words.length - 1) {
    currentCardIndex++;
    showCard();
  }
}

function markWordAsKnown() {
  if (words.length === 0) return;

  words[currentCardIndex].status = "known";
  updateWordStatus("known");
  saveProgress(daySelect.value, words);
}

function markWordAsUnknown() {
  if (words.length === 0) return;

  words[currentCardIndex].status = "unknown";
  updateWordStatus("unknown");
  saveProgress(daySelect.value, words);
}

function switchMode(mode) {
  if (mode === "cards") {
    cardsSection.classList.remove("hidden");
    testSection.classList.add("hidden");
    cardsModeBtn.classList.add("active");
    testModeBtn.classList.remove("active");
  } else {
    cardsSection.classList.add("hidden");
    testSection.classList.remove("hidden");
    cardsModeBtn.classList.remove("active");
    testModeBtn.classList.add("active");

    if (words.length > 0) {
      showTestQuestion();
    }
  }
}

function shuffleArray(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

function getRandomWrongAnswers(correctTranslation, allWords, count = 3) {
  const wrongOptions = allWords
    .map((item) => item.translation)
    .filter((translation) => translation !== correctTranslation);

  const shuffled = shuffleArray(wrongOptions);
  return shuffled.slice(0, count);
}

function createTestQuestions() {
  testQuestions = words.map((wordItem) => {
    const wrongAnswers = getRandomWrongAnswers(wordItem.translation, words, 3);
    const options = shuffleArray([wordItem.translation, ...wrongAnswers]);

    return {
      word: wordItem.word,
      correctAnswer: wordItem.translation,
      options: options
    };
  });

  testQuestions = shuffleArray(testQuestions);
  currentTestIndex = 0;
  score = 0;
  answered = false;
}

function showTestQuestion() {
  if (words.length === 0) {
    testWord.textContent = "Нет загруженных слов";
    testCounter.textContent = "Вопрос 0 / 0";
    answersContainer.innerHTML = "";
    return;
  }

  if (currentTestIndex >= testQuestions.length) {
    showFinalResult();
    return;
  }

  const currentQuestion = testQuestions[currentTestIndex];

  testCounter.textContent = `Вопрос ${currentTestIndex + 1} / ${testQuestions.length}`;
  testWord.textContent = currentQuestion.word;
  answersContainer.innerHTML = "";
  testMessage.textContent = "";
  nextQuestionBtn.classList.add("hidden");
  restartTestBtn.classList.add("hidden");
  resultBox.classList.add("hidden");
  answered = false;

  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.className = "answer-btn";
    button.addEventListener("click", () => checkAnswer(button, option));
    answersContainer.appendChild(button);
  });
}

function checkAnswer(clickedButton, selectedAnswer) {
  if (answered) return;

  answered = true;
  const currentQuestion = testQuestions[currentTestIndex];
  const answerButtons = document.querySelectorAll(".answer-btn");

  answerButtons.forEach((button) => {
    button.disabled = true;

    if (button.textContent === currentQuestion.correctAnswer) {
      button.classList.add("correct");
    }
  });

  if (selectedAnswer === currentQuestion.correctAnswer) {
    clickedButton.classList.add("correct");
    testMessage.textContent = "Правильно";
    score++;
  } else {
    clickedButton.classList.add("wrong");
    testMessage.textContent = `Неправильно. Верный ответ: ${currentQuestion.correctAnswer}`;
  }

  nextQuestionBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentTestIndex++;
  showTestQuestion();
}

function showFinalResult() {
  testWord.textContent = "Тест завершён";
  testCounter.textContent = `Итог: ${score} / ${testQuestions.length}`;
  answersContainer.innerHTML = "";
  testMessage.textContent = "";
  nextQuestionBtn.classList.add("hidden");
  restartTestBtn.classList.remove("hidden");
  resultBox.classList.remove("hidden");
  resultBox.textContent = `Ваш результат: ${score} из ${testQuestions.length}`;
}

function resetTestUI() {
  createTestQuestions();
  showTestQuestion();
}

showAnswerBtn.addEventListener("click", () => {
  cardAnswer.classList.remove("hidden");
});

prevBtn.addEventListener("click", showPrevCard);
nextBtn.addEventListener("click", showNextCard);

knowBtn.addEventListener("click", markWordAsKnown);
dontKnowBtn.addEventListener("click", markWordAsUnknown);

loadBtn.addEventListener("click", loadWords);

cardsModeBtn.addEventListener("click", () => switchMode("cards"));
testModeBtn.addEventListener("click", () => switchMode("test"));

nextQuestionBtn.addEventListener("click", nextQuestion);
restartTestBtn.addEventListener("click", resetTestUI);