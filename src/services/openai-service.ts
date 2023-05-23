// TODO: finish this

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const openai = new OpenAIApi(configuration);

// TODO: handle errors from openAI
export class OpenAiService {
    async getCompletionsFromOpenAi(prompt:string, n: number) {
    try {
    const completionsFromApi = await openai
        .createCompletion({
          model: "text-davinci-003",
          prompt,
          n,
        })
      return completionsFromApi.data.choices;
    } catch (err) {
      console.log(err);
    }
  }
}