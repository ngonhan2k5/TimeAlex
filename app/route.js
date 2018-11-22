var Datastore = require('nedb')
//var datastore = require('nedb-promise')
var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
//var db = datastore({ filename: 'db/usertz.db', autoload: true });
var res = require('./resolve')
var moment = require('moment-timezone');
const FORMAT = 'LT ll'

const timeAlex = {
  timeAlex: function(){
    console.log(arguments)
    var arg = arguments
    return (new Date()).toString()
  },
  // @cnn reg +7
  reg : function (data, tz, pmKey, pm=null){
    console.log(666, tz, pmKey, pm)

    var {userID, user, send, isDM} = data;

    if (!tz) {
      // if (isDM)
      //   return send('Syntax:\r\n ```reg {timezone} [msg on|off]```\r\nEx:\r\n```reg UTC msg on```')
      // else
      //   return send('Syntax:\r\n ```@TimeAlexa reg {timezone} [msg on|off]```\r\nEx:\r\n```@TimeAlexa UTC -7 msg on```'.replace(isDM?'@TimeAlexa ':'',''))
      return this._info(data)

    }else if (!moment.tz.zone(tz)){
      return send('Timezone name wrong\r\n To find right timezone name, use ```@TimeAlexa find abc```\r\nEx:\r\n```@TimeAlexa find los```')
    }

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

      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  }, // end reg
  _info : function (data){
    var {userID, user, send, isDM} = data;
    console.log('Info', arguments)

    var query = { _id: userID}
    db.find(query, function (err, docs) {   // Callback is optional
      console.log("Found: ", docs)
      if (!err && docs && docs.length > 0){
        var {tz, dmsg} = docs.pop()
        send((isDM?'You':user) + ' has **'+ tz + '** timezone and **Direct Message ' + (dmsg?'opt-in':'opt-out')+ "** with me");
      }else{
        send('Your setting not found. Please register your setting with:```@TimeAlexa reg {timezone} [msg on|off]```\r\nExample: find your tz then use it to register```@TimeAlexa find york //should return America/New_York\r\n@TimeAlexa reg America/New_York msg on``` ')
      }

    });
  }, // end reg
  //
  time : function (data, message){
    //console.log(arguments)
    var {userID, user, send, evt:{d:{mentions}} } = data;
    console.log(121212, mentions)
    var items = res.process(message);

    utils.userTz(userID).then(function(tz){
      console.log(343434, userID, fromUserTz)
      var msg = []
      var fromUserTz = tz && tz.tz
      // answer to channel
      for (const item of items) {
        msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item.data, fromUserTz) + ' in UTC time**')
      }
      if (msg.length)
      send(data.user + ' has talked about '+  msg.join(' and '))

      // PM to mentioned users
      for (const muser of mentions) {
        // check mentioned user setting option dmsg
        utils.userTz(muser.id).then(function(tz){

          if (!tz || !tz.dmsg) return

          var msg = [],
          toUserTz = tz && tz.tz

          for (const item of items) {
            msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item.data, fromUserTz, toUserTz) + '** in your **'+toUserTz+'** time')
          }
          if (msg.length)
          send(data.user + ' has talked about (<#514297100566265869>):\r\n'+  msg.join(' and\r\n'), muser.id)
        })
      }
    })
  },
  find: function(data, kw, page=1){
    console.log(arguments)

    if (!kw) return
    var page = isNaN(page)?1:Number.parseInt(page)
    var result = utils.findTzName(kw)
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

  help: function(data){
    var {send} = data;
    utils.sendHelp(send)
  },
  now: function(data, arg1){
    var {send, userID, isDM, bot} = data;
    if (arg1){
      var toTzUid = arg1.match(/<@(\d+)>/)
      if (toTzUid && !isNaN(toTzUid[1])){
        utils.userTz(toTzUid[1]).then(function(tz){
          console.log(toTzUid[1], bot.users[toTzUid[1]].username)
          send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT)+ '** at **@'+ bot.users[toTzUid[1]].username +'** place')
        }).catch(function(err){
          send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT)+ '** UTC\r\n(***'+ bot.users[toTzUid[1]].username +'*** *did not register a timezone*)')
        })
      }else if (moment.tz.zone(arg1)){ //
        send('<@'+userID+'>: Now is **'+moment.tz(arg1).format(FORMAT)+ '** in **'+ arg1 +'** timezone')
      }else{
        var result = utils.findTzName(arg1).shift()
        if (result)
          send('<@'+userID+'>: Now is **'+moment.tz(result).format(FORMAT)+ '** in **'+ result +'** timezone')
        else
          send('<@'+userID+'>: No timezone found')
      }

    }else{
      utils.userTz(userID).then(function(tz){
        send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT)+ '** at your place')
      }).catch(function(err){
        send('<@'+userID+'>: Now is **'+moment.tz(tz&&tz.tz).format(FORMAT)+ '** UTC\r\n(***'+ bot.users[toTzUid[1]].username +'*** *did not register a timezone*)')
      })
    }
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
    let a = moment.tz(timeData.value, timeData.format, fromTz)
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
  sendHelp: function(send){
    send({
      color: 3447003,
      // author: {
      //   name: client.user.username,
      //   icon_url: client.user.avatarURL
      // },
      title: "Help for TimeAlexa",
      url: "http://google.com",
      description: "TimeAlexa will check people's text content and pick up text parts that **considerated a time** in: \r\n \
      1. Your text: convert to UTC+0 and send right in channel\r\n \
      2. Others text that mentioned you: convert to your Tz and Direct Messages to you\r\n \
      (only with **Direct Message option** is on)",
      fields: [{
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
      }
      ],
      timestamp: new Date(),
      footer: {
        // icon_url: client.user.avatarURL,
        text: "Notes: you doesn't need @TimeAlexa in PM with bot\r\n© TimeAlex"
      }
    })
  },
  findTzName: function (kw){
    var result = []

    if (kw.toUpperCase()!=kw){
      let tzList = moment.tz.names()
      result = tzList.filter(function(i){return i.toUpperCase().indexOf(kw.toUpperCase()) > -1})
      //result = abbrList.filter(function(item){return item[0].toUpperCase().indexOf(kw.toUpperCase()) > -1}).map(function(i){return i[0] + ' ('+ i[1] + ')'})
    }else{// if all upcase -> search abbreviation
      var abbrList = Object.values(moment.tz._zones).map(function(item){
        if (item instanceof moment.tz.Zone)
        return [item.name, item.abbrs.filter(function (value, index, self) {
          return self.indexOf(value) === index;
        }).join(' ')]
        else{
          var it = item.split('|').slice(0,2)
          return [it[0], it[1].split(' ').filter(function (value, index, self) {
            return self.indexOf(value) === index;
          }).join(' ')]
        }
      })
      // console.log(4444444, abbrList)
      result = abbrList.filter(function(item){return item[1].toUpperCase().indexOf(kw.toUpperCase()) > -1}).map(function(i){return '**'+i[0]+'**' + ' ('+ i[1] + ')'})
    }
    return result
  }
}


//(cmd, args, userID, user, send)
const route = function(action, data, args){
  if (!action.startsWith('_') && timeAlex[action]){
    return timeAlex[action].apply(timeAlex, [data, ...args]) || true;
  }else{
    return false
  }
}


module.exports = {
  process: timeAlex,
  route:route
}
