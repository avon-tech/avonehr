# Clinios

## Stack

- React.js
- Redux
- Material-UI
- Node + Express
- MySQL

## Client

Setup:

1. `cd client`
2. `npm install` or `yarn`
3. copy `.env.sample` into `.env` and fill in credentials

To run:

1. `yarn start` or `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)

## API

Setup:

1. `cd server`
2. `yarn or npm install`
3. Make sure your database is running on your machine
4. `yarn dev` for development `yarn start` for production
5. copy `.env.sample` into `.env` and fill in credentials

To run:

1. `yarn dev` or `npm run dev`
2. API end point would be `http://localhost:5001`

## Database

Load file mysql_start.txt in your database

To query the database install MySQL Workbench
https://www.mysql.com/products/workbench/

## Email

To test email notifications (only for development):

1. Get `username` and `password` from `https://ethereal.email/create`
2. Check emails on `https://ethereal.email/messages`

## Usage

Login to the app with email test@test.com and password 12345678

## File system

To create PDF files on a Mac

    sudo mkdir /app/
    sudo mkdir /app/client
    sudo chmod 777 /app/client
