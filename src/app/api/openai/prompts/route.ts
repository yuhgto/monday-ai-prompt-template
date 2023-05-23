import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


async function isAuthorized(request: NextRequest) {
  try {
    const authorizationToken: string  = request?.headers.get('Authorization') ?? '';
    const clientSecret: string = process.env.CLIENT_SECRET ?? '';
    const payload = jwt.verify(authorizationToken, clientSecret);
    if (payload) {
      return true;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

// TODO: handle errors from openAI
async function getCompletionsFromOpenAi(prompts:string | string[], n: number) {
  try {
    const payload = {
      model: "text-davinci-003",
      prompt: prompts,
      n,
    }
    console.log(payload);
  const completionsFromApi = await openai
      .createCompletion(payload)
    return completionsFromApi.data.choices;
  } catch (err) {
    // @ts-ignore
    console.error('error from OpenAI:', err.response.data.error);
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const reqJson = await req.json();
  console.log(`A request was made. \nRequest:${JSON.stringify(reqJson)}`)
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "Not authorized", success: false }, 
      {status:401});
  } else if (!reqJson.items) {
    return NextResponse.json({'message': 'No items array supplied'}, {
      status: 400,
    })
  } else if (!reqJson.prompts) {
    return NextResponse.json({'message': 'No prompts given'}, {
      status: 400,
    })
  } else {
    const {items, prompts, n} = reqJson as {items: {id: string}[], prompts: string | string[], n: number};
    if (items.length === 0) {
      return NextResponse.json([], {
        status: 200
      })
    }
    try {
      const completions = await getCompletionsFromOpenAi(prompts, n);
      if (completions) {
        const data = completions.map((completion, index) => {
          return {
            item: items[index],
            result: completion.text?.trim()
          }
        })
        return NextResponse.json(data, {
          status: 200
        })
      }
    } catch (err: any) {
      console.error(err)
      return NextResponse.json(err.response.data, {
        status: 200
      })
    }
  }
}