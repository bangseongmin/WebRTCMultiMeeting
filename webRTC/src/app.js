// 기존 서버와 동일
const https = require('https')
const fs = require('fs')

const nodeStatic = require('node-static')

// 다른 점
const express = require('express')
const app = express()
const httpolyglot = require('httpolyglot')
const path = require('path')

// var socketIO = require('socket.io');

//////// CONFIGURATION ///////////

// insert your own ssl certificate and keys
const options = {
    key: fs.readFileSync(path.join(__dirname,'..','ssl','key.pem'), 'utf-8'),
    cert: fs.readFileSync(path.join(__dirname,'..','ssl','cert.pem'), 'utf-8')
}

const port = process.env.PORT || 3478

////////////////////////////

require('./routes')(app)

const httpsServer = httpolyglot.createServer(options, app)
const io = require('socket.io')(httpsServer)
require('./socketController')(io)


httpsServer.listen(port, () => {
    console.log(`listening on port ${port}`)
})


