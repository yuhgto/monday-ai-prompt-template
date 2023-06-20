# Before you begin

This is a template app to help developers get started building for the monday AI Assistant. It's a preview, so things may not work as expected. This code will eventually live in the [official monday example apps repo.](https://github.com/mondaycom/welcome-apps/)

If you're having problems, there are some common troubleshooting steps at the bottom of the page. 

# About the app

This is an example app with three basic apps inside it. It updates data on a monday board from output from GPT3. 

This sample demonstrates the following concepts: 
- Integrates with OpenAI's GPT3
- Uses monday's client-side SDK
- Uses monday's React component library
- Integrates with monday GraphQL API
- Renders an app in a monday iframe
- Authentication between the client-side app and backend

# Setup

To connect this app to monday, follow the instructions in monday's technical docs: [AI Assistant Quickstart](https://developer.monday.com/apps/docs/quickstart-for-ai-assistant) 

<b>Please make sure you provided all OAuth permissions</b> (in the App configuration at Monday Developers center).

# Learn more

## Learn more about the monday app marketplace

Want to join the monday app marketplace? [Learn more and submit your app here!](https://monday.com/appdeveloper)

Want to build more monday apps? [Check out our docs.](https://developer.monday.com/apps/docs/intro)

## Join the AI hackathon

Sign up for the AI hackathon in June 2023 and build the next top monday app! [Sign up here.](https://lablab.ai/event/monday-ai-app-hackathon)

## Join the community

[Sign up for the monday community here.](https://community.monday.com)

# Exploring the example code

## Example apps

The sample code contains multiple example layouts that you can build your app from. Check the out in the `src/app/examples` folder: 
- [Livestream example](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/examples/livestream-example/final-code.tsx): Fullstack example used in our quickstart
- [Context explorer](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/examples/context-explorer/context-explorer-example.js): example that can be added to any AI assistant feature to explore the context and demonstrates different SDK capabilities. 
- [Basic prompt layout](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/examples/basic-prompt-layout/prompt-layout.tsx): Base layout to send an input from the user to a backend API

## Reusable elements

This repo contains components and hooks that you can reuse in your own apps: 
- [Example layouts](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/examples): Feel free to use any of the examples to build your app
- [hooks](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/hooks) folder:
    - [useBoardColumns](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/hooks/useBoardColumns.ts) and [useBoardGroups](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/hooks/useBoardGroups.ts) hooks:_to retrieve the column and group structure from the monday API and use it in your app_
    - [useAiApi](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/hooks/useAiApi.ts): _Prebuilt hook to call your AI API (i.e. the app backend)_
    - [useFetch](https://github.com/yuhgto/monday-ai-prompt-template/blob/main/src/hooks/useFetch.ts): _HTTP Fetch as a hook_
- [components](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/components) folder:
    - [context provider](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/components/context-provider): _Context provider component to retrieve monday app context and pass it to your app_
    - [ai footer](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/components/ai-footer): _Generic footer with a disclaimer message_
    - [text input with send](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/components/text-input-with-send): _Text input component in the monday style_
    - [text input with tags](https://github.com/yuhgto/monday-ai-prompt-template/tree/main/src/components/text-input-with-tags): _Text input component that supports tagging_

## Troubleshooting

Here are some common problems and how to solve them: 

**You cannot see the AI Assistant in your monday account:**

An account admin will need to enable the feature by following these steps: [Enable AI Assistant beta](https://developer.monday.com/apps/docs/quickstart-for-ai-assistant#enable-the-ai-assistant-beta)

**"Permission denied" error when calling the monday API:**

Your app doesn't have the right permissions. Depending on which example you're using, you'll need different permissions. 

To solve, add all the relevant permission scopes to your monday app. Do that with these instructions: [Add permission scopes](https://developer.monday.com/apps/docs/manage#define-app-permission-scopes)

If you're not sure which scopes you need, add them all during testing. You can remove the unnecessary ones later. 

**_StaticGenBailoutError_ thrown when calling app backend:**

You need to tell NextJS to compile the route statically. Uncomment line 7 in `src/app/api/openai/prompts/route.ts`:
```
export const dynamic = 'force-static'
```

**You're on a corporate VPN and get a self-signed certificate error from NodeJS:**

You need to tell NodeJS to allow insecure connections in your app. Add the following line to your .env file: 
```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**You're using HTTP (not HTTPS) and always get authentication errors from your backend:**

Disable the authentication step. Set `DISABLE_AUTH` to true in line 9 of `src/app/api/openai/prompts/route.ts`. Just don't forget to re-enable it before moving your app to production!
```
const DISABLE_AUTH = true;
```

**Your ngrok account isn't working and you need to use localhost:**

If you're using localhost, your app will connect on using HTTP (not HTTP) and you'll probably get most of the above errors. Try all the solutions above, and you should be good to go!

**You made a change to your app's config and it's not updating:**

First try refreshing your browser. 

If that doesn't work, you may have made the change on a different version of your app. Check that you're using the right version of your app. For more info on versioning, check out our docs: [App Versioning Docs](https://developer.monday.com/apps/docs/versioning)

**Something else:**

Drop a message in the hackathon Discord channel!