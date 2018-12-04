//https://discordapp.com/oauth2/authorize?client_id=509269359231893516&scope=bot&permissions=3072
//https://discordapp.com/oauth2/authorize?client_id=515540575504826368&scope=bot&permissions=3072

var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug'

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/'+(isTest?'authtest':'auth')+'.json');

var {route} = require('./route')

const BOTID = isTest?'<@515540575504826368>':'<@509269359231893516>',
      BOTNAME = isTest?'@TimeAlexaT':'@TimeAlexa',
      OWNER = '228072055008919552'

global.OWNER = OWNER

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});



var sender = function (bot, msg, chID, isDM=false){
    if (typeof msg == 'string')
      bot.sendMessage({
        to: chID,
        message: msg.replace(isDM?'@TimeAlexa ':'','')
      });
    else
      bot.sendMessage({
        to: chID,
        embed: msg
      });
  }



bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');

  var sendPM = function (userID){
      return function(msg){sender(bot, msg, userID, true)}
  }


  // console.log(1111,bot)
  var server = require('./server').start(sendPM)

});


bot.on("any", function(event) {
  if(event.t == 'MESSAGE_REACTION_ADD'){
      if (event.d.emoji.name == '🕰')
        console.log(event) //Logs every event
  }

});



bot.on('message', function (user, userID, channelID, message, evt) {

  // avoid message send by bots
  if (evt.d.author && evt.d.author.bot) return

  // Is direct message
  var isDM = !evt.d.guild_id;

  var send = function (msg, chID=channelID){
        return sender(bot, msg, chID, isDM)
    }

  var cmd = 'time',
      args = [message],
      data = {userID, user, send, isDM, bot, d:evt.d}

  //msg mention @TimeAlexa or Direct Message to bot,  DM chat have no guid_id
  if (message.startsWith(BOTID) || isDM) {
    args = message.split(' ');
    // if mention bot -> remove the mention from args
    if (message.startsWith(BOTID)) args.shift()
    // convert function
    if (args.join(' ').indexOf('>') > -1){
      cmd = 'from'
      args = args.join(' ').split('>').map((item)=> item.trim());
    }else{
      cmd = args[0].toLowerCase();
      args = args.splice(1);
    }
  }else if (message.startsWith('!help')) { // global help
    cmd = 'help'
    args = []
  }
  // if(isDM && message.indexOf('>') > -1 ){
  //   cmd = 'from'
  //   args = message.split('>').map((item)=> item.trim());
  // }

  route(cmd, data, args) || route('time', data, [message])

});
