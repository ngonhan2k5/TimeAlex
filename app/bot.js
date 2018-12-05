//https://discordapp.com/oauth2/authorize?client_id=509269359231893516&scope=bot&permissions=3072
//https://discordapp.com/oauth2/authorize?client_id=515540575504826368&scope=bot&permissions=3072

var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug'

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../db/'+(isTest?'authtest':'auth')+'.json');

var {route, getChannelOption} = require('./route')

const BOTID = isTest?'515540575504826368':'509269359231893516',
      BOTTAG = '<@'+ BOTID +'>',
      BOTNAME = isTest?'@TimeAlexaT':'@TimeAlexa',
      OWNER = '228072055008919552'

global.OWNER = OWNER
global.BOTID = BOTID
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
<<<<<<< HEAD
      var channelID = event.d.channel_id,
      allowReaction = ((bot.channels[channelID] &&
                            bot.channels[channelID].permissions.user[global.BOTID] &&
                            bot.channels[channelID].permissions.user[global.BOTID].allow) & 64) == 64,
      doReact = function(){
        console.log(event) //Logs every event
=======
      if (event.d.emoji.name == '🕰' && event.d.user_id != BOTID){
        // console.log(event) //Logs every event
>>>>>>> 15865f4a758d2dae76e9fd8de068148ba3c43eff
        var {message_id: messageID, user_id: reactUserID, channel_id:channelID} = event.d

        bot.getMessage({channelID:channelID, messageID:messageID}, (err, msgObj)=>{
          // console.log(err, msgObj)
          var {content:message, author:{id:userID, username:user}, } = msgObj
          if (reactUserID!=userID && message){
            var send = function (msg){
              return sender(bot, msg, reactUserID, true)
            },
            cmd = 'timeReact',
            args = [message, true],
            data = {userID, user, send, bot, reactor:{id:reactUserID, user:bot.users[reactUserID].username}, channel_id:channelID}

            route(cmd, data, args)
          }
        })
      }

      if (event.d.emoji.name == '🕰' && event.d.user_id != BOTID){
        if (allowReaction){
          doReact()
        }else{
          getChannelOption(channelID).then(
            function(reaction){
              if (reaction) {
                console.log('ddddddd')
                doReact()
              }
            }
          )
        }

      }
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

  var cmd = 'mark',
      args = [message],
      data = {userID, user, send, isDM, bot, d:evt.d}

  //msg mention @TimeAlexa or Direct Message to bot,  DM chat have no guid_id
  if (message.startsWith(BOTTAG) || isDM) {
    args = message.split(' ');
    // if mention bot -> remove the mention from args
    if (message.startsWith(BOTTAG)) args.shift()
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

  route(cmd, data, args) || route('mark', data, [message])

});
