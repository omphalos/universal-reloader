var _ = require('underscore')
  , cheerio = require('cheerio')
  , fs = require('fs')
  , goblin = require('../goblin.js')
  , http = require('http')
  , httpProxy = require('http-proxy')
  , url = require('url')

var listenAndReloadScript = fs.
  readFileSync(__dirname + '/../assets/listenAndReload.js').
  toString();

module.exports = function(options) {

  var parsedUrl = url.parse(options.url)
    , proxy = new httpProxy.RoutingProxy()

  return http.createServer(function(req, res) {

    var buffer = new goblin.Buffer(res)

    res.on('end', function() {

      // insert the script into the outgoing html
      if(buffer.getHeader('Content-Type') === 'text/html') {

        $ = cheerio.load(buffer.getData())
        var root = $('body').length ? $('body') : $.root

        if(options.verbose) console.log('intercepting ' + req.url)

        root.append('<script src="/socket.io/socket.io.js"></script>\n')
        root.append('<script>\n' + listenAndReloadScript + '\n</script>\n')

        buffer.setData($.html())
      }

      buffer.send()
    })

    if(options.verbose)
      console.log({ message: 'proxying url', url: parsedUrl })

    proxy.proxyRequest(req, res, {
      host: parsedUrl.hostname,
      port: parsedUrl.port || 80
    })
  })
}
