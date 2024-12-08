import { LetterStatus } from "./furdleMachine";

type Code =
  `${LetterStatus}${LetterStatus}${LetterStatus}${LetterStatus}${LetterStatus}`;
/**
 * 0 => 00000
 * 1 => 00001
 * 2 => 00002
 * 3 => 00010
 * function to convert a number to trinary (base 3)
 */
export function toTrinary(num: number): Code {
  if (num > 243) {
    throw new Error("Value cannot be greater than 243");
  }
  if (num === 0) return "00000";
  let result = "";
  let n = num;
  while (n > 0) {
    result = (n % 3).toString() + result;
    n = Math.floor(n / 3);
  }
  return result.padStart(5, "0") as Code;
}

export function fromTrinary(trinary: string) {
  return trinary.split("").reduceRight((acc, char, index) => {
    return acc + Math.pow(3, 4 - index) * Number(char);
  }, 0);
}

export function calculateScore(guess: string, word: string) {
  const trinaryForm = guess
    .split("")
    .map((char, index) => {
      if (char === word[index]) return "2";
      if (word.includes(char)) return "1";
      return "0";
    })
    .join("");
  return trinaryForm;
}
