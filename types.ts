export interface Guess {
  word: string;
  score: number;
}

declare global {
  interface Window {
    furdle: any;
  }
}
