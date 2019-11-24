#!/usr/bin/env node
var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
  files: ['./package.json', './www/**/*'],
  appName: 'GCWallet',
  platforms: ['win64', 'osx64', 'linux64'],
  buildDir: './desktop',
  version: '0.21.6',
  macIcns: './resources/getcoins/mac/app.icns',
  exeIco: './resources/getcoins/windows/icon.ico',
  macPlist: {
    CFBundleURLTypes: [
      {
        CFBundleURLName: 'URI Handler',
        CFBundleURLSchemes: ['bitcoin', 'bitcoincash', 'getcoins']
      }
    ]
  }
});

// Log stuff you want
nw.on('log', console.log);

nw.build()
  .then(function() {
    console.log('all done!');
  })
  .catch(function(error) {
    console.error(error);
  });
