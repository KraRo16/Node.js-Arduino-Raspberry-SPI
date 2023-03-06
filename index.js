const spi = require('spi-device');
const express = require('express');
const fs = require("fs");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const winston = require('winston');



const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "test-log.log"})
  ]
  });

const config = {
  mode: 1,
  chipSelect: 0,
  maxSpeedHz: 1000000,
  bitOrder: spi.ORDER_MSB_FIRST,
  bitsPerWord: 8,
};

let data;

const device = spi.open(0, 0, config, err => {
  setInterval(() => {
  const message = [{
    sendBuffer: Buffer.from([0xff, 0xff]),
    receiveBuffer: Buffer.alloc(2),
    byteLength: 2,
    speedHz: 1000000
  }];

  if (err) throw err;

  device.transfer(message, (err, message) => {
  if (err) throw err;
  
  message[0].receiveBuffer[0] = (0b00111111)&message[0].receiveBuffer[0];
  
  let data = (message[0].receiveBuffer[0] << 8 )+ message[0].receiveBuffer[1];
  let error = ((0b01000000)&(message[0].receiveBuffer[0])) >> 6;
  let parity = ((0b10000000)&(message[0].receiveBuffer[0])) >> 7;

  let actualPosition = data;

  let actualFrequency = 3*data;
    
  
    console.log(((message[0].receiveBuffer[0] << 8 )+ message[0].receiveBuffer[1]).toString(2));
    console.log(`Data: ${data}`);
    console.log(`Error: ${error}`);
    console.log(`Parity: ${parity}`);
    console.log(`Actual position: ${actualPosition}`);
    console.log(`Actual frequency: ${actualFrequency}`);

   setInterval(() => {
  logger.log('info', `Data: ${data}`);
}, 10);
    
    io.emit('data', {    
      data: data,
      parity: parity,
      error: error,

      actualPosition: actualPosition,
  
      actualFrequency: actualFrequency,
    });
  });
},100);
});  
   

   
   
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  console.log('Client is on');
  socket.on('', () => {
    console.log('Data received');
    const message = {
      data: data,
      parity: parity,
      error: error,

      actualPosition: actualPosition,
   
      actualFrequency: actualFrequency,
    };
    io.emit('data', message);
  });
  
socket.on('disconnect', () => {
  console.log('Client disconnected');
  });
});


server.listen(3000, () => {
  console.log('Server started on port 3000');
});









