let serialportgsm = require('serialport-gsm')
let modem = serialportgsm.Modem()
let options = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: true,
    enableConcatenation: true,
    incomingCallIndication: true,
    incomingSMSIndication: true,
    pin: '',
    customInitCommand: '',
    logger: console
}

modem.open('COM5', options, {});
modem.on('open', data => {
    modem.initializeModem((data) => {
        console.log('Modem is initialized');
        customSendSMS(data);
        customSendSMS(data);
        
    });
});

let customSendSMS = (data) =>{
    modem.sendSMS('01722852837','Hello from node js APP10',false, (data) =>{
        console.log("Data: ", data);
    });
}

// modem.on('sendingMessage', result => {
//     console.log(result);
// });

modem.close();