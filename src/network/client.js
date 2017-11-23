
import io from 'socket.io-client'

let _listeners = {}
let connected = false
let socket = null

const wsServer = '//localhost:3001'
const socketIOConf = { transports: ['websocket']}

export const MESSAGE_TYPES = {
    CONNECT: 'CONNECT',
    GET_CODE: 'GET_CODE',
    RELEASE_CODE: 'RELEASE_CODE',
    BUTTON: 'BUTTON',
    SET_CODE: 'SET_CODE',
    DISCONNECT: 'DISCONNECT'
};

const client = {
    _dispatch(event, data) {
        if (_listeners[event]) {
            _listeners[event].forEach((fn) => {
                fn.call(this, data)
            })
        }
    },

    init() {
        if (wsServer)
            socket = io(wsServer, socketIOConf)
        else 
            socket = io(document.location.protocol + '//' + document.location.hostname + (document.location.protocol.indexOf('s') === -1 ? ':' + document.location.port : ''), socketIOConf );
    
        socket.on('connect', () => {
            connected = true
        })
        
        socket.on('message', (data) => {
            let { type, ...eData } = data;
            this._dispatch(type, eData)
        })
    },

    addListener(event, callback) {
        _listeners[event] || (_listeners[event] = [])

        _listeners[event].push(callback)
    },

    removeListener(event, callback) {
        if (_listeners[event]) {
            if (callback) {
                let idx = _listeners[event].findIndex((c => c === callback))
                if (idx !== -1) {
                    _listeners[event].splice(idx, 1)
                }
            } else {
                delete _listeners[event]
            }
        }
    },

    // removeAllListeners() {
    // }

    send(type, data) {
        socket.send({ type, ...data })
    }
}

export default client;
