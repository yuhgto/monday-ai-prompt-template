import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { Configuration, OpenAIApi } from 'openai'

// Uncomment this if you get a StaticGenBailoutError from NextJS
export const dynamic = 'force-static'

// Set this to true if you're using localhost and having authentication issues
const DISABLE_AUTH = true;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


function isAuthorized(request: NextRequest) {
  try {
    const authorizationToken: string  = request?.headers.get('Authorization') ?? '';
    const clientSecret: string = process.env.CLIENT_SECRET ?? '';
    console.log('client-secret', clientSecret);
    console.log('authorizationToken', authorizationToken);
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
    console.log(`event - calling OpenAI API:\n`, JSON.stringify(payload, null,2));
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
  console.log(`event - request was received:\n${JSON.stringify(reqJson, null, 2)}`)
  if (!DISABLE_AUTH) {
    if (!isAuthorized(req)) {
        return NextResponse.json(
          { message: "Not authorized", success: false }, 
          {status:401}
        );
      } 
  } else {
    console.log('warning - skipping authentication step. To enable authentication, set DISABLE_AUTH to false.')
  }
  if (!reqJson.items) {
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