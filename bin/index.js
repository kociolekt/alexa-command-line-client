#!/usr/bin/env node

const exec = require('child_process').exec;
const prog = require('caporal');
const config = require('../lib/config');
const package = require('../package.json');
const Client = require('../lib/client');

const SERVER_ADDRESS = 'wss://wz0edt5qm7.execute-api.us-east-1.amazonaws.com/dev';
const settings = config.get();

let clientConfig = Object.assign({}, { address: SERVER_ADDRESS, logger: prog._logger }, settings);
let client = null;

function runner(command) {
  return new Promise((resolve) => {
    let output = [];

    output.push(`START ${command}`);

    try {
      exec(command, (e, stdout, stderr)=> {
          if (e instanceof Error) {
            output.push('ERROR:');
            output.push(e);
          }
          output.push('STDOUT:');
          output.push(stdout);
          output.push('STDERR:');
          output.push(stderr);
          output.push(`FINISH ${command}`);
          resolve(output.join('\n'));
      }).on('exit', (code) => {
        output.push(`EXIT CODE: ${code}`);
      });
    } catch(e) {
      output.push('FATAL ERROR');
      output.push(e);
      resolve(output.join('\n'));
    }
  });
}

prog
    .version(package.version)
    .help(`
    Alexa Command Line Client allows Alexa Command Line Skill running commands on your machine.
    Start by pairing - ask Alexa Command Line Skill for pairing.
    Then define some aliases with add command.
    `);

prog
  .command('name', 'Show current machine name')
  .help(`
  Shows current machine name or setups new name if provided.
  There are scenarios that Alexa asks you about machine name.
  Try choosing one that is easy to pronounce.
  `)
  .alias('n')
  .argument('[name]', 'Provide new name in order to override the previous one')
  .action((args, options, logger) => {
    if (args.name) {
      settings.name = args.name;
      config.set(settings);
      clientConfig = Object.assign(clientConfig, settings);
      client = new Client(clientConfig);
      client.on('connect', () => {
        // Auto introduce in client lib
        setTimeout(() => {
          client.close();
        }, 100);
      });
      client.connect();
    }
    logger.info(`Current Alexa Command Line Client name: ${settings.name}`);
  });

prog
  .command('id', 'Show current machine id')
  .help(`
  It just shows the id. Really.
  `)
  .alias('i')
  .action((args, options, logger) => {
    logger.info(`Current Alexa Command Line Client ID: ${settings.uuid}`);
  });

prog
  .command('pair', 'Pair this machine with alexa device')
  .help(`
  Pairs machine with Alexa Command Line Skill with provided pair token.
  It's required to do that before attepting any command execution.
  `)
  .alias('p')
  .argument('<token>', 'Token required for pairing')
  .action((args, options, logger) => {
    client = new Client(clientConfig);
    client.on('connect', () => {
      client.actionPair(settings.name, settings.uuid, args.token);
    });
    client.on('action-pair', ({ target: message }) => {
      logger.info(message);
      client.close();
    });
    client.connect();
  });

prog
  .command('add', 'Add alias and corresponding command.')
  .help(`
  Adds alias to command. Try choosing one word and easy to pronounce alias.
  It's needed when calling the command with Alexa Command Line Skill.
  `)
  .alias('a')
  .argument('<alias>', 'alias for command')
  .argument('<command>', 'command')
  .action((args, options, logger) => {

    if(!settings.commands) {
      settings.commands = {};
    }

    settings.commands[args.alias] = args.command;
    config.set(settings);
    clientConfig = Object.assign({}, clientConfig, settings);

    client = new Client(clientConfig);
    client.on('connect', () => {
      // Auto introduce in client lib
      setTimeout(() => {
        client.close();
      }, 100);
    });
    client.connect();

  });

prog
  .command('remove', 'Removes alias and corresponding command.')
  .help(`
  Removes alias so nobody nolonger can invoke it with Alexa Command Line Skill
  `)
  .alias('r')
  .argument('<alias>', 'alias for command')
  .action((args, options, logger) => {

    if(!settings.commands) {
      settings.commands = {};
    }

    let command = settings.commands[args.alias];

    if(command) {
      delete settings.commands[args.alias];
    } else {
      logger.info(`Command ${args.alias} not found. Nothing done.`);
      return;
    }

    config.set(settings);
    clientConfig = Object.assign(clientConfig, settings);

    client = new Client(clientConfig);
    client.on('connect', () => {
      // Auto introduce in client lib
      setTimeout(() => {
        client.close();
      }, 100);
    });
    client.connect();

  });

prog
  .command('daemon', 'Run in daemon mode listening for incoming commands')
  .help(`
  Connects client to Alexa Command Line Skill and listens for command invocation.
  `)
  .alias('d')
  .action((args, options, logger) => {

    client = new Client(clientConfig);
    client.on('connect', () => {
      logger.info('On your command, sir!')
      client.on('action-command', ({ target: alias }) => {
        let command = settings.commands[alias];

        if(command) {
          runner(command).then(logger.info);
        } else {
          logger.info(`No such command defined (${alias})`);
        }

      });
    });
    client.connect();

  });

prog.parse(process.argv);

// Handling client close

function exitHandler(options, exitCode) {
    if (options.cleanup) {
      client && client.close();
    }
    if (exitCode || exitCode === 0) {
      client && client.close();
    }
    if (options.exit) {
      client && client.close();
      process.exit();
    }
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup:true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));