//
//  PROJECT.md.swift
//  
//
//  Created by SUM TJK on 27.03.26.
//

# German B2 Beruf Trainer

## 📖 О проекте
Локальный веб-тренажёр для изучения немецких слов (уровень B2 Beruf). Работает полностью в браузере, без сервера и баз данных. Данные хранятся в JSON файлах, прогресс — в localStorage.

## 🎯 Цель проекта
Создать быстрый, удобный и эффективный инструмент для ежедневного изучения немецкой лексики, который можно использовать на любом устройстве.

## 🛠 Технологии
- **HTML5** — структура
- **CSS3** — стилизация (без фреймворков)
- **Vanilla JavaScript** — вся логика
- **LocalStorage** — сохранение прогресса
- **GitHub Pages** — хостинг

## 📁 Структура проекта
```
deutsch-vokabeltrainer/
├── index.html              # Главная страница (вся разметка)
├── app.js                  # Вся логика приложения
├── data/                   # Папка с JSON файлами слов
│   ├── tag1.json           # Набор слов Tag 1 (глаголы с Dativ/Genitiv)
│   ├── tag2.json           # Набор слов Tag 2 (глаголы с управлением)
│   └── tag3.json           # Набор слов Tag 3 (можно пополнять)
├── Docs/
│   └── CHANGELOG.md        # История изменений
└── PROJECT.md              # Этот файл
```

## 📦 Формат данных JSON
```json
[
  {
    "word": "gelingen",
    "translation": "удаваться",
    "example_de": "Dieser Kuchen gelingt mir immer besonders gut.",
    "example_ru": "Этот пирог у меня всегда особенно хорошо получается."
  }
]
```

## 🧠 Архитектура приложения

### Глобальные переменные (app.js)
```javascript
// Основные данные
let words = [];              // Все слова текущего набора
let filteredWords = [];      // Отфильтрованные слова (поиск/сложные)
let isFilteredMode = false;  // Флаг фильтрации
let currentCardIndex = 0;    // Текущий индекс в карточках

// Режимы
let cardMode = "de-to-ru";    // Направление: de-to-ru / ru-to-de
let typingModeActive = false; // Режим ввода

// Данные теста
let testQuestions = [];
let currentTestIndex = 0;
let score = 0;
let answered = false;

// Режим презентации
let presentationModeActive = false;
let presentationWordsList = [];
let presentationCurrentIndex = 0;
let presentationInterval = 11000;  // 11 секунд
let presentationPaused = false;
```

### Основные функции

#### Управление данными
- `loadWords()` — загрузка JSON из data/ по выбранному дню
- `saveProgress(day, words)` — сохранение статусов слов в localStorage
- `loadProgress(day, words)` — загрузка сохранённого прогресса

#### Карточки
- `showCard()` — отображение текущей карточки
- `markWord(status)` — отметка "знаю/не знаю"
- `showNextCard()` / `showPrevCard()` — навигация

#### Режим ввода
- `toggleTypingMode()` — включение/выключение
- `checkTypingAnswer()` — проверка введённого перевода
- `prepareTypingMode()` — подготовка для текущего слова

#### Тест
- `createTestQuestions()` — генерация вопросов с вариантами
- `showTestQuestion()` — отображение текущего вопроса
- `handleTestAnswer()` — обработка ответа

#### Режим презентации
- `startPresentationMode()` — запуск полноэкранного режима
- `showPresentationSlide()` — отображение текущего слайда
- `startProgressBar()` — анимация прогресс-бара
- `pausePresentation()` / `stopPresentation()` — управление

### Ключевые особенности

#### 1. Три режима обучения
- **Карточки**: классический режим с кнопками "знаю/не знаю"
- **Тест**: множественный выбор (4 варианта)
- **Режим ввода**: ручной ввод перевода с проверкой
- **Режим презентации**: автоматический показ слов (11 сек, крупные шрифты)

#### 2. Фильтрация и поиск
- Поиск по немецкому слову и переводу
- Фильтр "только сложные слова" (status === "unknown")
- Случайное слово

#### 3. Сохранение прогресса
- Ключ в localStorage: `germanTrainerProgress`
- Структура: `{ "tag1": { "gelingen": "known", ... } }`
- Статусы: `"known"`, `"unknown"`, `null` (новое слово)

#### 4. Режим презентации (v2.0)
- Полноэкранный режим с фиксированным позиционированием
- Крупные шрифты: слово 96px, перевод 72px, примеры 32px
- Интервал: 11 секунд на слово
- Анимация: только opacity (без движения)
- Прогресс-бар внизу экрана
- Управление: пауза, остановка, выход

## 🎨 CSS классы

### Основные
- `.hidden` — скрытие элементов
- `.active` — активная кнопка режима
- `.panel` — общий стиль для панелей

### Режим презентации
- `.presentation-panel` — полноэкранный контейнер
- `.presentation-word` — слово (96px)
- `.presentation-translation` — перевод (72px)
- `.presentation-examples` — примеры (32px)
- `.presentation-progress-bar` — индикатор прогресса

## 🔧 Работа с localStorage

### Ключи
- `germanTrainerProgress` — прогресс изучения слов
- `germanFlashStats` — статистика презентации (не используется)

### Формат прогресса
```javascript
{
  "tag1": {
    "gelingen": "known",
    "abraten": "unknown",
    "antworten": null
  }
}
```

## 🚀 Как добавить новый набор слов

1. Создать файл `data/tag4.json`
2. Добавить в `index.html` новый option в select:
   ```html
   <option value="tag4">Tag 4</option>
   ```
3. Добавить слова в формате:
   ```json
   [
     {
       "word": "слово",
       "translation": "перевод",
       "example_de": "пример на немецком",
       "example_ru": "пример на русском"
     }
   ]
   ```

## 🔄 Рабочий процесс для AI-агентов

### При добавлении новой функции:
1. Добавить HTML элементы в `index.html`
2. Добавить CSS стили в `<style>` секцию
3. Добавить JavaScript переменные и функции в `app.js`
4. Добавить обработчики событий в конец `app.js`
5. Убедиться, что функция `loadWords()` не нарушена

### Важные правила:
- Не использовать внешние библиотеки/фреймворки
- Весь код в одном файле `app.js`
- Стили в одном файле `index.html`
- Сохранять обратную совместимость с существующими функциями
- Приоритет — чистота кода и читаемость

## 🐛 Частые проблемы и решения

1. **Слова не загружаются** → проверить путь к JSON в `loadWords()`
2. **Режим презентации не показывает все слова** → проверить `presentationWordsList = [...words]`
3. **Прогресс не сохраняется** → проверить ключ localStorage
4. **Таймер не останавливается** → очистить `presentationTimer` и `presentationAnimationFrame`
5. **Кнопки не реагируют** → проверить, что элементы найдены в DOM

## 📝 Соглашения по именованию

- **ID элементов**: `camelCase` с суффиксом (например, `presentationWord`, `flashSection`)
- **Переменные**: `camelCase` (например, `currentCardIndex`, `typingModeActive`)
- **Функции**: `camelCase` с глаголом (например, `showCard()`, `markWord()`)
- **Константы**: `UPPER_SNAKE_CASE` (например, `STORAGE_KEY`)

## 🔗 Полезные ссылки
- GitHub репозиторий: `https://github.com/UmedTJK/deutsch-vokabeltrainer`
- GitHub Pages: `https://umedtjk.github.io/deutsch-vokabeltrainer/`

---

**Последнее обновление:** 27 марта 2026  
**Версия:** 2.0.0
```
