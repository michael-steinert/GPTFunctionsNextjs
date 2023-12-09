import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

interface FunctionArgs {
  prompt: string;
  guidance_scale?: number;
  num_frames?: number;
  height?: number;
  width?: number;
}

interface ApiRequestData {
  model: string;
  messages: { role: string; content: string }[];
  functions: any[];
  function_call: string;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_TOKEN || "",
});

const KEY: string | undefined = process.env.OPENAI_API_KEY;
const BASE_URI: string = "https://api.openai.com/v1/chat/completions";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${KEY}`,
};

const data: ApiRequestData = {
  model: "gpt-4",
  messages: [],
  functions: [
    {
      name: "createVideo",
      description: "Generate a Video using Replicate, an AI LLM",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The Main Prompt that should be passed in to the LLM",
          },
          guidance_scale: {
            type: "integer",
            description:
              "This is the requested Guidance Scale for the Video in a numeric Value. Default to 17.5 if none is defined in the Prompt.",
          },
          num_frames: {
            type: "integer",
            description: "The Number of Frames if defined in the Prompt",
          },
          height: {
            type: "integer",
            description:
              "The Height of the Video if defined in the Prompt. Not affected by Resolution.",
          },
          width: {
            type: "integer",
            description:
              "The Width of the Video if defined in the Prompt. Not affected by Resolution.",
          },
        },
        required: ["prompt", "guidance_scale"],
      },
    },
    {
      name: "createMusic",
      description: "Generate Music using Replicate",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The exact Prompt passed in",
          },
        },
      },
    },
    {
      name: "createImage",
      description: "Generates an Image using Replicate",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The exact Prompt passed in",
          },
        },
      },
    },
  ],
  function_call: "auto",
};

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { query } = await req.json();
    data.messages = [{ role: "user", content: query }];
    const response = await fetch(BASE_URI, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const json = await response.json();
    let choice = json.choices[0];
    const { function_call } = choice.message;
    if (function_call) {
      const args: any = JSON.parse(function_call.arguments);
      let output: any;
      switch (function_call.name) {
        case "createVideo":
          output = await handleCreateVideo(args);
          return NextResponse.json({ data: output, type: "video" });
        case "createMusic":
          output = await handleCreateMusic(args);
          return NextResponse.json({ data: output, type: "audio" });
        case "createImage":
          output = await handleCreateImage(args);
          return NextResponse.json({ data: output, type: "image" });
        default:
          console.log("Not supported Function Call");
          break;
      }
    } else {
      return NextResponse.json({
        data: choice.message.content,
        type: "text",
      });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error });
  }
}

async function handleCreateVideo(args: any) {
  return await replicate.run(
    "anotherjesse/zeroscope-v2-xl:71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f",
    {
      input: {
        ...args,
      },
    }
  );
}

async function handleCreateMusic(args: any) {
  return await replicate.run(
    "joehoover/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
    {
      input: {
        model_version: "melody",
        ...args,
      },
    }
  );
}

async function handleCreateImage(args: any) {
  return await replicate.run(
    "ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f",
    {
      input: {
        ...args,
      },
    }
  );
}
