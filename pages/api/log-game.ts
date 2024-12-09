import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase/server";
import { toTrinary } from "@/utils";
import { Guess } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const guesses = JSON.parse(req.body).guesses as Guess[];
  const { error } = await supabase.from("games").insert({
    guesses: guesses.map((guess) => guess.word).join(","),
    scores: guesses.map((guess) => toTrinary(guess.score)).join(","),
  });
  console.log(error);
  res.status(200).json({});
}
