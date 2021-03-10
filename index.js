const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
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
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/server/events/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, events
    FROM public.hourly_events
    ORDER BY date, hour
    LIMIT 168;
  `
  return next()
}, queryHandler)

app.get('/server/events/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, SUM(events) AS events
    FROM public.hourly_events
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `
  return next()
}, queryHandler)

app.get('/server/stats/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, impressions, clicks, revenue
    FROM public.hourly_stats
    ORDER BY date, hour
    LIMIT 168;
  `
  return next()
}, queryHandler)

app.get('/server/stats/daily', (req, res, next) => {
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

app.get('/server/poi', (req, res, next) => {
  req.sqlQuery = `
    SELECT *
    FROM public.poi;
  `
  return next()
}, queryHandler)

app.get('/server/', (req, res) => {
  res.send('Welcome to EQ Works 😎')
})


// Local development (no build step)
if(process.env.NODE_ENV != "production"){
  //tell a route making a GET request on the root (/) URL to head to the HomePage
  app.get("/server/", (request, response) => {
      response.sendFile(__dirname + '/client/public/index.html');
      //response.send("Server running on Node.js, Express, and Postgres API")
      //response.json({ info: "Server running on Node.js, Express, and Postgres API" });
  });

  // Static file declaration
  app.use(express.static(path.join(__dirname, 'client'))); 

  
  app.get('*', (req, res) => {  
    res.sendFile(path.join(__dirname+'/client/public/index.html'));
  })
}
//Only used in production, since I do not build before running in development
if(process.env.NODE_ENV == "production"){
  
  app.get("/server/", (request, response) => {
    response.sendFile(__dirname + '/client/build/index.html');
  })

  //Static file declaration
  app.use(express.static(path.join(__dirname, 'client/build'))); 

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