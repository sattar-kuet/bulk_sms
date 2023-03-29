let SerialPortGSM = require('./lib')
let modem = SerialPortGSM.Modem()
//19200 // 115200
let modemOptions = {
  // parsers: SerialPortGSM.
  baudRate: 115200,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false,
  xon: false,
  rtscts: false,
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

// setInterval(() => {

// }, 10000)

let device = 'COM3'
setInterval(() => {
  // if (!modem.isOpened) {

  // } else {
  //   console.log(`Serial port ${modem.port.path} is open`)
  // }
}, 6000)
SerialPortGSM.list()
  .then(a => { console.log(a) }).catch(b => { console.log(b) })
modem.open(device, modemOptions, (err, result) => {
  console.log('err', err)
  console.log('open callback', result)
})
let getsim = function () {
  modem.getSimInbox(data => {
    console.log('getSimInbox', data.data.length)
    data.data.forEach(a => { console.log(a) })
    // if (data.data[data.data.length - 1]) {
    //   modem.deleteMessage(data.data[data.data.length - 1], data => {
    //     console.log('deleteMessage', data)
    //   })
    // }
  })
  // modem.checkSimMemory(a => {
  //   console.log(a)
  // })
}

modem.on('open', data => {
  // console.log('open event', data)
  modem.initializeModem((response) => {
    console.log('response', response)
  })

  /// Change the Mode of the Modem to SMS or PDU (Callback, "SMS"|"PDU")
  modem.setModemMode(response => {
    console.log(response)
    // modem.sendSMS('+639493204669', `Hello there zab!`, false, function (response) {
    //     console.log('messgae status', response)
    //   })
    modem.deleteAllSimMessages(function (response) {
      console.log(response)
    })
  }, 'PDU') // PDU SMS
  // getsim()

  // modem.deleteMessage(18, data => {
  //   console.log('deleteMessage', data)
  //   getsim()
  // })
  // modem.deleteAllSimMessages(function(response){
  //   console.log(response)
  // })
  // modem.getOwnNumber(a => {
  //   console.log(a)
  // })
  // modem.setOwnNumber('639493204669', a => {
  //   console.log(a)
  // })

  // modem.sendSMS("09498893309", "Test One", function(response){
  //   console.log('messgae status',response)
  // })


  // setTimeout(() => {
  //   modem.close((err, result) => {
  //     console.log('close')
  //     // console.log('close', modem.port)
  //     // console.log(err, result)
  //   })
  // }, 10000)

});

modem.on('onNewMessage', data => {
  console.log('onNewMessage', data)
  let self = this
  // getsim()
})

modem.on('onNewMessageIndicator', data => {
  console.log('onNewMessageIndicator')
  // console.log(data)
})

modem.on('close', msg => {
  // console.log(modem.port)
  console.log('main close', msg)
})

modem.on('onNewIncomingCall', msg => {
  console.log(msg)
})

modem.on('onMemoryFull', msg => {
  console.log('onMemoryFull', msg)
})
