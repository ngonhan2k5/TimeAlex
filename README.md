[![Discord Bots](https://discordbots.org/api/widget/status/509269359231893516.svg?noavatar=true)](https://discordbots.org/bot/509269359231893516)[![Discord Bots](https://discordbots.org/api/widget/servers/509269359231893516.svg?noavatar=true)](https://discordbots.org/bot/509269359231893516)

# TimeAlex
A Discord Bot help translate mentioned time for user across timezone

TimeAlexa will check people's text content and pick up text parts that **considerated a time** in:
  1. Your text: convert to UTC+0 and send right in channel
  2. Others text that mentioned you: convert to your Tz and Direct Messages to you  
 (only with **Direct Message option** is on)

## [Add to your Discord Server!](https://discordapp.com/oauth2/authorize?client_id=509269359231893516&scope=bot&permissions=3072)

## Register Setting
    @TimeAlexa reg {timezone} [msg on|off]

## Check Settings
    @TimeAlexa reg
 without any arguments

## Find Timezone Name
    @TimeAlexa find {keyword}
* {keyword} with all upcase will take as abbreviation like `PST`
* otherwise will take as timezone name like `Los_Angeles` or just `los` or Country name like `Bulgari` or `Viet`
      
## Current Time
    @TimeAlexa now [@mention_user|timezone_search]
* wo. @mention_user:
    _Display current time with your registerd timezone_
    Example: ` @TimeAlexa now `
* with @mention_user: 
    *will show current time in mentioned user's timezone (if he registed)*
    Example: ` @TimeAlexa now @username `
* with timezone_search: *will show current time in found first timezone*
    Example: ` @TimeAlexa now los `

## Considerated time - Supported
*   Short hour: `2 am` `5pm`  
*   With minutes: `2:30am` `12:03 pm`
*   With abbr: `2:30am EST` `12:03 pm PST`
