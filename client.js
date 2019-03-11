const WebSocket = require('ws');
let SimpleEventer = require('simple-eventer').default;

const defaults = {
    address: null,
    uuid: null,
    name: null,
    commands: {}
};

class Client extends SimpleEventer {
    constructor(options) {
        super();
        this.settings = Object.assign({}, defaults, options);

        if(!this.settings.address) {
            throw new Error('address is required');
        }

        if(!this.settings.uuid) {
            throw new Error('uuid is required');
        }

        if(!this.settings.name) {
            throw new Error('name is required');
        }

        if(!this.settings.commands) {
            throw new Error('commands are required');
        }

        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if(!this.isConnected) {
            this.isConnected = true;
            this.initSocket();
        }
    }

    initSocket() {
        this.socket = new WebSocket(this.settings.address);
        this.socket.on('open', this.onConnect.bind(this));
        this.socket.on('error', this.onError.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('close', this.onClose.bind(this));
    }

    onConnect() {
        console.log('Client connected!');
        this.isConnected = true;
        this.actionIntroduce(this.settings.name, this.settings.uuid, this.settings.commands);
        this.fire('connect');
    }

    onError(error) {
        this.isConnected = false;
        console.error('Connection error!');
        console.error(error);
        this.fire('error');
    }

    onMessage(message) {
        try {
            let messageObj = JSON.parse(message);

            this.fire('message', messageObj);

            if (messageObj.action && messageObj.data) {
                this.fire('action', messageObj.data);
                this.fire(`action-${messageObj.action}`, messageObj.data);
            }
        } catch(e) {
            console.error('Message error!');
            console.error(e);
        }
    }

    onClose() {
        this.isConnected = false;
        console.log('Client disconnected!');
    }

    send(message) {
        if(this.socket && this.isConnected) {
            this.socket.send(message);
        } else {
            throw new Error(`Client not connected (isConnected: ${isConnected}).`);
        }
    }

    actionIntroduce(name, uuid, commands) {
        let aliases = Object.keys(commands);

        console.log(JSON.stringify({
            action: 'introduce',
            data: {
                name,
                uuid,
                aliases
            }
        }));
        this.send(JSON.stringify({
            action: 'introduce',
            data: {
                name,
                uuid,
                aliases
            }
        }));
    }

    actionEcho(messageString) {
        this.send(JSON.stringify({
            action: 'sendMessage',
            data: messageString
        }));
    }

    actionPair(name, uuid, token) {
        console.log(JSON.stringify({
            action: 'pair',
            data: {
                name,
                uuid,
                token
            }
        }));
        this.send(JSON.stringify({
            action: 'pair',
            data: {
                name,
                uuid,
                token
            }
        }));
    }

    close() {
        if(this.isConnected && this.socket) {
            this.socket.close();
        }
    }
}

module.exports = Client;
