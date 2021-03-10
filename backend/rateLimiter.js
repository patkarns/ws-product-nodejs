const quota = 20;
const interval_ms = 60 * 1000;
let reqCounts = {}

setInterval(function() {
    return reqCounts = {};
}, interval_ms);

const rateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!reqCounts[ip]) reqCounts[ip] = 1;
    else reqCounts[ip] += 1;
    if (reqCounts[ip] > quota ) {
        return res
          .status(403)
          .send(`Quota of ${quota} per ${interval_ms / 1000 }sec exceeded`)
    }
    return next()
}
  
module.exports = { rateLimiter }