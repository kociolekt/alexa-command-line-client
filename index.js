const readline = require('readline');
const prog = require('caporal');
const config = require('./config');
const Client = require('./client');

const SERVER_ADDRESS = 'wss://wz0edt5qm7.execute-api.us-east-1.amazonaws.com/dev';
const settings = config.get();

let clientConfig = Object.assign({}, { address: SERVER_ADDRESS }, settings);

const client = new Client(clientConfig);

prog
    .version('1.0.0');

//prog
//    .command('connection', 'Show connection status')
//    .action((args, options, logger) => {
//      const client = new Client({
//        address: SERVER_ADDRESS
//      });
//
//      client.on('connect', () => {
//        logger.info('Alexa Command Line Client is connected!');
//      });
//
//      client.on('error', () => {
//        logger.info('Alexa Command Line Client is NOT connected!');
//      });
//    })

prog
  .command('name', 'Show current machine name')
  .action((args, options, logger) => {
    logger.info(`Current Alexa Command Line Client name: ${settings.name}`);
  });

prog
  .command('id', 'Show current machine id')
  .action((args, options, logger) => {
    logger.info(`Current Alexa Command Line Client ID: ${settings.uuid}`);
  });

prog
  .command('echo', 'Input message and bounce it off server')
  .action((args, options, logger) => {
    client.connect();
    client.on('connect', () => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('Input message:');

      rl.on('line', (input) => {
        if(input === 'exit') {
          client.close();
        } else {
          client.actionEcho(input);
        }
      });
    });
    client.on('action-echo', ({target: data}) => {
      console.log(`SERVER >> ${data}`);
    });
  });

prog
  .command('pair', 'Pair this machine with alexa device')
  .argument('<token>', 'Token required for pairing')
  .action((args, options, logger) => {
    client.connect();
    client.on('connect', () => {
      client.actionPair(settings.name, settings.uuid, args.token);
    });
    client.on('action-pair', ({ target: message }) => {
      console.log(message);
      client.close();
    });
  });

prog
  .command('add', 'Add alias and corresponding command.')
  .argument('<alias>', 'alias for command')
  .argument('<command>', 'command')
  .action((args, options, logger) => {

    if(!settings.commands) {
      settings.commands = {};
    }

    settings.commands[args.alias] = args.command;
    config.set(settings);
    clientConfig = Object.assign(clientConfig, settings);

    client.connect();
    client.on('connect', () => {
      //client.actionIntroduce(settings.name, settings.uuid, settings.commands);
      setTimeout(() => {
        client.close();
      }, 100);
    });

  });

 /*
prog
  .version('1.0.0')
  // the "order" command
  .command('order', 'Order a pizza')
  .alias('give-it-to-me')
  // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
  .argument('<kind>', 'Kind of pizza', ["margherita", "hawaiian", "fredo"])
  .argument('<from-store>', 'Which store to order from')
  // enable auto-completion for <from-store> argument using a sync function returning an array
  .complete(function() {
    return ['store-1', 'store-2', 'store-3', 'store-4', 'store-5'];
  })

  .argument('<account>', 'Which account id to use')
  // enable auto-completion for <account> argument using a Promise
  .complete(function() {
    return Promise.resolve(['account-1', 'account-2']);
  })

  .option('-n, --number <num>', 'Number of pizza', prog.INT, 1)
  .option('-d, --discount <amount>', 'Discount offer', prog.FLOAT)
  .option('-p, --pay-by <mean>', 'Pay by option')
  // enable auto-completion for -p | --pay-by option using a Promise
  .complete(function() {
    return Promise.resolve(['cash', 'credit-card']);
  })

  // -e | --extra will be auto-magicaly autocompleted by providing the user with 3 choices
  .option('-e, --extra <ingredients>', 'Add extra ingredients', ['pepperoni', 'onion', 'cheese'])
  .action(function(args, options, logger) {
    logger.info("Command 'order' called with:");
    logger.info("arguments: %j", args);
    logger.info("options: %j", options);
  })

  // the "return" command
  .command('return', 'Return an order')
  .argument('<order-id>', 'Order id')
  // enable auto-completion for <order-id> argument using a Promise
  .complete(function() {
    return Promise.resolve(['#82792', '#71727', '#526Z52']);
  })
  .argument('<to-store>', 'Store id')
  .option('--ask-change <other-kind-pizza>', 'Ask for other kind of pizza')
  // enable auto-completion for --ask-change option using a Promise
  .complete(function() {
    return Promise.resolve(["margherita", "hawaiian", "fredo"]);
  })
  .option('--say-something <something>', 'Say something to the manager')
  .action(function(args, options, logger) {
    logger.info("Command 'return' called with:");
    logger.info("arguments: %j", args);
    logger.info("options: %j", options);
  });
 */
prog.parse(process.argv);


// Handling client close
//process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) {
      client.close();
      console.log('clean');
    }
    if (exitCode || exitCode === 0) {
      client.close();
      console.log(exitCode);
    }
    if (options.exit) {
      client.close();
      process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));