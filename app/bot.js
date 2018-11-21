var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/auth.json');
var timealex = require('./timealex')
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
    var send = function (msg){
      bot.sendMessage({
          to: channelID,
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
     //<@509269359231893516> ddd
     if (message.startsWith('<@509269359231893516>')) {
       var args = message.split(' ');
       var cmd = args[1];
       args = args.splice(2);
       timealex.route(cmd, {userID, user, send}, args)
     }else if (userID != '509269359231893516'){
       timealex.route('time', {userID, user, send} , [message] )
     }

});
