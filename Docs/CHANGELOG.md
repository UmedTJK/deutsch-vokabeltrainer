# Changelog

https://umedtjk.github.io/deutsch-vokabeltrainer/

## [2.1.0] - 2026-03-28

### Added
- **Complete Dashboard Redesign**: Modern landing page with statistics and mode selection
  - Statistics cards showing total words, known, learning, and progress percentage
  - Mode selection cards with descriptions and feature badges
  - Clean navigation with back buttons on all mode screens
- **Responsive Design**: Fully adaptive layout for mobile, tablet, and desktop devices
- **Visual Feedback**: Smooth animations and hover effects on all interactive elements

### Changed
- **Separate Screens**: Each learning mode now has its own dedicated screen
  - Cards mode with integrated typing mode toggle
  - Test mode with clean question interface
  - Presentation mode with improved layout
- **Presentation Mode UI**: 
  - Darker button backgrounds for better contrast (rgba(0,0,0,0.7))
  - Added box shadows for better visual separation
  - Added padding-top to sidebar to prevent button overlap
  - Improved hover effects on all controls
- **CSS Architecture**: Extracted all styles to separate `styles.css` file for better maintainability

### Fixed
- Presentation mode sidebar overlapping issues
- Button visibility on white sidebar background
- Layout issues on mobile devices
- Progress bar animation on pause/resume
- Word wrapping for long text in presentation mode

### Improved
- Visual hierarchy and spacing throughout the application
- Typography and color consistency
- User experience with clear mode descriptions
- Loading feedback and error handling

## [2.0.0] - 2026-03-27

### Added
- **Typing Mode**: Manual input with auto-check and feedback
- **Presentation Mode**: Fullscreen word slideshow
  - 11 seconds per word for comfortable viewing
  - Large fonts (96px word, 72px translation, 32px examples)
  - Fade-only animations (no eye-straining movement)
  - Progress bar with visual feedback
  - Pause/Stop controls
  - Sidebar with word list for easy navigation

### Changed
- Improved presentation mode UX for viewing from distance (1-2 meters)
- Increased presentation interval from 8 to 11 seconds
- Optimized animations: only opacity transitions

### Fixed
- Eye strain issues in presentation mode
- Font sizes for better readability

### Features
- Four learning modes: Cards, Test, Typing, Presentation
- LocalStorage progress saving
- Search and filter functionality
- Auto-next option
- Text-to-speech support (Web Speech API)

## [1.0.0] - 2026-03-20

### Initial Release
- Basic flashcards with DE ↔ RU direction
- Test mode with multiple choice questions
- Progress tracking with localStorage
- Word sets for Tag 1, Tag 2, Tag 3
