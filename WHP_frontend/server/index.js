const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const { videoToken } = require('./tokens');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);
let patientUID=[];

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);

});
app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get('/uid',function(req, res){
  const uid = req.body.id;
  console.log("getUID Get",uid);
  // patientUID = uid;
  patientUID.push(uid)
  sendUidResponse(patientUID[0], res);

})

app.post('/uid',function(req, res){
  const uid = req.body.id;
  console.log("getUID POST",uid);
  // patientUID = uid;
  patientUID.push(uid)
  sendUidResponse(patientUID[0], res);

})

const sendUidResponse = (uid, res) => {
  console.log("uid",uid)
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      id: uid
    })
  );
};

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
