import React from "react";
import { cva } from "class-variance-authority";

const keyStyles = cva(
  "uppercase aspect-square flex-1 max-w-12 sm:max-w-16 text-lg md:text-2xl grid place-items-center rounded-lg ring-gray-500 text-white font-bold text-center",
  {
    variants: {
      correctness: {
        "2": "bg-green-500",
        "1": "bg-yellow-500",
        "0": "bg-gray-500",
        none: "ring-1",
      },
    },
  },
);

export const Guess = ({ word, code = "" }: { word: string; code?: any }) => {
  return (
    <div className="flex justify-center w-full gap-2">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className={keyStyles({ correctness: code[index] ?? "none" })}
          >
            {word?.[index]}
          </div>
        ))}
    </div>
  );
};
