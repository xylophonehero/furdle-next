"use client";

import words from "@/words.json";
import { furdleMachine } from "@/furdleMachine";
import { toTrinary } from "@/utils";
import { useActor } from "@xstate/react";
import React, { useEffect } from "react";
import { Guess } from "./Guess";
import { Keyboard } from "./Keyboard";

const getBlacklistedWords = (): string[] => {
  try {
    const blacklistedWords = window.localStorage.getItem(
      "furdle-blacklisted-words",
    );
    if (blacklistedWords) {
      return JSON.parse(blacklistedWords);
    }
    return [];
  } catch {
    return [];
  }
};

const getSavedGame = () => {
  try {
    const savedGame = window.localStorage.getItem("furdle-saved-game");
    if (savedGame) {
      return JSON.parse(savedGame);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

function Furdle() {
  const [snapshot, send, actor] = useActor(
    furdleMachine.provide({
      actions: {
        storeGame: () => {
          window.localStorage.setItem(
            "furdle-saved-game",
            JSON.stringify(actor.getPersistedSnapshot()),
          );
        },
      },
    }),
    {
      snapshot: getSavedGame(),
      input: {
        allowedWords: words as string[],
        blacklistedWords: getBlacklistedWords(),
      },
    },
  );
  const {
    didWin,
    errorText,
    currentGuess,
    guesses,
    letterStatus,
    correctWord,
  } = snapshot.context;

  useEffect(() => {
    if (window.location.href.includes("localhost")) window.furdle = actor;
  }, [actor]);

  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-8 justify-center max-w-lg self-center w-full">
      <div className="flex flex-col justify-center gap-2 w-full grow md:grow-0">
        {Array(6)
          .fill(0)
          .map((_, index) => {
            if (guesses.length === index)
              return <Guess key={index} word={currentGuess} />;
            const guess = guesses[index];
            if (!guess) return <Guess key={index} word="" />;
            return (
              <Guess
                key={index}
                word={guess.word}
                code={toTrinary(guess.score)}
              />
            );
          })}
      </div>
      <div className="h-10 flex justify-center">
        {errorText && (
          <div className="bg-red-600 text-white flex items-center px-4 rounded">
            {errorText}
          </div>
        )}
        {snapshot.matches("complete") && (
          <div className="flex gap-4">
            {didWin ? (
              <div className="bg-green-600 text-white flex items-center px-4 rounded">
                You win!
              </div>
            ) : (
              <div className="bg-orange-500 text-white flex items-center px-4 rounded">
                You lose!. The word was {correctWord}
              </div>
            )}
            <button
              className="border border-gray-400 px-2 rounded hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Play again?
            </button>
          </div>
        )}
      </div>
      <Keyboard
        letterStatus={letterStatus}
        onKeyPress={(key) => {
          if (key === "ENTER") {
            send({ type: "guess.submit" });
          } else if (key === "DELETE") {
            send({ type: "guess.delete" });
          } else {
            send({ type: "guess.letter", letter: key });
          }
        }}
      />
    </div>
  );
}

export default Furdle;
