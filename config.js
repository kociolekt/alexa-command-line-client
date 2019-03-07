const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();
const uuid = require('uuid/v4');
const Moniker = require('moniker');
const name = Moniker.generator([Moniker.adjective, Moniker.noun], {glue: ' '});

const CONFIG_FILE_NAME = '.aclcrc';
const CONFIG_FILE_PATH = path.resolve(homedir, CONFIG_FILE_NAME);

module.exports = (() => {
    let configExists = false;
    let configIsFile = false;

    // Check for configuration file
    try {
        let stats = fs.lstatSync(CONFIG_FILE_PATH);
        configExists = true;
        if (!stats.isDirectory()) {
            configIsFile = true;
        }
    } catch (e) {
        configExists = false;
    }

    // It'd be bad if config file'd be a directory
    if(configExists && !configIsFile) {
        throw new Error(`Alexa Command Line Client config file (${CONFIG_FILE_PATH}) cannot be directory.`);
    }

    let config = null;

    if(configExists) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
    } else {
        config = {
            uuid: uuid(),
            name: name.choose()
        };
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
    }

    return config;
})();
