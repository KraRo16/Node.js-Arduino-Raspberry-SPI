const config = {
  mode: 1,
  chipSelect: 0,
  maxSpeedHz: 1000000,
  bitOrder: spi.ORDER_MSB_FIRST,
  bitsPerWord: 8
};

const device = spi.open(0, 0, config, err => {
  
  const message = [{
    sendBuffer: Buffer.from([0xff, 0xff]),
    receiveBuffer: Buffer.alloc(2),
    byteLength: 2,
    speedHz: 1000000
  }];

  if (err) throw err;

  device.transfer(message, (err, message) => {
  if (err) throw err;
  console.log(((message[0].receiveBuffer[0] << 8 )+ message[0].receiveBuffer[1]).toString(2));
  const error = ((0b01000000)&(message[0].receiveBuffer[0])) >> 6;
  const parity = ((0b10000000)&(message[0].receiveBuffer[0])) >> 7;
  
  message[0].receiveBuffer[0] = (0b00111111)&message[0].receiveBuffer[0];
  
    const getData = (message[0].receiveBuffer[0] << 8 )+ message[0].receiveBuffer[1];
  
    console.log(getData);
      
    console.log(error);
    console.log(parity);
  });
});