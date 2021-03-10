const express = require('express')
const app = express()
const router = express.Router()
const path = require('path');

const indexRouter = require('./routes/index');

require('dotenv').config()



app.use(router)

app.use('/', indexRouter);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(express.static('./client/build/'));
app.use(logger('dev'));
app.get('*', function(req, res) {
  res.sendFile(__dirname+'/client/build/index.html');
});

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