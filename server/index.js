
var io = require('socket.io')();

var MESSAGE_TYPES = {
    CONNECT: 'CONNECT',
    GET_CODE: 'GET_CODE',
    BUTTON: 'BUTTON',
    SET_CODE: 'SET_CODE'
};

var gameInstance = {};
var gameControllers = {};

function connect(client, code) {
    var index = Object.keys(gameInstance).findIndex((i) => (i === code));
    if (index !== -1) {
        gameControllers[client.id] = code;
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

    client.send({ type: MESSAGE_TYPES.SET_CODE, code })
}

function transmit(client, data) {
    var instance = gameInstance[gameControllers[client.id]];

    console.log(instance)

    if (instance)
        instance.send( data )
}

io.on('connection', function(client){
    client.on('message', function (data) {
        switch (data.type) {
            case MESSAGE_TYPES.CONNECT:
                connect(client, data.code)
                break;
            case MESSAGE_TYPES.GET_CODE:
                generateCode(client)
                break;
            case MESSAGE_TYPES.BUTTON:
                console.log()
                transmit(client, data)
                break;
        }
    });
});


io.listen(3002);