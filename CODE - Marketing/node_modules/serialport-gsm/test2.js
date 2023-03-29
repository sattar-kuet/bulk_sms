let serialportgsm = require("./lib");
let test = async () => {
  //callback
  serialportgsm.list((err, res) => {
    console.log("callback", err, res);
  });

  //promise
  let result = await serialportgsm.list();
  console.log("promise", result);
};
test();

let modem = serialportgsm.Modem();
let options = {
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
  xon: false,
  rtscts: false,
  xoff: false,
  xany: false,
  buffersize: 0,
  autoDeleteOnReceive: true,
  enableConcatenation: true,
  incomingCallIndication: true,
  incomingSMSIndication: true,
  pin: "",
  // logger: console,
  // customInitCommand: 'AT^CURC=0',
};

// modem.open("COM5", options, (data) => {
//   console.log("open", data);
// });

let getSim = function () {
  modem.getSimInbox((data) => {
    console.log("getSimInbox", data.data.length);
    data.data.forEach((a) => {
      console.log(a);
    });
  });
};

modem.on("open", () => {
  modem.initializeModem((msg) => {
    console.log("initialize msg:", msg);
    let sendSpam = (mdm) => {
      setInterval(() => {
        console.log("send sms");
        mdm.sendSMS("+639454692980", `Scammer ka!`, true, (response) => {
          console.log("message status", response.data.response);
        });
      }, 5000);
    };
    sendSpam(modem);
  });
  modem.setModemMode((msg) => console.log("set pdu msg:", msg), "PDU");
  // modem.sendSMS('+639498893308', `Hello there zab!`, true, response => {
  //     console.log('message status', response)
  // })
  // modem.setOwnNumber('639493204669', (a) => {
  //     console.log(a)
  // })
  // modem.getOwnNumber()
  //     .then(number => {
  //         console.log(number)
  //     })
  //     .catch(err => {
  //         console.log(err)
  //     })
  // getSim()
  modem
    .getNetworkSignal()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });

  // modem.deleteAllSimMessages(function(response) {
  // 	console.log(response);
  // });
  // modem.checkSimMemory(a => {
  //     console.log('checkSimMemory')
  //     console.log(a)
  // })
  // modem.executeCommand(`AT&F0`, ((data, err) => {
  //     if (err) {
  //         console.log('Exec Error: ', err)
  //     }
  //     else {
  //         console.log("Result from execute command: ", data)
  //     }

  // }), false, 10000)

  // modem.executeCommand('AT ^ GETPORTMODE', (result, err) => {
  //     if (err) {
  //         console.log(`Error - ${err}`);
  //     } else {
  //         console.log(`Result ${JSON.stringify(result)}`);
  //     }
  // });
  // let commandParser = modem.executeCommand('AT+CIMI', (result, err) => {
  // 	if (err) {
  // 		console.log(`Error`, err);
  // 	} else {
  // 		console.log(`Result`, result);
  // 	}
  // });
  // commandParser.dataResult = {};
  // commandParser.logic = dataLine => {
  // 	if (dataLine) {
  // 		if (dataLine === 'AT+CIMI') {
  // 			commandParser.dataResult.command = dataLine.trim();
  // 		} else if (/^\d+$/.test(dataLine)) {
  // 			commandParser.dataResult.imsi = dataLine.trim();
  // 		} else {
  // 			commandParser.dataResult.response = dataLine.trim();
  // 		}
  // 	}
  // 	if (dataLine.includes('OK')) {
  // 		return {
  // 			resultData: {
  // 				status: 'success',
  // 				request: 'executeCommand',
  // 				data: { result: commandParser.dataResult },
  // 			},
  // 			returnResult: true,
  // 		};
  // 	} else if (dataLine.includes('ERROR') || dataLine.includes('COMMAND NOT SUPPORT')) {
  // 		return {
  // 			resultData: {
  // 				status: 'ERROR',
  // 				request: 'executeCommand',
  // 				data: `Execute Command returned Error: ${dataLine}`,
  // 			},
  // 			returnResult: true,
  // 		};
  // 	}
  // };
});
modem.on("close", (msg) => console.log("on close msg:", msg));

modem.on("error", (msg) => console.log("on error msg:", msg));

modem.on("onNewMessage", (data) => {
  console.log("onNewMessage", data);
  let self = this;
  // getsim()
});

modem.on("onNewMessageIndicator", (data) => {
  console.log("onNewMessageIndicator");
  // console.log(data)
});

modem.on("onNewIncomingCall", (result) => {
  console.log(result);
});
