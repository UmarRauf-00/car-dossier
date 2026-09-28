## About

    - Search for a car manufacturer (e.g. 'Honda'), then drill down into a manufacturer to browse its makes. Data is fetched from a US government API, NHTSA.
    - Clerk handles sign up, sign in and profile settings. Signed-in users can also mark manufacturers as favourites.

## Why I built it

To build a full-stack application from separate parts that have to work together to make one working app. The focus was on how those parts connect rather than on the UI, so the app itself is just two pages.
What I learned

    - Setting up Node.js and Express from scratch
    - Setting up GraphQL from scratch as a layer on top of a Node/Express server, in a monorepo
    - Integrating an external auth provider (Clerk), with a webhook that saves new users to the database when they sign up
    - Setting up a Postgres database
    - Implementing a BFF pattern that combines data from an external API and a local database
    - Containerising the frontend, backend and database separately
    - Deploying the client and API as Docker containers on Render, connected to a hosted Postgres database on Neon

## Tech stack

- React 19 
- Typescript
- Vite
- MUI 
- Apollo Client
- Node.js 
- Express
- Apollo Server (GraphQL)
- PostgreSQL (`pg`)
- Clerk Auth
- Docker / Docker Compose

![Aritechture](https://drive.google.com/file/d/1hOBvMSfWWxtzHFpBcwZmCVc2XAScPdA7/view?usp=drive_link)