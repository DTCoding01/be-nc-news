# Northcoders News API

Welcome to the NC News API! This is an API built with Node.js, Express, and PostgreSQL. It provides a platform for users to read, post, vote, and comment on articles from various topics.

# Hosted Version
You can access the hosted version of the API on https://be-nc-news-rv48.onrender.com/

# Clone Instructions
git clone https://github.com/DTCoding01/be-nc-news.git
cd be-nc-news

# Install dependencies
npm install

# Create .env files
ensure there are 2 .env files with the following information in the top level of your directory: 
"PGDATABASE=nc_news" > .env.development
"PGDATABASE=nc_news_test" > .env.test

# Seed the local database
npm run seed

# Run the tests
npm test

# Minimum Versions of Node.js and PostgreSQL
Node.js >= 14.x
PostgreSQL >= 12.x
--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
