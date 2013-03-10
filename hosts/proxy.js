var _ = require('underscore')
  , cheerio = require('cheerio')
  , fs = require('fs')
  , gremlin = require('proxy-gremlin')
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

    // buffer the response using proxy-gremlin
    var buffer = new gremlin.Buffer(res)

    // set up a listener for when the response is complete
    res.on('end', function() {

      // insert the script into the outgoing html
      if(buffer.headers['content-type'] === 'text/html') {

        $ = cheerio.load(buffer.getData())
        var root = $('body').length ? $('body') : $.root

        if(options.verbose)
          console.log('intercepting ' + req.url)

        root.append('<script src="/socket.io/socket.io.js"></script>\n')
        root.append('<script>\n' + listenAndReloadScript + '\n</script>\n')

        // overwrite data in the request
        buffer.setData($.html())
      }

      // send the buffered request
      buffer.send()
    })

    if(options.verbose)
      console.log({ message: 'proxying url', url: parsedUrl })

    // Proxy the request
    proxy.proxyRequest(req, res, {
      host: parsedUrl.hostname,
      port: parsedUrl.port || 80
    })
  })
}
