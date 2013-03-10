var _         = require('underscore')
  , cheerio   = require('cheerio')
  , fs        = require('fs')
  , gremlin   = require('proxy-gremlin')
  , http      = require('http')
  , httpProxy = require('http-proxy')
  , url       = require('url')

var listenAndReloadScript = fs.
  readFileSync(__dirname + '/../assets/listenAndReload.js').
  toString();

var proxy = new httpProxy.RoutingProxy()
  , parsedUrl

module.exports = function onProxyRequest(req, res, options) {

  // Intercept requests with proxy-gremlin.
  gremlin.intercept(res, interceptor)

  // Proxy the request.
  parsedUrl = parsedUrl || url.parse(options.url)

  if(options.verbose)
    console.log('proxying ' + parsedUrl.protocol +'//' + parsedUrl.host + req.url)

  proxy.proxyRequest(req, res, {
    host: parsedUrl.hostname,
    port: parsedUrl.port || 80
  })
}

// This function intercepts outgoing html documents
// and adds our websocket and reload scripts.
function interceptor(buffer) {

  // Do nothing if the response isn't html.
  if(buffer.headers['content-type'] !== 'text/html') return

  // Parse the page.
  $ = cheerio.load(buffer.getData())
  var root = $('body').length ? $('body') : $.root

  root.append('<script src="/socket.io/socket.io.js"></script>\n')
  root.append('<script>\n' + listenAndReloadScript + '\n</script>\n')

  // overwrite data in the request
  buffer.setData($.html())
}
