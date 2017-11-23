
var express = require('express')
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

var MESSAGE_TYPES = {
    CONNECT: 'CONNECT',
    GET_CODE: 'GET_CODE',
    RELEASE_CODE: 'RELEASE_CODE',
    BUTTON: 'BUTTON',
    SET_CODE: 'SET_CODE',
    DISCONNECT: 'DISCONNECT'
};

var gameInstance = {};
var instanceIndex = {};
var gameControllers = {};

function connect(client, code) {
    var index = Object.keys(gameInstance).findIndex((i) => (i === code));
    if (index !== -1) {
        if (gameInstance[code].players.length < 2) {
            gameControllers[client.id] = code
            gameInstance[code].players.push(client)
            return client.send({ type: MESSAGE_TYPES.CONNECT, success: true, playerPos: gameInstance[code].players.length })    
        }
        return client.send({ type: MESSAGE_TYPES.CONNECT, success: false, error: 'Game room is full' })
    }
    return client.send({ type: MESSAGE_TYPES.CONNECT, success: false, error: 'Invalid screen code' })
}

function disconnect(client, code) {
    var index = Object.keys(gameInstance).findIndex((i) => (i === code))
    var playerIndex = gameInstance[code].players.findIndex( p => client.id === p.id)
    if (index !== -1 && playerPos !== -1) {
        gameInstance[code].players.splice(playerIndex, 1)
    }
}

function generateCode(client) {
    var existingCodes = Object.keys(gameInstance)

    var str = 'ABCDEFGHJKMNPGRSTUVWXYZ23456789';
    var code = '';
    do {
        for(var i=0; i<6; i++) {
            code += str[Math.floor(Math.random() * str.length)]
        }
    } while(existingCodes.indexOf(code) !== -1)

    gameInstance[code] = { instance: client, players: [] }
    instanceIndex[client.id] = code

    client.send({ type: MESSAGE_TYPES.SET_CODE, code })
}

function releaseCode(client) {
    var code = Object.keys(gameInstance).find(code => gameInstance[code].instance.id === client.id)

    if (code) {
        gameInstance[code].players.forEach(c => c.send({ type: MESSAGE_TYPES.DISCONNECT }))
        delete instanceIndex[gameInstance[code].instance.id]
        delete gameInstance[code]
    }
}

function transmit(client, data) {
    var instance = gameInstance[gameControllers[client.id]].instance;
    var player = gameInstance[gameControllers[client.id]].players.findIndex( p => client.id === p.id) + 1

    if (instance && player)
        instance.send( Object.assign(data, { player } ) )
}

function clientIsGame(client) {
    return Object.keys(instanceIndex).indexOf(client.id) !== -1
}

function clientIsController(client) {
    return Object.keys(gameControllers).indexOf(client.id) !== -1
}

app.use(express.static(__dirname + "/../build"))

io.on('connection', function(client){
    client.on('message', function (data) {
        switch (data.type) {
            case MESSAGE_TYPES.CONNECT:
                connect(client, data.code)
                break;
            case MESSAGE_TYPES.DISCONNECT:
                disconnect(client, data.code)
                break;
            case MESSAGE_TYPES.RELEASE_CODE:
                releaseCode(client)
                break;
            case MESSAGE_TYPES.GET_CODE:
                if (clientIsController(client)) {
                    delete gameControllers[client.id]
                }
                generateCode(client)
                break;
            case MESSAGE_TYPES.BUTTON:
                transmit(client, data)
                break;
        }
    });

    client.on('disconnect', function () {
        if (clientIsGame(client)) {
            releaseCode(client)
        } else if (clientIsController(client)) {
            delete gameControllers[client.id]
        }
    })
});

server.listen(3001);