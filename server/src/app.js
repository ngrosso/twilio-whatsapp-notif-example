// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console

/*
  How to make it work:
  1) npm run start
  2) cd Descargas/
  3) ./ngrok http 3000
  4) copy forwarding route
  5) add /inbound (example: https://83820c0a.ngrok.io/inbound )
  6) https://www.twilio.com/console -> programable sms-> whatsapp -> sandbox
  7) paste endpoint in "when a message comes..."
  8) save changes in twilio console

*/
//imports
const express = require('express');
const bodyParser = require('body-parser');
let fs = require('fs');
const app = express();

require('dotenv').config({path:'.env'});
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

//importo archivos
var commands = require('./commands');
const numbers = require('../config/config');

//creo variables globales
users = {};
const cooldown = 600000;

//parseo el body
app.use(bodyParser.urlencoded({extended:false}));

//entrada al sistema
app.post('/',(req,res)=>{
  let responseMessage = 'placeholder';

  //recibo el body
  console.log('==INCOMING MESSAGE at'+new Date().toLocaleTimeString()+'===========');
  console.log(req.body);
  console.log('===================================================');
  
  //parseo el telefono
  const incomingNumber= req.body.From.slice(9);

  //valido el numero entrante y si es un flow
  if(users[incomingNumber] != undefined && (users[incomingNumber].timestamp < new Date().getTime()-cooldown || users[incomingNumber].commandStatus != -1) ){
    //es un flow
    responseMessage = commands[users[incomingNumber].lastCommand]({ user : users[incomingNumber] , msg: req.body.Body});
  }else{
    //es un nuevo comando
    responseMessage = newCommand(incomingNumber,req);
  }

  //respuesta del bot
  try {
    sendMessage(responseMessage,req,res);
          
    saveUser(incomingNumber,responseMessage);

    writeUsersFile(users);

  } catch (error) {
    console.error("Error enviando el mensaje");
    console.error(error);
  }
})

app.listen(3000,()=>{
  console.log('server conected');
})


//funciones
function writeUsersFile(users){
  fs.writeFile('users.txt',JSON.stringify(users),function(err){
    if (err) throw err;
    console.log('Saved!');
  })
}

function newCommand(incomingNumber,req){
  let incomingMessageArray = req.body.Body.toString().toLowerCase().split(' ');
  const command = incomingMessageArray[0];
  const args = incomingMessageArray.slice(1);
  console.log(commands[command]);
  if(users[incomingNumber] != undefined && commands[command]!= undefined){
    return commands[command](...args);
  }else{
    return { lastCommand: command, commandStatus: -1, message: 
      'Bienvenido al sistema de notificaciones!\n\
      _Puede utilizar los siguentes comandos:_\n\
      *ayuda*\n\
      *hora*\n\
      *hola*'
    }
  }
}

function saveUser(incomingNumber,responseMessage){
  if(responseMessage.userData == undefined){
    if(users[incomingNumber]!=undefined){
      responseMessage.userData = users[incomingNumber].userData;
    }
  }
    var userObject = { 
      lastCommand : responseMessage.lastCommand, 
      timestamp : new Date().getTime(), 
      commandStatus : responseMessage.commandStatus,
      userData: responseMessage.userData
    };
  users[incomingNumber] = userObject;
}

function sendMessage(responseMessage,req,res){
  client.messages
  .create({
    body: responseMessage.message,
    from: 'whatsapp:'+numbers.FROM_ACCOUNT,
    to: req.body.From
  })
  .then(message =>{
    console.log('message id: '+message.sid);
    console.log('contenido del mensaje enviado: '+responseMessage.message);
  })
  .done();
  res.end();
}