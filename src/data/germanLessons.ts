export const germanLessons = {
  a1: {
    vocab: [
      { word: 'Hallo', translation: 'Hello' },
      { word: 'Tschüss', translation: 'Goodbye' },
      { word: 'Bitte', translation: 'Please / You’re welcome' },
      { word: 'Danke', translation: 'Thank you' },
    ],
    matching: [
      {
        question: 'Translate "Hello"',
        options: ['Hallo', 'Tschüss', 'Bitte', 'Danke'],
        answer: 'Hallo',
      },
    ],
    fillBlank: [
      { sentence: '____! (Good morning)', answer: 'Guten Morgen' },
    ],
  },
  a2: {
    vocab: [
      { word: 'Arbeit', translation: 'Work' },
      { word: 'Büro', translation: 'Office' },
      { word: 'Meeting', translation: 'Meeting' },
    ],
    matching: [
      {
        question: 'Translate "Office"',
        options: ['Arbeit', 'Büro', 'Meeting'],
        answer: 'Büro',
      },
    ],
    fillBlank: [
      { sentence: 'Ich gehe ins ____.', answer: 'Büro' },
    ],
  },
  b1: {
    vocab: [
      { word: 'Verantwortung', translation: 'Responsibility' },
      { word: 'Projekt', translation: 'Project' },
      { word: 'Deadline', translation: 'Deadline' },
    ],
    matching: [
      {
        question: 'Translate "Project"',
        options: ['Verantwortung', 'Projekt', 'Deadline'],
        answer: 'Projekt',
      },
    ],
    fillBlank: [
      { sentence: 'Die ____ ist nächste Woche.', answer: 'Deadline' },
    ],
  },
};
