
var express = require('express')
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

var MESSAGE_TYPES = {
    CONNECT: 'CONNECT',
    GET_CODE: 'GET_CODE',
    RELEASE_CODE: 'RELEASE_CODE',
    BUTTON: 'BUTTON',
    SET_CODE: 'SET_CODE'
};

var gameInstance = {};
var instanceIndex = {};
var gameControllers = {};

function connect(client, code) {
    var index = Object.keys(gameInstance).findIndex((i) => (i === code));
    if (index !== -1) {
        gameControllers[client.id] = code;
        client.send({ type: MESSAGE_TYPES.CONNECT, success: true })        
    } else {
        client.send({ type: MESSAGE_TYPES.CONNECT, success: false })        
    }
}

function generateCode(client) {
    var existingCodes = Object.keys(gameInstance)

    var str = 'ABCDEFGHJKMNPGRSTUVWXYZ23456789';
    var code = '';
    do {
        for(var i=0; i<6; i++) {
            code += str[Math.floor(Math.random() * str.length)];
        }
    } while(existingCodes.indexOf(code) !== -1)

    gameInstance[code] = client;
    instanceIndex[client.id] = code;

    console.log(gameInstance, instanceIndex)

    client.send({ type: MESSAGE_TYPES.SET_CODE, code })
}

function releaseCode(client) {
    var code = Object.keys(gameInstance).find(code => gameInstance[code].id === client.id)

    if (code) {
        delete instanceIndex[gameInstance[code].id]
        delete gameInstance[code]
    }
}

function transmit(client, data) {
    var instance = gameInstance[gameControllers[client.id]];

    console.log(instance)

    if (instance)
        instance.send( data )
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