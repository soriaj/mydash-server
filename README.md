# MyDash Server

Backend server for MyDash app.  

## Technologies
- Node
- Express
- JWT
- PostgreSQL

## Testing 
- Mocha
- Chai
- Supertest

## Set up

Complete the following steps to setup locally:

1. Clone this repository to your local machine `git clone https://github.com/soriaj/mydash-server.git <NEW-PROJECTS-NAME>`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
3. Install the node dependencies `npm install`
4. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
5. Add TEST_DATABASE_URL and DATABASE_URL path to `.env`
6. Add JWT_SECRET to the `.env` file
7. Create Postgres databases
8. Run `npm run migrate:test` and `npm run migrate` to create tables in test and prod databases

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Run with Docker compose

See MyDash-client README for details at [MyDash-Client](https://github.com/soriaj/mydash-client)

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## Contributor(s)

Javier Soria