var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/auth.json');
var {route} = require('./route')
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
    console.log(arguments, evt.d.member)
    // if (message.substring(0, 1) == '!') {
    //     var args = message.substring(1).split(' ');
    //     var cmd = args[0];
    //
    //     args = args.splice(1);
    //     switch(cmd) {
    //         // !ping
    //         case 'ping':
    //             bot.sendMessage({
    //                 to: channelID,
    //                 message: 'Pong!'
    //             });
    //         break;
    //         case 'time':
    //             bot.sendMessage({
    //                 to: channelID,
    //                 message: timealex.process(arguments)
    //             });
    //         break;
    //         case 'reg':
    //             bot.sendMessage({
    //                 to: channelID,
    //                 message: timealex.route(cmd, arguments)
    //             });
    //         break;
    //         // Just add any case commands if you want to..
    //      }
    //  }
    // console.log(89899,evt.d.guild_id)
    // Is direct message
    var isDM = !evt.d.guild_id;
     //<@509269359231893516> reg +7 msg on
     if (message.startsWith('<@509269359231893516>')) { //only msg mention @TimeAlexa
        var args = message.split(' ');
        var cmd = args[1];
        args = args.splice(2);
        route(cmd, {userID, user, send, isDM}, args)
      
       //reg +7 msg on
      }else if (!evt.d.guild_id){ // Direct Message to bot,  DM chat have no guid_id
        var args = message.split(' ');
        var cmd = args[0];
        args = args.splice(1);
        route(cmd, {userID, user, send, isDM}, args)
     }else if (userID != '509269359231893516'){ // avoid message send by this bot
       route('time', {userID, user, send, evt} , [message] )
     }

});
