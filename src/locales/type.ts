export interface TranslationDict {
  welcome: { title: string; description: string; start: string, viewRanking: string, footer: string };
  loading: { questions: string };
  quiz: { title: string; questionImageAlt: string; next: string; finish: string };
  result: { score: string; playAgain: string };
  ranking: {
    brand: string;
    title: string;
    description: string;
    backHome: string;
    players: string;
    accuracy: string;
    bestTime: string;
    loading: string;
    empty: string;
    invalidData: string;
    loadError: string;
    noData: string;
    rank: string;
    playerName: string;
    correctTotal: string;
    time: string;
    playedAt: string;
    currentUser: string;
    currentPosition: string;
    dateLocale: string;
  };
}
