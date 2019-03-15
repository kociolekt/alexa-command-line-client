# alexa-command-line-client

Client for Alexa Command Line skill. It allows Alexa invoking terminal commands on local machine.

## Install
Suggest global installation with below command.
```
$ npm install -g alexa-command-line-client
```

## Usage

If you already have Alexa Command Line skill on your device then you can pair your machine.

### Pairing
Ask Alexa Command Line skill for pairing. It will provide you with pairing token.
Use this token for pairing.
```
$ aclc pair 99999
```

### Defining aliases
After pairing define some aliases by running `aclc` with `add` command.
```
$ aclc add "test" "echo test"
```

### Start daemon
Start daemon mode in order to listen for incoming commands.
```
$ aclc daemon
```

### Running commands
If client is paired, aliases are defined and daemon is running it's time to run some commands.
Ask Alexa to run defined command.
```
"Alexa, open command line and run test"
```
