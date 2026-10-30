export interface VocabItem {
  word: string;
  article?: string;
  translation: string;
  example: string;
  level: 'A1' | 'A2' | 'B1';
}

export interface MatchingPair {
  id: string;
  german: string;
  english: string;
}

export interface MatchingExercise {
  title: string;
  instruction: string;
  pairs: MatchingPair[];
}

export interface FillBlankItem {
  id: string;
  prompt: string;
  sentenceParts: [string, string]; // e.g. ["Guten ", "! Wie geht es Ihnen?"]
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

export interface LevelLessonData {
  id: 'a1' | 'a2' | 'b1';
  levelCode: 'A1' | 'A2' | 'B1';
  title: string;
  badge: string;
  description: string;
  milestonesTotal: number;
  milestonesCompleted: number;
  unlocked: boolean;
  vocab: VocabItem[];
  matching: MatchingExercise;
  fillBlank: FillBlankItem[];
}

export type LessonData = LevelLessonData;

export const germanLessons: Record<'a1' | 'a2' | 'b1', LevelLessonData> = {
  a1: {
    id: 'a1',
    levelCode: 'A1',
    title: 'A1: Foundations & Daily Essentials',
    badge: 'Beginner Track',
    description: 'Master everyday survival phrases, definite articles (der, die, das), greetings, and simple workplace etiquette.',
    milestonesTotal: 4,
    milestonesCompleted: 4,
    unlocked: true,
    vocab: [
      {
        word: 'Guten Tag',
        translation: 'Good day / Hello',
        example: 'Guten Tag, wie kann ich Ihnen heute helfen?',
        level: 'A1',
      },
      {
        word: 'Danke schön',
        translation: 'Thank you very much',
        example: 'Danke schön für die freundliche Unterstützung.',
        level: 'A1',
      },
      {
        word: 'Bitte',
        translation: "Please / You're welcome",
        example: 'Einen Kaffee mit Milch, bitte.',
        level: 'A1',
      },
      {
        word: 'Auf Wiedersehen',
        translation: 'Goodbye (formal)',
        example: 'Auf Wiedersehen, bis zum nächsten Termin.',
        level: 'A1',
      },
      {
        word: 'Der Kollege',
        article: 'der',
        translation: 'The male colleague',
        example: 'Mein neuer Kollege heißt Florian.',
        level: 'A1',
      },
      {
        word: 'Die Besprechung',
        article: 'die',
        translation: 'The meeting / conference',
        example: 'Die Besprechung beginnt pünktlich um 10:00 Uhr.',
        level: 'A1',
      },
    ],
    matching: {
      title: 'Vocabulary Pairing Drill',
      instruction: 'Match each German phrase with its correct English meaning.',
      pairs: [
        { id: 'm1', german: 'Guten Tag', english: 'Good day / Hello' },
        { id: 'm2', german: 'Auf Wiedersehen', english: 'Goodbye' },
        { id: 'm3', german: 'Die Besprechung', english: 'The meeting' },
        { id: 'm4', german: 'Danke schön', english: 'Thank you very much' },
      ],
    },
    fillBlank: [
      {
        id: 'fb1',
        prompt: 'Morning Greeting',
        sentenceParts: ['', ' Morgen! Wie geht es Ihnen heute?'],
        correctAnswer: 'Guten',
        acceptedAnswers: ['guten'],
        hint: 'Greeting adjective meaning "Good"',
        explanation: 'In standard German greetings, use "Guten Morgen" with capital G.',
      },
      {
        id: 'fb2',
        prompt: 'Polite Order',
        sentenceParts: ['Ein Glas Wasser, ', ', vielen Dank.'],
        correctAnswer: 'bitte',
        acceptedAnswers: ['Bitte'],
        hint: 'Magic polite word for please',
        explanation: '"Bitte" translates to please when placing a polite request.',
      },
      {
        id: 'fb3',
        prompt: 'Workplace Noun',
        sentenceParts: ['Die tägliche ', ' findet im Raum 4 statt.'],
        correctAnswer: 'Besprechung',
        acceptedAnswers: ['besprechung'],
        hint: 'German noun for meeting/discussion',
        explanation: '"Die Besprechung" is a feminine noun ending in -ung.',
      },
    ],
  },
  a2: {
    id: 'a2',
    levelCode: 'A2',
    title: 'A2: Workplace Communication & Routines',
    badge: 'Elementary Track',
    description: 'Draft professional emails, manage schedules, coordinate with colleagues, and navigate office protocols.',
    milestonesTotal: 5,
    milestonesCompleted: 3,
    unlocked: true,
    vocab: [
      {
        word: 'Der Feierabend',
        article: 'der',
        translation: 'End of the workday',
        example: 'Ich wünsche allen einen erholsamen Feierabend!',
        level: 'A2',
      },
      {
        word: 'Die Frist',
        article: 'die',
        translation: 'The deadline',
        example: 'Können wir die Frist bis Freitag einhalten?',
        level: 'A2',
      },
      {
        word: 'Die Rückmeldung',
        article: 'die',
        translation: 'The feedback / reply',
        example: 'Vielen Dank für Ihre zeitnahe Rückmeldung.',
        level: 'A2',
      },
      {
        word: 'Der Termin',
        article: 'der',
        translation: 'The appointment / slot',
        example: 'Lassen Sie uns einen Termin für das Review vereinbaren.',
        level: 'A2',
      },
      {
        word: 'Die Vereinbarung',
        article: 'die',
        translation: 'The agreement',
        example: 'Die Vereinbarung wurde von beiden Seiten unterzeichnet.',
        level: 'A2',
      },
    ],
    matching: {
      title: 'Office Terms Match',
      instruction: 'Connect the workplace term with its practical definition.',
      pairs: [
        { id: 'm1', german: 'Der Feierabend', english: 'End of workday' },
        { id: 'm2', german: 'Die Frist', english: 'The deadline' },
        { id: 'm3', german: 'Die Rückmeldung', english: 'The feedback / reply' },
        { id: 'm4', german: 'Der Termin', english: 'The appointment' },
      ],
    },
    fillBlank: [
      {
        id: 'fb1',
        prompt: 'Closing Workday',
        sentenceParts: ['Schönen ', ' allerseits, bis morgen!'],
        correctAnswer: 'Feierabend',
        acceptedAnswers: ['feierabend'],
        hint: 'Famous German word for after-work hours',
        explanation: '"Der Feierabend" is the quintessential German term for clocking off.',
      },
      {
        id: 'fb2',
        prompt: 'Meeting Deadline',
        sentenceParts: ['Wir müssen die ', ' unbedingt bis Mittwoch einhalten.'],
        correctAnswer: 'Frist',
        acceptedAnswers: ['frist'],
        hint: 'Feminine noun for deadline',
        explanation: '"Die Frist" designates a time limit or project deadline.',
      },
      {
        id: 'fb3',
        prompt: 'Calendar Booking',
        sentenceParts: ['Können wir diesen ', ' auf nächste Woche verschieben?'],
        correctAnswer: 'Termin',
        acceptedAnswers: ['termin'],
        hint: 'Calendar appointment',
        explanation: '"Der Termin" is an appointment or scheduled meeting time.',
      },
    ],
  },
  b1: {
    id: 'b1',
    levelCode: 'B1',
    title: 'B1: Professional Fluency & Complex Projects',
    badge: 'Intermediate Track',
    description: 'Negotiate project scopes, explain rationale, lead retrospectives, and compose detailed business communication.',
    milestonesTotal: 6,
    milestonesCompleted: 2,
    unlocked: true,
    vocab: [
      {
        word: 'Die Verantwortung',
        article: 'die',
        translation: 'The responsibility',
        example: 'Sie übernimmt die volle Verantwortung für den Rollout.',
        level: 'B1',
      },
      {
        word: 'Der Meilenstein',
        article: 'der',
        translation: 'The milestone',
        example: 'Wir haben den dritten Meilenstein erfolgreich abgeschlossen.',
        level: 'B1',
      },
      {
        word: 'Die Zusammenarbeit',
        article: 'die',
        translation: 'The collaboration',
        example: 'Herzlichen Dank für die hervorragende Zusammenarbeit.',
        level: 'B1',
      },
      {
        word: 'Die Herausforderung',
        article: 'die',
        translation: 'The challenge',
        example: 'Das Projekt bringt einige technische Herausforderungen mit sich.',
        level: 'B1',
      },
      {
        word: 'Die Entscheidung',
        article: 'die',
        translation: 'The decision',
        example: 'Das Management hat heute eine strategische Entscheidung getroffen.',
        level: 'B1',
      },
    ],
    matching: {
      title: 'Executive German Matching',
      instruction: 'Pair the advanced business German terms with their English equivalents.',
      pairs: [
        { id: 'm1', german: 'Die Verantwortung', english: 'The responsibility' },
        { id: 'm2', german: 'Der Meilenstein', english: 'The milestone' },
        { id: 'm3', german: 'Die Zusammenarbeit', english: 'The collaboration' },
        { id: 'm4', german: 'Die Herausforderung', english: 'The challenge' },
      ],
    },
    fillBlank: [
      {
        id: 'fb1',
        prompt: 'Accountability',
        sentenceParts: ['Das Team übernimmt die gemeinsame ', ' für den Erfolg.'],
        correctAnswer: 'Verantwortung',
        acceptedAnswers: ['verantwortung'],
        hint: 'Feminine noun for responsibility/ownership',
        explanation: '"Die Verantwortung" signifies accountability and responsibility.',
      },
      {
        id: 'fb2',
        prompt: 'Project Milestone',
        sentenceParts: ['Ein entscheidender ', ' wurde heute im Sprint erreicht.'],
        correctAnswer: 'Meilenstein',
        acceptedAnswers: ['meilenstein'],
        hint: 'Compound noun: mile + stone',
        explanation: '"Der Meilenstein" indicates a key checkpoint or milestone.',
      },
      {
        id: 'fb3',
        prompt: 'Partnership',
        sentenceParts: ['Wir freuen uns auf eine erfolgreiche ', ' mit Ihnen.'],
        correctAnswer: 'Zusammenarbeit',
        acceptedAnswers: ['zusammenarbeit'],
        hint: 'Collaboration or working together',
        explanation: '"Die Zusammenarbeit" refers to cooperative teamwork or partnership.',
      },
    ],
  },
};
