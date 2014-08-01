# Thunderpush API library for node.js

> Thunderpush API library


## Getting Started

Install the module with: `npm install thunderpush`

``` js
var Thunderpush = require('thunderpush');

var thunderpush = new Thunderpush({
    host: 'localhost', // default: localhost
    port: 1234, // default: 80
    key: 'somepublickey',
    secret: 'someprivatekey'
});

// build connection
var tpHandle = thunderpush.connect();

// Get channel users
tpHandle.channel("my-channel").get(); // [123, 456, 789]

// Message channel users
tpHandle.channel("my-channel").message("hi"); // 3

// Get number of connected users
tpHandle.user().get(); // 12

// Get user 123 presence
tpHandle.user(123).presence(); // online || offline

// Message user 123
tpHandle.user(123).message("hi"); // 1

// Disconnect user 123
tpHandle.user(123).disconnect();
```


Install with cli command

``` sh
$ npm install -g thunderpush
$ thunderpush-cli --help
    Usage: cli [options] [command]

      Commands:

        ping
           Test connection

        server:connections
           Get number of connections

        server:users [options]
           Get count of users

        server:channels
           Get list of channels

        channel:users [options] <channel>
           Get list of users in a channel

        channel:message <channel> [message]
           Send message to a channel

        user:presence <user>
           Get user presence

        user:message <user> [message]
           Send message to a user


      Options:

        -h, --help                    output usage information
        -V, --version                 output the version number
        -h, --host <hostname>         Hostname of service
        -p, --port <port>             Port of service
        -k, --key <key>               Key for service [required]
        -s, --secret-key <secretKey>  Secret key for service [required]
        -v, --verbose                 Add verbosity

      Examples:

        $ thunderpush-cli -vvv -k key -s secret ping
            DEBUG: Sending ping
            DEBUG:     Server took 200ms
$
```


## Documentation

See source code for documentation.

_(More coming soon)_


## Examples

See the cli script for an example

_(More coming soon)_


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Ryan Schumacher  
Licensed under the MIT license.
