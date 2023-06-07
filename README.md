# Before you begin

This is a template app to help developers get started building for the monday AI Assistant. It's a preview, so things may not work as expected. This code will eventually live in the [official monday example apps repo.](https://github.com/mondaycom/welcome-apps/)

## Join the monday AI hackathon

monday and LabLab are collaborating on a hackathon to build new apps for the monday AI assistant.Learn more and sign up for the hackathon here: [monday AI assistant hackathon](https://lablab.ai/event/monday-ai-app-hackathon)

# About

This is a data enrichment app that updates data on a monday board from an output from GPT3. 

This sample demonstrates the following concepts: 
- Integrates with OpenAI's GPT3
- Uses monday's client-side SDK
- Uses monday's React component library
- Integrates with monday GraphQL API
- Renders an app in a monday iframe
- Authentication between the client-side app and backend

## Getting Started

To connect this app to monday, you need to run the development server and create a tunnel to your local environment.

### Run the development server

First, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Run the ngrok tunnel

Install ngrok and sign up for an account - https://ngrok.com/download

Then, run the following command: 
```
ngrok http 3000
```

### Connect your app to monday

Create an app in monday and add your ngrok URL as the "Build URL". [Learn more here!](https://developer.monday.com/apps/docs/manage)

# Learn more

## Learn more about the monday app marketplace

Want to join the monday app marketplace? [Learn more and submit your app here!](https://monday.com/appdeveloper)

Want to build more monday apps? [Check out our docs.](https://developer.monday.com/apps/docs/intro)

## Join the AI hackathon

Sign up for the AI hackathon in July 2023 and build the next top monday app! [Sign up here.](https://lablab.ai/event/monday-ai-app-hackathon)

## Join the community

[Sign up for the monday community here.](https://community.monday.com)
