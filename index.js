const {SerialPort} = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = new SerialPort({path:'COM12',
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});                       //connect to SerialPort with right path COM(NUMBER OF PORT)


const parser = new ReadlineParser();
port.pipe(parser);

let data = '';            //variable for save data receive

parser.on('data', (line) => {
  console.log(`Received data: ${line}`);
  data = line;
  io.emit('data', data); // send data to all connected clients
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});                       // start localhost:3000