var express = require('express');
var router = express.Router();
const pg = require('pg')
const rateLimiter= require('../rateLimiter')

// configs come from standard PostgreSQL env vars
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
const pool = new pg.Pool()

const queryHandler = (req, res, next) => {
    pool.query(req.sqlQuery).then((r) => {
        return res.json(r.rows || [])
    }).catch(next)
}

router.use(rateLimiter.rateLimiter) // middleware to limit requests

router.get('/', (req, res) => {
    console.log("get /")
    res.send('Welcome to EQ Works 😎')
})

router.get('/events/hourly', (req, res, next) => {
    console.log("get /events/hourly")
    req.sqlQuery = `
      SELECT date, hour, events
      FROM public.hourly_events
      ORDER BY date, hour
      LIMIT 168;
    `
    return next()
}, queryHandler)

router.get('/events/daily', (req, res, next) => {
    console.log("get /events/daily")
    req.sqlQuery = `
      SELECT date, SUM(events) AS events
      FROM public.hourly_events
      GROUP BY date
      ORDER BY date
      LIMIT 7;
    `
    return next()
}, queryHandler)

router.get('/stats/hourly', (req, res, next) => {
    console.log("get /stats/hourly")
    req.sqlQuery = `
      SELECT date, hour, impressions, clicks, revenue
      FROM public.hourly_stats
      ORDER BY date, hour
      LIMIT 168;
    `
    return next()
}, queryHandler)

router.get('/stats/daily', (req, res, next) => {
    console.log("get /stats/daily")
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

router.get('/poi', (req, res, next) => {
    console.log("get /poi")
    req.sqlQuery = `
      SELECT *
      FROM public.poi;
    `
    return next()
}, queryHandler)



module.exports = router;