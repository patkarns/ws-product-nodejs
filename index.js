const express = require('express')
const pg = require('pg')
const path = require('path');
const { rateLimiter } = require('./rateLimiter')

require('dotenv').config()

const app = express()

// configs come from standard PostgreSQL env vars
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
const pool = new pg.Pool()

const queryHandler = (req, res, next) => {
  pool.query(req.sqlQuery).then((r) => {
    return res.json(r.rows || [])
  }).catch(next)
}

app.use(rateLimiter) // middleware to limit requests

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to EQ Works 😎')
})

app.get('/events/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, events
    FROM public.hourly_events
    ORDER BY date, hour
    LIMIT 168;
  `
  return next()
}, queryHandler)

app.get('/events/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, SUM(events) AS events
    FROM public.hourly_events
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `
  return next()
}, queryHandler)

app.get('/stats/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, impressions, clicks, revenue
    FROM public.hourly_stats
    ORDER BY date, hour
    LIMIT 168;
  `
  return next()
}, queryHandler)

app.get('/stats/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date,
        SUM(impressions) AS impressions,
        SUM(clicks) AS clicks,
        SUM(revenue) AS revenue
    FROM public.hourly_stats
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `
  return next()
}, queryHandler)

app.get('/poi', (req, res, next) => {
  req.sqlQuery = `
    SELECT *
    FROM public.poi;
  `
  return next()
}, queryHandler)


//Used only in local development where there is no build step.
if(process.env.NODE_ENV != "production"){
  //tell a route making a GET request on the root (/) URL to head to the HomePage
  app.get("/", (request, response) => {
      if (error) {
          throw error
      }
      response.sendFile(__dirname + '/client/public/index.html');
      //response.send("Server running on Node.js, Express, and Postgres API")
      //response.json({ info: "Server running on Node.js, Express, and Postgres API" });
  });

  //Static file declaration, which is the location of the React app
  //Used in deployment by React app to access index.js
  app.use(express.static(path.join(__dirname, 'client'))); 

  //Put this last among all routes. Otherwise, it will return HTML to all fetch requests and trip up CORS. They interrupt each other
  // For any request that doesn't match, this sends the index.html file from the client. This is used for all of our React code.
  //Eliminates need to set redirect in package.json at start script with concurrently
  app.get('*', (req, res) => {  
      res.sendFile(path.join(__dirname+'/client/public/index.html'));
  })
}
//Only used in production, since I do not build before running in development
if(process.env.NODE_ENV == "production"){
  //tell a route making a GET request on the root (/) URL to head to the HomePage
  app.get("/", (request, response) => {
      if (error) {
          throw error
      }
      response.sendFile(__dirname + '/client/build/index.html');
      //response.send("Server running on Node.js, Express, and Postgres API")
      //response.json({ info: "Server running on Node.js, Express, and Postgres API" });
  })

  //Static file declaration, which is the location of the React app
  //Used in deployment by React app to access index.js
  app.use(express.static(path.join(__dirname, 'client/build'))); 

  //Put this last among all routes. Otherwise, it will return HTML to all fetch requests and trip up CORS. They interrupt each other
  // For any request that doesn't match, this sends the index.html file from the client. This is used for all of our React code.
  //Eliminates need to set redirect in package.json at start script with concurrently
  app.get('*', (req, res) => {  
      res.sendFile(path.join(__dirname+'/client/build/index.html'));
  })
}



app.listen(process.env.PORT || 5555, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Running on ${process.env.PORT || 5555}`)
  }
})

// last resorts
process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`)
  process.exit(1)
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  process.exit(1)
})