var isTest = process.env.OS == 'Windows_NT'
const LINK = isTest?'localhost:3000':'talex.b-reserved.com'

var { countries } = require ('moment-timezone/data/meta/latest.json')
var cities = require ('../ref/countries.min.json')
var Datastore = require('nedb')
var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
const tokens = new Datastore({ filename: 'db/usertoken.db', autoload: true });

var res = require('./resolve')
var moment = require('moment-timezone');

const FORMAT = 'LT ll',
      FORMAT_TIME = 'LT'
const timeAlex = {
  // Register
  reg : function (data, tz, pmKey, pm=null){
    console.log(666, tz, pmKey, pm)

    var {userID, user, send, isDM} = data;

    if (!tz) {
      // if (isDM)
      //   return send('Syntax:\r\n ```reg {timezone} [msg on|off]```\r\nEx:\r\n```reg UTC msg on```')
      // else
      //   return send('Syntax:\r\n ```@TimeAlexa reg {timezone} [msg on|off]```\r\nEx:\r\n```@TimeAlexa UTC -7 msg on```'.replace(isDM?'@TimeAlexa ':'',''))
      return this._info(data).then(()=>{},(data)=>{
        regLink(data).then((token)=>{
          send(`Or click to register: http:\/\/${LINK}/?token=${token.token}`, userID)
          console.log(token)
        })

      })

    }else if (!moment.tz.zone(tz)){
      return send('Timezone name wrong\r\n To find right timezone name, use ```@TimeAlexa find abc```\r\nEx:\r\n```@TimeAlexa find los```')
    }

    utils.registerTz({userID, user, tz, isDM},  send)
    
  }, // end reg
  _info : function (data){
    var {userID, user, send, isDM} = data;
    console.log('Info', arguments)

    var query = { _id: userID}
    return new Promise((resolve, reject) => {
      db.find(query, function (err, docs) {   // Callback is optional
        console.log("Found: ", docs)
        if (!err && docs && docs.length > 0){
          var {tz, dmsg} = docs.pop()
          send((isDM?'You':user) + ' has **'+ tz + '** timezone and **Direct Message ' + (dmsg?'opt-in':'opt-out')+ "** with me");
          resolve(true)
        }else{
          send('Your setting not found. Please register your setting with:```@TimeAlexa reg {timezone} [msg on|off]```\r\nExample: find your tz then use it to register```@TimeAlexa find york //should return America/New_York\r\n@TimeAlexa reg America/New_York msg on``` ')
          reject(data)
        }
      });
    })
  },
  // process message to find time text
  time : function (data, message){
    console.log(arguments)
    var items = res.process(message);

    if(items.length==0) return
    console.log(131313, items);

    items = items.map(function(item){
      if (item.abbr){
        item.tz = utils.findTzName(item.abbr).shift()
      }
      return item
    })

    var {userID, user, send, d:{mentions, channel_id} } = data;
    console.log(121212, mentions, data.evt)
    // console.log(131313, items); return

    utils.userTz(userID).then(
      function(tz){
        console.log(343434, userID, tz, mentions)
        var msg = []
        var fromUserTz = tz.tz
        // answer to channel
        for (const item of items) {
          msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item, fromUserTz) + ' in UTC time**')
        }

        send(data.user + ' has talked about '+  msg.join(' and '))

        // PM to mentioned users
        if (!mentions) return

        for (const muser of mentions) {
          // check mentioned user setting option dmsg
          utils.userTz(muser.id).then(
            function(tz){

              if (!tz.dmsg) return

              var msg = [],
              toUserTz = tz.tz

              for (const item of items) {
                msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item, fromUserTz, toUserTz) + '** in your **'+toUserTz+'** time')
              }
              if (msg.length)
                send('**'+data.user + '** has talked in <#' + channel_id + '> about:\r\n'+  msg.join(' and\r\n'), muser.id)
            },
            // rejected: remind mentioned users about register a tz
            function(er){
              console.log('here')
              var msg = []
              for (const item of items) {
                msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item, fromUserTz) + '** in **UTC** time')
              }
              if (msg.length)
                send('**'+data.user + '** has talked in <#' + channel_id + '> about:\r\n'+  msg.join(' and\r\n') +
                '. Please register a timezone allow me translate the time for you', muser.id)
            }
        ).catch(function (){
              //send(data.user + ' has talked about (<#514297100566265869>):\r\n'+  msg.join(' and\r\n'), muser.id)
          })
        }
      },
      // rejected: talking user not register a tz
      function(er){
        console.log(343434, userID, er)
        var msg = []
        // not answer to channel just remind user regist a tz
        for (const item of items) {
          msg.push('\"**' + item.key.trim() + '**\"')
        }

        send('<@'+userID+'> You has talked '+  msg.join(' and ') + '. Please register a timezone to help translate your time correctly.')

        // No need PM to mentioned users
      }
    ).catch(function (){},

  )
  },
  find: function(data, kw, arg1, arg2){
    console.log(arguments)

    if (!kw) return
    var page = isNaN(arg1)?(isNaN(arg2)?1:Number.parseInt(arg2)):Number.parseInt(arg1)
    var country = typeof arg1 == 'string'? arg1: null;
    var result = utils.findTzName(kw, true, country)
    var {send} = data;

    // console.log(result)
    var ipp = 25,
        nextPage = page+1
        length = result.length - (page-1)*ipp

    result = result.slice(page*ipp-ipp,page*ipp)

    if (length > 0){
      if (length > ipp)
      result.push('... ```@TimeAlexa find '+kw+' '+ nextPage +'``` to get next page')
    }else{
      return send('No '+ (kw.toUpperCase()!=kw?'timezone':'abbreviation') +' match your keyword')
    }

    send(result.join(', '))

  },

  help: function(data, detail=false){
    var {send} = data;
    return detail?utils.sendHelp(send):utils.sendHelpShort(send)
  },
  now: function(data, arg1, arg2){
    var {send, userID, isDM, bot} = data;
    if (arg1){
      var toTzUid = arg1.match(/<@(\d+)>/)
      if (toTzUid && !isNaN(toTzUid[1])){ // now of mentioned user
        utils.userTz(toTzUid[1]).then(
          function(tz){
            console.log(toTzUid[1], bot.users[toTzUid[1]].username)
            send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT)+ '** at **@'+ bot.users[toTzUid[1]].username +'** place')
          },
          function(er){
            send('<@'+userID+'>: Now is **'+moment.tz('UTC').format(FORMAT)+ '** UTC\r\n(***'+ bot.users[toTzUid[1]].username +'*** *did not register a timezone*)')
          }
        ).catch(function(err){})
      }else if (moment.tz.zone(arg1)){ //
        send('<@'+userID+'>: Now is **'+moment.tz(arg1).format(FORMAT)+ '** in **'+ arg1 +'** timezone')
      }else{
        var result = utils.findTzName(arg1, true, arg2).shift()
        if (result)
          send('<@'+userID+'>: Now is **'+moment.tz(result).format(FORMAT)+ '** in **'+ result +'** timezone')
        else
          send('<@'+userID+'>: No timezone found')
      }

    }else{ // `now` use tz of asking user
      utils.userTz(userID).then(
        function(tz){
          send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT_TIME)+ '** at your time')
        },
        function(er){
          send('<@'+userID+'>: Now is **'+moment.tz('UTC').format(FORMAT)+ '** UTC\r\n(***You*** *did not register a timezone*)')
        }).catch(function(err){
        })
    }
  },
  _run: function(data){
    // console.log(222222,arguments)
    var args = [...arguments].slice(1)
    var {send, userID, isDM, bot} = data;

    //if (args.length == 0 || userID != '228072055008919552') return
    var cmd = args.shift()

    args = args.map(function(item){return item.replace(/_/g,' ')})
    // const { spawn } = require('child_process');
    const spawn = require('cross-spawn');
    const child = spawn(cmd, args);

    // use child.stdout.setEncoding('utf8'); if you want text chunks
    child.stdout.on('data', (chunk) => {
      // data from standard output is here as buffers
      send(chunk.toString(), userID)
    });

    // since these are streams, you can pipe them elsewhere
    child.stderr.on('data', (chunk) => {
      // data from standard output is here as buffers
      send(chunk.toString(), userID)
    });

    child.on('close', (code) => {
      send(`child process exited with code ${code}`, userID)
      console.log(`child process exited with code ${code}`);
    });
  },
  _unreg: (data, rmUserID) => {
    if(!rmUserID) return
    db.remove({_id: rmUserID}, ()=>{
      data.send('Removed', data.userID)
    })
  }
}

var utils = {
  timeFormat : '',
  userTz : function(userID){
    return new Promise(function(resolve, reject) {
      var query = { _id: userID }
      db.findOne(query , function (err, doc) {   // Callback is optional
        console.log("Found: ", err, doc)
        if (err||!doc){
          console.log(2222222222,err)
          reject(err)
        }else{
          resolve(doc)
        }
      })
    })
    //return doc.tz
  },
  tzConvert : function(timeData, fromTz, toTz='UTC'){
    console.log(44444444, arguments)
    let a = moment.tz(timeData.value, timeData.format, timeData.tz || fromTz)
    a.tz(toTz)
    return a.format(FORMAT)
  },
  sendHelpA: function(send){
    send('Your timezone will using to Translate the **considerated time content**: \r\n \
    1. In your message to UTC+0 and send right in channel\r\n \
    2. In chat messages of others one that mentioned you and will send to you as Direct Messages \r\n \
    (only with **Direct Message option** is on)\r\n \
    **Considerated time** examples: "**3pm**", "**12am**", "**tomorrow 3pm**", "**yesterday 12am**", "**tmw 12am**" \r\n \
    ***Commands***:\r\n \
    `@TimeAlexa time` to show current time \r\n \
    `@TimeAlexa reg {timezone} [msg on|off]` to register \r\n \
    `@TimeAlexa reg` without arguments to check your setting \r\n \
    `@TimeAlexa find` to find timezone right name \r\n');
  },
  sendHelp: function(send, bot){
    send({
      color: 3447003,
      // author: {
      //   name: client.user.username,
      //   icon_url: client.user.avatarURL
      // },
      title: "Help for TimeAlexa",
      url: "https://discordbots.org/bot/509269359231893516",
      description: "TimeAlexa will check people's text content and pick up text parts that **considerated a time** in: \r\n \
      1. Your text: convert to UTC+0 and send right in channel\r\n \
      2. Others text that mentioned you: convert to your Tz and Direct Messages to you\r\n \
      (only with **Direct Message option** is on)",
      fields: [
        {
          name: "Register Setting",
          value: "```@TimeAlexa reg {timezone} [msg on|off]```"
        },
        {
          name: "Check Settings",
          value: "```@TimeAlexa reg```_without any arguments_\r\n"
        },
        {
          name: "Find Timezone Name",
          value: "```@TimeAlexa find {keyword}```{keyword} _with all upcase will take as abbreviation like PST_\r\n*otherwise will take as timezone name like Los_Angeles or just los*\r\n\r\n"
        },
        {
          name: "Current Time",
          value: "```@TimeAlexa now [@mention_user|timezone_search]```**wo. @mention_user**: _Display current time with your registerd timezone_\r\nExample: ` @TimeAlexa now `\r\n"+
                 "\r\n**with @mention_user**: *will show current time in mentioned user's timezone (if he registed)*\r\nExample: ` @TimeAlexa now @username `\r\n" +
                 "\r\n**with timezone_search**: *will show current time in found first timezone*\r\nExample: ` @TimeAlexa now los `"
        },
        {
          name: "\r\nConsiderated time - Supported",
          value: "`2 am` `5PM`\r\n"+
                 "`2:30am` `12:03 PM`\r\n"+
                 "`2:30am est` `12:03 PM PST`\r\n"
        },
        {
          name: "Notes: you doesn't need @TimeAlexa in PM",
          value: "Ex: `@TimeAlexa now` -> `now`"
        }
      ],
      timestamp: new Date(),
      footer: {
        // icon_url: client.user.avatarURL,
        text: "© TimeAlex"
      }
    })
  },
  sendHelpShort: function(send, bot){
    send({
      color: 3447003,
      // author: {
      //   name: client.user.username,
      //   icon_url: client.user.avatarURL
      // },
      title: "Help for TimeAlexa",
      url: "https://discordbots.org/bot/509269359231893516",
      description: "TimeAlexa translate time text in context like **2pm** **12:03 PM PST**,...",
      fields: [
        {
          name: "1. Find a Timezone",
          value: "```@TimeAlexa find {keyword}```{keyword}: `PST`, `Los_Angeles` or just `los`"
        },
        {
          name: "2. Set your Timezone",
          value: "```@TimeAlexa reg {timezone} [msg on|off]```"
        },
        {
          name: "\r\n* More detail ?",
          value: "```@TimeAlexa help more```Notes: you doesn't need @TimeAlexa in PM with bot"
        }
      ],
      timestamp: new Date(),
      footer: {
        // icon_url: client.user.avatarURL,
        text: "© TimeAlex"
      }
    })
  },
  findTzName: function (kw, searchCity=false, country){
    console.log(555555, arguments)
    var result = []
    if (kw.toUpperCase()!=kw){
      // find in moment zone
      let tzList = moment.tz.names()
      result = tzList.filter(function(i){return i.toUpperCase().indexOf(kw.toUpperCase()) > -1})
      //result = abbrList.filter(function(item){return item[0].toUpperCase().indexOf(kw.toUpperCase()) > -1}).map(function(i){return i[0] + ' ('+ i[1] + ')'})
      // if no result find in country
      if (result.length==0){ //try  to get by country
        var result2 = Object.values(countries).find(function(item){
          return item.name.toUpperCase().indexOf(kw.toUpperCase()) > -1
        })
        if (result2)
          return [result2.zones[0]]
      }
      // find in cities Data

    }else{// if all upcase -> search abbreviation
      var current = new Date().getTime()
      var abbrList = Object.values(moment.tz._zones).map(function(item){

        if (typeof item == 'string')
          item = moment.tz.unpack(item)

        return [item.name, moment.tz.zone(item.name).abbr(current)]
      })
      // abbreviation need exact match
      result = abbrList.filter(function(item){return item[1].toUpperCase().indexOf(kw.toUpperCase()) > -1}).map(function(i){return i[0]})
      console.log(4444444, result)

    }

    if (result.length==0 && searchCity){
      var cityTz = require('../ref/cities-tz.min.json')
      result = cityTz.filter(function(item){
        return (!country || country.toUpperCase() == item.country.toUpperCase()) && item.name.toUpperCase().indexOf(kw.toUpperCase()) > -1 && item.zones && item.zones.length
      }).map(function(item){
        return item.zones[0]
      })
    }

    return result
  },
  token : () => {
    var rand = function() {
        return Math.random().toString(36).substr(2); // remove `0.`
    };
    return rand() + rand(); // to make it longer
  },
  registerTz : function (data, send){
    // console.log(send('111111'), 11111111)
    var {user, userID, tz, isDM, pmKey} = data

    var newData = { _id: userID, tz: tz},
    dmsg = (pmKey=='msg' && (pm=='on' || pm==null) )

    if (pmKey=='msg') newData.dmsg = dmsg

    db.insert(newData, function (err, newDoc) {   // Callback is optional
      console.log("Reg error", err, err && err.errorType)
      if (!err)
      send( (isDM?'You': user) + ' has registered timezone **'+ tz + '** and **Direct Message ' + (dmsg?'enabled':'disabled')+ '**');
      else if (err.errorType == 'uniqueViolated'){
        db.update({ _id: userID }, { $set: newData}, {}, function (err, numReplaced) {
          console.log("Update error", err, numReplaced)
          if (!err && numReplaced)
            send( (isDM?'You': user) + ' has changed timezone to **'+ tz + '**' + (pmKey=='msg'?(' and **Direct Message ' + (dmsg?'enabled':'disabled')+'**'):'') );
          else if (err){
            send('Timezone change failed')
          }
        });
      }else{
        send('Timezone register failed')
      }

    });
  }

}

// var sender;
//(cmd, args, userID, user, send)
const route = function(action, data, args){
  // normal actions
  if (!action.startsWith('_') && timeAlex[action]){
    return timeAlex[action].apply(timeAlex, [data, ...args]) || true;
  // operating actions start with _ for only bot owner
  }else if (timeAlex['_'+action] && data.userID == '228072055008919552'){
    return timeAlex['_'+action].apply(timeAlex, [data, ...args]) || true;
  }else{
    return false
  }
}

const regLink = (data) => {
    var {userID, user, send, isDM} = data;
    var doc = {token:utils.token(), userID, user}
    return new Promise ((resolve, reject)=>{
      tokens.insert(doc, function (err, newDoc) {   // Callback is optional
        if(newDoc){
          resolve(newDoc)
        }else{
          reject(err)
        }
      })
    })
  }

var sender = {};


const registerTz = function(query, send){
  // console.log(88888,send)
  return new Promise(
    (resolve, reject) => {
      var tz= query.tz || 'UTC'
      tokens.findOne({token: query.token}, (err,doc)=>{
        if (doc){
          console.log(66666666, doc)
          utils.registerTz({userID: doc.userID, user: doc.user, tz, idDM: true}, send(doc.userID))
          
          tokens.remove({token: query.token}, ()=>{
            resolve(doc)  
          })
        }else{
          reject(err)
        }
      })
    }
  )
}

const log = function(name, query, send){
  // console.log(88888,send)
  send('228072055008919552').send('['+name+'] '+JSON.stringify(query))
}


module.exports = {
  process: timeAlex,
  route:route,
  registerTz: registerTz,
  sender: sender,
  log:log
}

// https://discordbots.org/bot/509269359231893516
