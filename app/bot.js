//console.log( process.env );
/*
(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();
*/
//https://discordapp.com/oauth2/authorize?client_id=509269359231893516&scope=bot&permissions=3072
//https://discordapp.com/oauth2/authorize?client_id=515540575504826368&scope=bot&permissions=3072

var isTest = process.env.OS == 'Windows_NT'

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/'+(isTest?'authtest':'auth')+'.json');
var {route} = require('./route')

const BOTID = isTest?'<@515540575504826368>':'<@509269359231893516>'

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
  // console.log(1111,bot)
});

bot.on('message', function (user, userID, channelID, message, evt) {

  if (evt.d.author && evt.d.author.bot) return

  // Is direct message
  var isDM = !evt.d.guild_id;

  var send = function (msg, chID=channelID){
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
  console.log( evt.d.member, 'Author', evt.d.author)
  // avoid message send by this bot
  //if (userID == '509269359231893516' ) return
  //<@509269359231893516> reg GMT+4 msg on
  if (message.startsWith(BOTID)) { //msg mention @TimeAlexa
    var args = message.split(' ');
    var cmd = args[1].toLowerCase();
    args = args.splice(2);
    route(cmd, {userID, user, send, isDM, bot}, args)||
    route('time', {userID, user, send, evt}, [message])
  }else if (message.startsWith('!help')) { //msg mention @TimeAlexa
    route('help', {send, isDM}, [])
    //reg Los_Angeles msg on
  }else if (!evt.d.guild_id){ // Direct Message to bot,  DM chat have no guid_id
    var args = message.split(' ');
    var cmd = args[0].toLowerCase();
    args = args.splice(1);
    console.log(22222,args)
    route(cmd, {userID, user, send, isDM, bot}, args)
  }else {
    route('time', {userID, user, send, evt} , [message] )
  }

});
