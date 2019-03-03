const WebSocket = require('ws');
let SimpleEventer = require('simple-eventer').default;

const defaults = {
    address: null
};

class Client extends SimpleEventer {
    constructor(options) {
        super();
        this.settings = Object.assign({}, defaults, options);

        if(!this.settings.address) {
            throw new Error('address is required');
        }

        this.socket = null;
        this.isConnected = false;

        this.init();
    }

    init() {
        this.initSocket();
    }

    initSocket() {
        this.socket = new WebSocket(this.settings.address);

        this.socket.on('error', (error) => {
            this.isConnected = false;
            console.log('error');
            console.log(error);
            reject(error);
        });

        this.socket.on('open', () => {
            this.isConnected = true;
            console.log('open');
            this.fire('connect');

            this.socket.on('message', (message) => {
                console.log('message');
                console.log(message);
            });

            this.socket.on('close', () => {
                this.isConnected = false;
                console.log('close');
            });
        });
    }

    send(message) {
        if(this.socket && this.isConnected) {
            this.socket.send(message);
        }
    }

    actionEcho(messageString) {
        this.send(JSON.stringify({
            action: 'sendMessage',
            data: messageString
        }));
    }
}

module.exports = Client;
