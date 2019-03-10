const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();
const uuid = require('uuid/v4');
const Moniker = require('moniker');
const name = Moniker.generator([Moniker.adjective, Moniker.noun], {glue: ' '});

const CONFIG_FILE_NAME = '.aclcrc';
const CONFIG_FILE_PATH = path.resolve(homedir, CONFIG_FILE_NAME);

function check() {
    let exists = false;
    let isFile = false;

    // Check for configuration file
    try {
        let stats = fs.lstatSync(CONFIG_FILE_PATH);
        exists = true;
        if (!stats.isDirectory()) {
            isFile = true;
        }
    } catch (e) {
        exists = false;
    }

    // It'd be bad if config file'd be a directory
    if(exists && !isFile) {
        throw new Error(`Alexa Command Line Client config file (${CONFIG_FILE_PATH}) cannot be directory.`);
    }

    return {
        exists,
        isFile
    }
}

function get() {
    const configCheck = check();

    let config = null;

    if(configCheck.exists) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
    } else {
        config = {
            uuid: uuid(),
            name: name.choose(),
            commands: {}
        };
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
    }

    return config;
};

function set(config) {
    check();

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
}

module.exports = {
    get,
    set
};
