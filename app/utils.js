var moment = require('moment-timezone');
var { countries } = require ('moment-timezone/data/meta/latest.json')
var cities = require ('../ref/countries.min.json')

var utils = function (db){
  return {
      timeFormat: '',
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
        return Math.random().toString(36).substr(2); // remove `0.`
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

        })
      }
    }

}

module.exports = utils
