import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


async function isAuthorized(request: NextRequest) {
  try {
    const authorizationToken: string  = request.headers.get('Authorization') ?? '';
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

// // TODO: handle errors from openAI
// // TODO: add this to openAi service
// async function getCompletionsFromOpenAi(prompts:string | string[], n: number) {
//   try {
//   const completionsFromApi = await openai
//       .createCompletion({
//         model: "text-davinci-003",
//         prompt: prompts,
//         n,
//       })
//     return completionsFromApi.data.choices;
//   } catch (err) {
//     console.log(err);
//   }
// }



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
    // TODO: call DALLE to generate some stuff.
    
  }
}