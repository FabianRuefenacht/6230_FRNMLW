"use client";
import React from "react";


const Button = ({ text, clickFunc }: { text: string; clickFunc?: () => void }) => {
  return (
    <main>
      <p>
        <button
          onClick={clickFunc}
          className="whitespace-nowrap px-2 py-2 bg-zinc-800 hover:bg-zinc-700 my-1 border-2 rounded-lg border-zinc-400 w-full"
        >
          {text}
        </button>
      </p>
    </main>
  );
};

export default Button;
