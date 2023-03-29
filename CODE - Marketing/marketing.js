
const https = require("https");
const axios = require('axios')
axios.defaults.timeout = 30000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });


const smsContentURL = "https://client.itscholarbd.com/getmarketingsmsdata"
const deleteDataURL = "https://client.itscholarbd.com/deletedata"
const smsLogURL = "https://client.itscholarbd.com/addsmslog"
const respSentToMsgQ =  'Successfully Sent to Message Queue'
const respMessageSuccessfullySent =  'Message Successfully Sent'

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

modem.open('COM3', options, function (err, result) {
    if (err) {
        console.log("error in open modem", err);
        reject(err)
    }
    if (result) {
        console.log("modem open", result);
    }
});
modem.on('open', data => {
    modem.initializeModem((data) => {
        console.log('Modem is initialized');
    })
})

function GetSMSContent(){
    return new Promise((resolve, reject) =>{
        axios.post(smsContentURL)
         .then(response => {
            resolve({data: response, err: null})
        })
        .catch(error => {
            reject({data: null, err: error})
        })
    })
}

function DeleteSMSData(receiverList){
    return new Promise((resolve, reject) =>{
        let getRespNo = 0
        let isErrorOcur =  false
        for (let i = 0; i < receiverList.length; i++)
        {
            url =  deleteDataURL+`?id=${receiverList[i].id}`
            axios.delete(url,{})
            .then( () => {
               getRespNo+=1
               if(getRespNo == receiverList.length){
                    if (isErrorOcur == false){
                        resolve({data: "All data deleted", err: null})
                    }
                    else{
                        reject({data: null, err: "Error occur while deleting previous sms data"})
                    }
               }

           })
           .catch(() => {
               getRespNo+=1
               isErrorOcur = true
               if(getRespNo == receiverList.length){
                reject({data: null, err: "Error occur while deleting previous sms data"})
              }
           })
        }
    })
}

function PostSMSLog(sendSMSRespList){
    return new Promise((resolve, reject) =>{
        let getRespNo = 0
        let isErrorOcur =  false
        for (let i = 0; i < sendSMSRespList.length; i++)
        {
            let curResp = sendSMSRespList[i]
            let body = {}
            url =  smsLogURL;
            body.phone = curResp.data.recipient;
            body.message = curResp.data.message;
            body.quantity = SMSCalculator.getCount(curResp.data.message);
            body.user_id = curResp.user_id;
            body.status = "Sent";
            body.delivered = "delivered";
            if (curResp.data.response != respMessageSuccessfullySent){
                body.delivered = "not-delivered"
                body.error_message = curResp.data.response
            }

            axios.post(url,{body})
            .then( (resp) => {
               getRespNo+=1
               if(getRespNo == sendSMSRespList.length){
                    if (isErrorOcur == false){
                        resolve({data: "Sucessfully added sms log for all data", err: null})
                    }
                    else{
                        reject({data: null, err: "Error occur while adding sms log"})
                    }
               }

           })
           .catch(error => {
               getRespNo+=1
               isErrorOcur = true
               if(getRespNo == sendSMSRespList.length){
                reject({data: null, err: "Error occur while adding sms log"})
              }
           })
        }
    })
}

function SendSMSContent(receiverList){
    return new Promise((resolve, reject) =>{
        let totalResFromSendSMS = []
        let curMessageId = 0
        for (let i = 0; i < receiverList.length; i++) {
            curReceiver = receiverList[i]
            modem.sendSMS(curReceiver.phone,curReceiver.message, false, (resFromSendMessage) =>{

                if (resFromSendMessage.data.response != respSentToMsgQ){
                    resFromSendMessage.id = receiverList[curMessageId].id
                    resFromSendMessage.user_id = receiverList[curMessageId].user_id
                    curMessageId+=1
                    totalResFromSendSMS.push(resFromSendMessage)
                    console.log(resFromSendMessage);
                }
                if(totalResFromSendSMS.length == receiverList.length){
                    console.log("Done")
                    resolve({data:totalResFromSendSMS, err: null})
                }
            });
        }
    });

}

// let isPrevTaskRunning = false
// let prevTaskRunningTime = 0
const thresholdRunTimeOfAProcess = 1 // 50 == 2.5 min
async function StartTask(){
    //console.log("Start Task")
    // prevTaskRunningTime+=1
    // if (isPrevTaskRunning == true){
    //     if (prevTaskRunningTime > thresholdRunTimeOfAProcess){
    //         console.log("Cleared previous process")
    //         prevTaskRunningTime = 0
    //         isPrevTaskRunning = false
    //     }
    //     return
    // }
   // console.log("Start new process")
    // isPrevTaskRunning = true
    let resFromGetSMSContent = []
    resFromGetSMSContent = await GetSMSContent()
    if (resFromGetSMSContent.err == null && resFromGetSMSContent.data.data.response.length > 0){
        console.log("Response received : ", resFromGetSMSContent.data.data.response)
        const resFromSendSMSContent = await SendSMSContent(resFromGetSMSContent.data.data.response)
        console.log(resFromSendSMSContent.data ? "All SMS send sucessfully" : resFromSendSMSContent.err)
        const resFromDeleteSMSData = await DeleteSMSData(resFromGetSMSContent.data.data.response)
        console.log(resFromDeleteSMSData.data ? resFromDeleteSMSData.data : resFromDeleteSMSData.err)
        const resFromPostSMSLog = await PostSMSLog(resFromSendSMSContent.data)
        console.log(resFromPostSMSLog.data ? resFromPostSMSLog.data : resFromPostSMSLog.err)
    }
    if (resFromGetSMSContent.err != null){
        console.log("Get error from GetSMSContent API :", resFromGetSMSContent.err)
        console.log("Get error from GetSMSContent API :")
    }
    // isPrevTaskRunning = false
    // prevTaskRunningTime = 0
    return true;
}

const intervalTime = 5000;

const runInQueue = () => {
  const interval = setInterval(async ()=>{
    clearInterval(interval);
    await StartTask();
    runInQueue();
  }, intervalTime);
}

runInQueue();
 process.on('SIGINT', function() {
    console.log("Closing Modem")
    modem.close();
    process.exit(0)

 })

 /*###################################################
 sms calculator
 ####################################################*/

 const SMSCalculator = {
    // Encoding
    encoding: {
      UTF16: [70, 64, 67],
      GSM_7BIT: [160, 146, 153],
      GSM_7BIT_EX: [160, 146, 153],
    },

    // Charset
    charset: {
      gsmEscaped: '\\^{}\\\\\\[~\\]|€',
      gsm: '@£$¥èéùìòÇ\\nØø\\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
    },

    // Regular Expression
    regex: function() {
      return {
        gsm: RegExp(`^[${this.charset.gsm}]*$`),
        gsmEscaped: RegExp(`^[\\${this.charset.gsmEscaped}]*$`),
        gsmFull: RegExp(`^[${this.charset.gsm}${this.charset.gsmEscaped}]*$`),
      };
    },

    // Method
    detectEncoding: function(text) {
      if (text.match(this.regex().gsm)) {
        return this.encoding.GSM_7BIT;
      } else if (text.match(this.regex().gsmFull)) {
        return this.encoding.GSM_7BIT_EX;
      } else {
        return this.encoding.UTF16;
      }
    },
    getEscapedCharCount: function(text) {
      return [...text].reduce((acc, char) => acc + (char.match(this.regex().gsmEscaped) ? 1 : 0), 0);
    },
    getPartData: function(totalLength, encoding) {
      let maxCharCount = encoding[2];
      let numberOfSMS = Math.ceil(totalLength / maxCharCount);
      let remaining = maxCharCount - (totalLength - (encoding[0] + encoding[1] + (encoding[2] * (numberOfSMS - 3))));

      if (totalLength <= encoding[0]) {
        maxCharCount = encoding[0];
        numberOfSMS = 1;
        remaining = maxCharCount - totalLength;
      } else if (totalLength > encoding[0] && totalLength <= (encoding[0] + encoding[1])) {
        maxCharCount = encoding[1];
        numberOfSMS = 2;
        remaining = maxCharCount - (totalLength - encoding[0]);
      }

      return  numberOfSMS;


    },
    getCount: function(text) {
      let length = text.length;
      const encoding = this.detectEncoding(text);

      if (encoding === this.encoding.GSM_7BIT_EX) {
        length += this.getEscapedCharCount(text);
      }
      if (encoding === this.encoding.GSM_8BIT_EX) {
        length += this.getEscapedCharCount(text);
      }

      return this.getPartData(length, encoding);
    },
  };
