import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase/server";
import { toTrinary } from "@/utils";
import { Guess } from "@/types";

interface Log {
  guesses: Guess[];
  correctWord: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { guesses, correctWord } = JSON.parse(req.body) as Log
  const { error } = await supabase.from("games").insert({
    guesses: guesses.map((guess) => guess.word).join(","),
    scores: guesses.map((guess) => toTrinary(guess.score)).join(","),
    correct_word: correctWord,
  });
  console.log(error);
  res.status(200).json({});
}
