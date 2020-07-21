const tmi = require('tmi.js');
const mongodb = require('mongodb');
require('dotenv').config();
const {esperar} = require('./functions/esperar');
const {salvarDB} = require('./functions/salvar');
const {enterChannels} = require('./functions/entrarCanal');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`[express] Ouvindo a porta: ${PORT}`);
});

const prefix = "!";
var isDBOK = false;

mongodb.MongoClient.connect(process.env.TOKEN_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async (conn) => {
  db_twitch = conn.db('twitch_bot');
  user_list = await db_twitch.collection('users').findOne();
  ban_list = await db_twitch.collection('banlist').findOne();
  channel_list = await db_twitch.collection('channels').findOne();
  console.log("[mongodb] Arquivos do banco de dados carregado.")
  isDBOK = true;
})
.catch((err)=>{
  console.log(`[mongodb] Erro: ${err}`);
})


//tmi config
const opts = {
  options: {
    debug: false
  },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: "Texugote",
    password: process.env.TOKEN_BOT
  },
  channels: []
};

const client = new tmi.client(opts);

console.log("[node] Iniciando o bot...");

// Connect to Twitch:
client.connect();

client.on('connected', async (addr, port) => {
  //Wait for DB
  while (!isDBOK){
    console.log("[tmi] Esperando a conexão com o banco de dados");
    await esperar(1000)
  }
  //Join in every twitch channel
  enterChannels(client, channel_list);

  console.log(`[tmi] Conectado a ${addr}:${port}`);

});

client.on('message', async (target, context, msg, self)=>{
  if (self) return;
  let args = msg.split(/ +/);
  command = args.shift();
  args = args.join(" ");

  if(command == `${prefix}addcanal`){
    if (channel_list["channels"].includes(args)){
      client.say(target, `@${context.username}, o bot já está nesse canal de @${args}.`);
      return;
    } else{
      channel_list["channels"].push();
      salvarDB(db_twitch, channel_list,'channels');
      client.say(args, `Entrei no canal. CoolCat`);
      enterChannels(client, channel_list);
      client.say(target, `Fui adicionado em @${args}. BloodTrail `);
    }
  }else if(command == `${prefix}remcanal`){
    if (channel_list["channels"].includes(args)){
      let indexChannel = channel_list["channels"].findIndex((canal)=>{
        canal == args;
      });
      channel_list["channels"].splice(indexChannel, 1);
      salvarDB(db_twitch, channel_list,'channels');
      client.part(args).then(()=>{
        client.say(target, `saí do canal do ${args}`);
      });
    } else{
      client.say(target, `eu não estava no canal de ${args}.`);
    }
  }
});

client.on('cheer', (channel, userstate, message) =>{
  client.say(target, `${userstate.username} enviou ${userstate.bits} bits!` )
});

client.on("subscription", (channel, username, method, message, userstate) => {
  if(method.prime){
    client.say(channel, `${username} mandou o prime pro canal! TwitchUnity`);
  }else{
    client.say(channel, `${username} se inscreveu no canal! TwitchUnity`);
  }
});

client.on("resub", (channel, username, months, message, userstate, methods) => {
  if(methods.prime){
    client.say(channel, `${username} mandou o resub com prime por ${months}! GayPride`);
  }else{
    client.say(channel, `${username} se inscreveu no canal por ${months}! GayPride`);
  }
});
