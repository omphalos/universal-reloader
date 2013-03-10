#!/usr/bin/env node

var _         = require('underscore')
  , http      = require('http')
  , fs        = require('fs')
  , minimatch = require('minimatch')
  , optimist  = require('optimist')
  , socketIo  = require('socket.io')
  , watch     = require('watch')

var argv = optimist.
  usage('Automatically reload your browser when files change.\nUsage: $0').
  options('debounce', { alias: 'd', default: 100, describe: 'Debounce interval for throttling websocket publications.' }).
  options('folder', { alias: 'f', default: '.', describe: 'Root folder to watch for changes.' }).
  options('host', { alias: 'h', default: 'iframe', describe: 'Method to use to host your url: iframe or proxy.' }).
  options('mask', { alias: 'm', default: '**/*', describe: 'Pipe-delimited file patterns to watch (e.g., **/*.css|**/*.html).' }).
  options('port', { alias: 'p', default: 8080, describe: 'Port to run on.'}).
  options('recent', { alias: 'r', default: 100, describe: 'Interval of checks to the most-recently modified file.' }).
  options('url', { alias: 'u', describe: 'Url to auto-reload on file changes (e.g., http://example.com).' }).
  options('verbose', { describe: 'Toggle verbose logging.' }).
  demand('url').
  argv

var options = {
  argFilters:  argv.mask.split('|'),
  debounce:    argv.debounce,
  folderRoot:  argv.folder,
  hostingType: argv.host,
  recentFile:  argv.recent,
  port:        argv.port,
  url:         argv.url,
  verbose:     argv.verbose === true
}

if(options.verbose) console.log(options)

// Start web server.
var onHostedRequest = require('./hosts/' + options.hostingType + '.js')

var httpServer = http.createServer(function onRequest(req, res) {
  onHostedRequest(req, res, options)
})

httpServer.listen(options.port)

console.log('Listening on port ' + options.port + '.')
console.log('Navigate to http://localhost:' + options.port + ' to see your universal-reloadable page.')

var io = socketIo.listen(httpServer)

var notify = _.debounce(function innerNotify() {

  if(options.verbose)
    console.log('emitting update')

  io.sockets.emit('update', {})

}, options.debounce)

// Watch files.
var mostRecentFile

function filter(file) {

  return options.argFilters.some(function testArgFilter(argFilter) {

    var result = minimatch(file, argFilter)
    if(options.verbose) console.log(file + (result ? ' matched ' : ' failed to match ') + argFilter)
    return result
  })
}

function onWatchEvent(file, current, previous) {

  if(current && typeof file === 'string' && filter(file)) {

    mostRecentFile = { file: file, stats: current }
    notify()
  }
}

watch.watchTree(options.folderRoot, onWatchEvent)

// Set up most-recent-file listener (for optimized file watching).
setInterval(function checkMostRecentFile() {

  if(!mostRecentFile) return

  fs.stat(mostRecentFile.file, function(err, stats) {

    if(err) return mostRecentFile = null
    if(mostRecentFile.stats.mtime.getTime() === stats.mtime.getTime()) return

    mostRecentFile.stats = stats
    notify()
  })

}, options.recentFile)
