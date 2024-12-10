import { Guess } from "@/components/Guess";
import { supabase } from "@/utils/supabase/server";
import React from "react";

export const dynamic = "force-dynamic";

export default async function Logs() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("id", { ascending: false })
    .limit(50);

  if (error) {
    return <div>Error fetching logs: {error.message}</div>;
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mt-10">
      <ul className="flex flex-col gap-8">
        {data.map((game) => (
          <li className="flex flex-col gap-2" key={game.id}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Guess
                  key={index}
                  word={game.guesses.split(",")[index]}
                  code={game.scores.split(",")[index]}
                />
              ))}
            <div />
            <Guess word={game.correct_word} code="22222" />
          </li>
        ))}
      </ul>
    </div>
  );
}
