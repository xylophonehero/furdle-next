import { LetterStatus } from "@/furdleMachine";
import { cva, cx } from "class-variance-authority";
import React from "react";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const keyStyles = cva(
  "uppercase text-white font-bold grid place-items-center rounded flex-1 py-2.5",
  {
    variants: {
      correctness: {
        "2": "bg-green-500",
        "1": "bg-yellow-500",
        "0": "bg-gray-800",
        none: "bg-gray-500",
      },
    },
    defaultVariants: {
      correctness: "none",
    },
  },
);

export const Keyboard = ({
  onKeyPress,
  letterStatus,
}: {
  onKeyPress: (key: string) => void;
  letterStatus: Record<string, LetterStatus>;
}) => {
  return (
    <div className="flex flex-col items-stretch gap-2 w-full">
      {keys.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cx("flex gap-2 grow", rowIndex === 1 && "px-4")}
        >
          {rowIndex === 2 && (
            <button
              className={cx(keyStyles(), "text-xs grow-[1.5]")}
              onClick={() => onKeyPress("ENTER")}
            >
              ENTER
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              className={keyStyles({
                correctness: letterStatus[key] ?? "none",
              })}
              onClick={() => onKeyPress(key)}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              className={cx(keyStyles(), "grow-[1.3]")}
              onClick={() => onKeyPress("DELETE")}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                data-testid="icon-backspace"
              >
                <path
                  fill="currentColor"
                  d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
                ></path>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
