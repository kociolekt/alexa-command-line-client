const prog = require('caporal');
const machineUUID = require('./machine-uuid');
const Client = require('./clientLib');

const SERVER_ADDRESS = 'wss://wz0edt5qm7.execute-api.us-east-1.amazonaws.com/dev';
const MACHINE_UUID = machineUUID();

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
    .command('echo', 'Bounce message off server')
    .argument('<message>', 'Message to bounce')
    .action((args, options, logger) => {
      const client = new Client({
        address: SERVER_ADDRESS
      });
      client.on('connect', () => {
        client.actionEcho(args.message);
      });
    });

prog
    .command('id', 'Show current machine id')
    .action((args, options, logger) => {
      logger.info(`Current Alexa Command Line Client ID: ${MACHINE_UUID}`);
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
