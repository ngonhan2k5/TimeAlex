var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/auth.json');
var {route} = require('./route')

var moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();

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
bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  var send = function (msg, chID=channelID){
    bot.sendMessage({
      to: chID,
      message: msg
    });
  }
  // console.log(arguments, evt.d.member)
  // avoid message send by this bot
  if (userID == '509269359231893516') return
  // Is direct message
  var isDM = !evt.d.guild_id;
  //<@509269359231893516> reg GMT+4 msg on
  if (message.startsWith('<@509269359231893516>')) { //msg mention @TimeAlexa
    var args = message.split(' ');
    var cmd = args[1];
    args = args.splice(2);
    route(cmd, {userID, user, send, isDM}, args)
  }else if (message.startsWith('!help')) { //msg mention @TimeAlexa
    route('help', {send, isDM}, [])
    //reg +7 msg on
  }else if (!evt.d.guild_id){ // Direct Message to bot,  DM chat have no guid_id
    var args = message.split(' ');
    var cmd = args[0];
    args = args.splice(1);
    route(cmd, {userID, user, send, isDM}, args)
  }else {
    route('time', {userID, user, send, evt} , [message] )
  }

});
