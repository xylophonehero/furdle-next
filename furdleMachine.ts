import {
  assign,
  enqueueActions,
  fromCallback,
  fromPromise,
  not,
  setup,
  spawnChild,
} from "xstate";
import { calculateScore, fromTrinary, toTrinary } from "./utils";

import guessesFile from "./guesses.json";
import { Guess } from "./types";
const guesses = guessesFile as string[];

export type LetterStatus = "0" | "1" | "2";

interface FurdleMachineInput {
  allowedWords: string[];
  blacklistedWords: string[];
}

interface FurdleMachineContext extends FurdleMachineInput {
  didWin: boolean;
  correctWord: string;
  currentGuess: string;
  guesses: Guess[];
  letterStatus: Record<string, LetterStatus>;
  errorText: string;
}

type FurdleMachineEvents =
  | { type: "guess.submit" }
  | { type: "guess.delete" }
  | { type: "guess.letter"; letter: string }
  | { type: "beforeunload" };

export const furdleMachine = setup({
  types: {} as {
    context: FurdleMachineContext;
    events: FurdleMachineEvents;
    input: FurdleMachineInput;
  },
  actions: {
    storeGame: () => {},
    deleteSavedGame: () => {
      window.localStorage.removeItem("furdle-saved-game");
    },
    blacklistWord: ({ context }) => {
      window.localStorage.setItem(
        "furdle-blacklisted-words",
        JSON.stringify(
          [context.correctWord, ...context.blacklistedWords].slice(0, 100),
        ),
      );
    },
  },
  actors: {
    logGame: fromPromise(({ input }) =>
      fetch("/api/log-game", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    ),
    keyboard: fromCallback(({ sendBack }) => {
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
          return;
        }
        if (event.key === "Enter") {
          sendBack({ type: "guess.submit" });
        } else if (event.key === "Backspace") {
          sendBack({ type: "guess.delete" });
        } else if (event.key.match(/^[a-z]$/)) {
          sendBack({ type: "guess.letter", letter: event.key.toLowerCase() });
        }
      };
      document.addEventListener("keydown", handleKeydown);
      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }),
    reloadListener: fromCallback(({ sendBack }) => {
      window.addEventListener("beforeunload", sendBack);
      return () => {
        window.removeEventListener("beforeunload", sendBack);
      };
    }),
  },
  guards: {
    wordCorrectLength: ({ context }) => context.currentGuess.length === 5,
    wordOnList: ({ context }) => guesses.includes(context.currentGuess),
    isPreviousGuess: ({ context }) =>
      context.guesses.some((guess) => guess.word === context.currentGuess),
    outOfGuesses: ({ context }) => context.guesses.length === 6,
    correctWord: ({ context }) => context.guesses.at(-1)?.score === 242,
  },
}).createMachine({
  id: "furdle",
  context: ({ input }) => ({
    didWin: false,
    correctWord: "",
    currentGuess: "",
    guesses: [],
    allowedWords: input.allowedWords.filter(
      (word) => !input.blacklistedWords.includes(word),
    ),
    blacklistedWords: input.blacklistedWords,
    letterStatus: {},
    errorText: "",
  }),
  initial: "playing",
  states: {
    playing: {
      invoke: [
        {
          src: "keyboard",
        },
        {
          src: "reloadListener",
        },
      ],
      on: {
        beforeunload: {
          actions: "storeGame",
        },
      },
      initial: "guessing",
      states: {
        guessing: {
          on: {
            "guess.letter": {
              guard: ({ context }) => context.currentGuess.length < 5,
              actions: assign({
                currentGuess: ({ context, event }) =>
                  context.currentGuess + event.letter[0],
                errorText: "",
              }),
            },
            "guess.delete": {
              actions: assign({
                currentGuess: ({ context }) =>
                  context.currentGuess.slice(0, -1),
                errorText: "",
              }),
            },
            "guess.submit": {
              target: "processing",
            },
          },
        },
        processing: {
          always: [
            {
              actions: assign({ errorText: "Incorrect word length" }),
              guard: not("wordCorrectLength"),
              target: "guessing",
            },
            {
              actions: assign({ errorText: "Not a valid word" }),
              guard: not("wordOnList"),
              target: "guessing",
            },
            {
              actions: assign({ errorText: "You already guessed this word" }),
              guard: "isPreviousGuess",
              target: "guessing",
            },
            {
              actions: enqueueActions(({ context, enqueue }) => {
                const data: string[][] = Array(243)
                  .fill(0)
                  .map(() => []);
                context.allowedWords.forEach((word) => {
                  const score = calculateScore(context.currentGuess, word);
                  data[fromTrinary(score)].push(word);
                });
                let maxIndex = 0;
                let max = 0;
                data.forEach((row, index) => {
                  if (row.length > max) {
                    max = row.length;
                    maxIndex = index;
                  }
                });
                enqueue.assign({
                  allowedWords: data[maxIndex],
                  guesses: [
                    ...context.guesses,
                    { word: context.currentGuess, score: maxIndex },
                  ],
                  currentGuess: "",
                  letterStatus: {
                    ...context.letterStatus,
                    ...Object.fromEntries(
                      context.currentGuess
                        .split("")
                        .map((w, index) => [
                          w,
                          toTrinary(maxIndex)[index] as LetterStatus,
                        ]),
                    ),
                  },
                });
              }),
              target: "postProcessing",
            },
          ],
        },
        postProcessing: {
          entry: [],
          always: [
            {
              actions: assign({
                didWin: true,
                correctWord: ({ context }) =>
                  context.guesses.at(-1)?.word ?? "",
              }),
              guard: "correctWord",
              target: "#complete",
            },
            {
              actions: assign({
                correctWord: ({ context }) =>
                  context.allowedWords[
                    Math.floor(Math.random() * context.allowedWords.length)
                  ],
              }),
              guard: "outOfGuesses",
              target: "#complete",
            },
            {
              target: "guessing",
            },
          ],
        },
      },
    },
    complete: {
      entry: [
        "blacklistWord",
        "deleteSavedGame",
        spawnChild("logGame", {
          input: ({ context }) => ({
            guesses: context.guesses,
          }),
        }),
      ],
      id: "complete",
    },
  },
});
