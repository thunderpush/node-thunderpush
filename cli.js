#! /usr/bin/env node

'use strict';

var program = require('commander')
    , _ = require('lodash')
    , colors = require('colors')
    , Table = require('cli-table')
    , Thunderpush = require('./lib/thunderpush')
    , thunderpush;

var stdin = '';

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function increaseVerbosity(v, total) {
  return total + 1;
}

function connect() {
  var options = {};

  if(program.host) options.hostname = program.host;
  if(program.port) options.port = program.port;
  if(program.key) options.key = program.key;
  if(program.secretKey) options.secret = program.secretKey;

  var thunderpush = new Thunderpush(options, program.verbose);

  return thunderpush;
}

program
  .version('0.0.1')
  .option('-h, --host <hostname>', 'Hostname of service', 'localhost')
  .option('-p, --port <port>', 'Port of service', '80')
  .option('-k, --key <key>', 'Key for service [required]')
  .option('-s, --secret-key <secretKey>', 'Secret key for service [required]')
  .option('-v, --verbose', 'Add verbosity', increaseVerbosity, 0)

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -vvv -k key -s secret ping');
    console.log('        DEBUG: Sending ping');
    console.log('        DEBUG:     Server took 200ms');
    console.log('');
  });

/**
 * Ping the server
 * 
 *     $ thunderpush-cli -k key -s secret ping
 *         pong
 *
 */
program
  .command('ping')
  .description('Test connection')
  .action(function(env, options) {

    try {
      connect().ping(function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {

            var data = JSON.parse(chunk);

            if(data.match('pong')) {
              process.stderr.write('unexpected response from server\n');
            }
            else {
              process.stdout.write('pong\n');
            }

          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }
        });
      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');  
      });
    }
    catch(e) {
      process.stderr.write(e.message + '\n');
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret ping');
    console.log('        pong');
    console.log('');
  });

/**
 * Get number of open connections
 * 
 *     $ thunderpush-cli -k key -s secret server:connections
 *         2
 */
program
  .command('server:connections')
  .description('Get number of connections')
  .action(function(env, options) {

    try {
      connect().user().get(function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {
            var data = JSON.parse(chunk);
            process.stdout.write(data.count + '\n');
          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }

        })
      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');
      });
    }
    catch(e) {
      process.stderr.write(e.message + '\n')
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret server:connections');
    console.log('        2');
    console.log('');
  });

/**
 * Get number of open connections
 * 
 *     $ thunderpush-cli -k key -s secret server:users
 *         johndoe
 *         jimsmith
 *         bob
 *
 * Show total
 *
 *     $ thunderpush-cli -k key -s secret server:users --count
 *         total 3
 *         johndoe
 *         jimsmith
 *         bob
 *
 */
program
  .command('server:users')
  .description('Get count of users')
  .option('--count', 'Show total')
  .action(function(env, options) {

    process.stdin.write('oops, not yet implemented in the server'.yellow + '\n');

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret server:users');
    console.log('        johndoe');
    console.log('        jimsmith');
    console.log('        bob');
    console.log('');
  });

/**
 * All populated channels
 * 
 * Get all populated channel
 * 
 *     $ thunderpush-cli -k key -s secret server:channels
 *         chan1
 *         chan2
 *
 * Get total with output
 *
 *     $ thunderpush-cli -k key -s secret server:channels --count
 *         total 2
 *         chan1
 *         chan2
 */
program
  .command('server:channels')
  .description('Get list of channels')
  .action(function() {

    process.stdin.write('oops, yet to be implemented in the server'.yellow + '\n');

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret server:channels');
    console.log('        chan1');
    console.log('        chan2');
    console.log('');
    console.log('    Get total with output');
    console.log('    $ thunderpush-cli -k key -s secret server:channels --count');
    console.log('        total 2');
    console.log('        chan1');
    console.log('        chan2');
    console.log('');
  });

/**
 * Users subscribed to a channel
 * 
 * Get users of populated channel
 * 
 *     $ thunderpush-cli -k key -s secret channel:users chan1
 *         johndoe
 *         jimsmith
 *
 * Get users of **unpopulated** channel
 * 
 *     $ thunderpush-cli -k key -s secret channel:users chan1
 *         
 *
 * Get total with output
 *
 *     $ thunderpush-cli -k key -s secret channel:users chan1 --count
 *         total 2
 *         johndoe
 *         jimsmith
 */
program
  .command('channel:users <channel>')
  .description('Get list of users in a channel')
  .option('--count', 'Count of users')
  .action(function(channel, options) {

    try {
      connect().channel(channel).get(function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {
            var data = JSON.parse(chunk);

            if(options.count) {
              process.stdout.write('total ' + data.users.length + '\n');
            }

            _.each(data.users, function(user) {
              process.stdout.write(user + '\n');
            });
          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }

        });

      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');
      });

    }
    catch(e) {
      process.stderr.write(e.message + '\n')
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret channel:users chan1');
    console.log('        johndoe');
    console.log('        jimsmith');
    console.log('');
    console.log('    Get total with output');
    console.log('    $ thunderpush-cli -k key -s secret channel:users chan1 --count');
    console.log('        total 2');
    console.log('        johndoe');
    console.log('        jimsmith');
    console.log('');
  });



/**
 * Send message to a channel
 *
 * Populated channel
 * 
 *     $ thunderpush-cli -k key -s secret channel:message chan1 hi!
 *         12
 *     $ echo "123" | thunderpush-cli -k key -s secret channel:message chan2
 *         1
 * 
 * Unpopulated channel
 *
 *     $ thunderpush-cli -k key -s secret channel:message chan1 hi!
 *         0
 */
program
  .command('channel:message <channel> [message]')
  .description('Send message to a channel')
  .action(function(channel, message, options) {

    message = '';

    if(stdin) {
      message = stdin.toString().trim();
    }

    try {
      connect().channel(channel).message(message, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {
            var count = JSON.parse(chunk).count || 0;
            process.stdout.write(count + '\n');
          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }

        })
      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');
      });

    }
    catch(e) {
      process.stderr.write(e.message + '\n')
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret channel:message chan1 hi!');
    console.log('        12');
    console.log('');
    console.log('    Piping output');
    console.log('    $ echo "123" | thunderpush-cli -k key -s secret channel:message chan2');
    console.log('        1');
    console.log('');
    console.log('    Unpopulated channel');
    console.log('    $ thunderpush-cli -k key -s secret channel:message chan3 {"hello":"world"}');
    console.log('        0');
    console.log('');
  });

/**
 * Users online presence
 *
 * Online user
 *
 *     $ thunderpush-cli -k key -s secret user:presence janedoe
 *         online
 *     
 * Offline user
 *
 *     $ thunderpush-cli -k key -s secret user:presence johndoe
 *         offline
 */
program
  .command('user:presence <user>')
  .description('Get user presence')
  .action(function(user, options) {

    try {
      connect().user(user).get(function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {
            var data = JSON.parse(chunk);
            process.stdout.write((data.online ? 'online' : 'offline') + '\n');
          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }

        })
      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');
      });
    }
    catch(e) {
      process.stderr.write(e.message + '\n');
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret user:presence janedoe');
    console.log('        online');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret user:presence johndoe');
    console.log('        offline');
    console.log('');
  });

/**
 * Send message to a user
 *
 * Online user
 * 
 *     $ thunderpush-cli -k key -s secret user:message janedoe hi!
 *         1
 *     $ echo "123" | thunderpush-cli -k key -s secret user:message janedoe
 *         1
 * 
 * Offline user
 *
 *     $ thunderpush-cli -k key -s secret user:message janedoe hi!
 *         0
 */
program
  .command('user:message <user> [message]')
  .description('Send message to a user')
  .action(function(user, message, options) {

    message = '';

    if(stdin) {
      message = stdin.toString().trim();
    }

    try {
      connect().user(user).message(message, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

          try {
            var count = JSON.parse(chunk).count || 0;
            process.stdout.write(count + '\n');
          }
          catch(e) {
            process.stderr.write('unexpected response from server\n');
          }

        })
      }).on('error', function(e) {
        process.stderr.write(e.message + '\n');
      });

    }
    catch(e) {
      process.stderr.write(e.message + '\n')
    }

  })
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ thunderpush-cli -k key -s secret user:message johndoe hi!');
    console.log('        1');
    console.log('');
    console.log('    Piping output');
    console.log('    $ echo "123" | thunderpush-cli -k key -s secret user:message johndoe');
    console.log('        1');
    console.log('');
    console.log('    Offline user');
    console.log('    $ thunderpush-cli -k key -s secret user:message janedoe {"hello":"world"}');
    console.log('        0');
    console.log('');
  });

// Handle piping
if(process.stdin.isTTY) {
  program.parse(process.argv);
}
else {
  process.stdin.on('readable', function() {
      var chunk = this.read();
      if (chunk !== null) {
         stdin += chunk;
      }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv); 
  });
}