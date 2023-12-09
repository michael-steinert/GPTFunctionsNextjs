"use client";
import { ChangeEvent, FormEvent, useState } from "react";

interface ApiResponse {
  data: string[];
  type: "image" | "video" | "audio" | "text";
}

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [media, setMedia] = useState<{ type: string; data: string }>({
    type: "",
    data: "",
  });

  async function handleCallApi(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    try {
      if (!input) {
        return;
      }
      setMedia({ type: "", data: "" });
      const response: Response = await fetch("/api/gpt", {
        method: "POST",
        body: JSON.stringify({
          query: input,
        }),
      });
      const { data, type }: ApiResponse = await response.json();
      setMedia({ type, data: data[0] });
    } catch (error: any) {
      console.error(error);
    }
  }

  const renderMedia = () => {
    switch (media.type) {
      case "image":
        return <img src={media.data} alt="Generated" width="500px" />;
      case "video":
        return <video src={media.data} controls />;
      case "audio":
        return (
          <audio controls>
            <source src={media.data} type="audio/wav" />
          </audio>
        );
      case "text":
        return <p>{media.data}</p>;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <form onSubmit={handleCallApi}>
        <input
          className="text-black px-3 py-1 rounded"
          onChange={(changeEvent: ChangeEvent<HTMLInputElement>) =>
            setInput(changeEvent.target.value)
          }
        />
        <button
          type="submit"
          className="rounded-full bg-green-500 text-white py-3 px-14 mt-3 mb-4 cursor-pointer"
        >
          Generate Text, Image or Music
        </button>
      </form>
      {renderMedia()}
    </main>
  );
}
