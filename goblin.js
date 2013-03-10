var util = require('util')

function Buffer(res) {

  var self = this

  self.res = res

  self._chunks = []
  self._headers = {}

  ///////////////////////////////
  // monkey patch the response //
  ///////////////////////////////

  self._end = res.end
  self._write = res.write
  self._writeHead = res.writeHead

  function write(chunk, encoding) {
    if(chunk) self._chunks.push(chunk)
    if(encoding) self._encoding = encoding
  }

  res.writeHead = function(statusCode, headers) {

    self._headers = headers
    self._statusCode = statusCode

    res.emit('writeHead', headers, statusCode)
  }

  res.write = function(chunk, encoding) {

    write(chunk, encoding)

    res.emit('write', chunk, encoding)
  }

  res.end = function(chunk, encoding) {

    write(chunk, encoding)

    res.emit('end', chunk, encoding)
  }
}

////////////
// helper //
////////////

Buffer.prototype._resolveHeaderName = function resolveHeaderName(header) {

  var headers = Object.keys(this._headers)
  var match = headers.
    map(function(h) { return h.toLowerCase() }).
    indexOf(header.toLowerCase())
  return headers[match] || header
}

//////////////////////
// public interface //
//////////////////////

Buffer.prototype.setHeader = function(header, value) {
  this._headers[this._resolveHeaderName(header)] = value
}

Buffer.prototype.getHeader = function getHeader(header) {
  return this._headers[this._resolveHeaderName(header)]
}

Buffer.prototype.deleteHeader = function removeHeader(header) {
  delete this._headers[this._resolveHeaderName(header)]
}

Buffer.prototype.getHeaders = function getHeaders() {
  return this._headers
}

Buffer.prototype.getData = function getData() {
  return this._data || this._chunks.join('')
}

Buffer.prototype.setData = function setData(data) {
  return this._data = data
}

Buffer.prototype.send = function send() {

  var data = this.getData()

  this.setHeader('Content-Length', data.length)
  this._writeHead.call(this.res, this._statusCode, this._headers)
  this._end.call(this.res, data, this._encoding)
}

exports.Buffer = Buffer
