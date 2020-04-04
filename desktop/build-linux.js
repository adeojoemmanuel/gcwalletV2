#!/usr/bin/env node
const fs = require('fs-extra');
const archiver = require('archiver');

const resourceFolder = './resources/getcoins/linux';
const destinationFolder = './desktop/GCWallet/linux64';

var output = fs.createWriteStream('./desktop/GCWallet-linux.zip');
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes... done');
});

archive.on('error', function(err) {
  throw err;
});

async function start() {
  try {
    // Copy resources
    await fs.copy('./desktop/.desktop', destinationFolder + '/.desktop');
    await fs.copy(
      resourceFolder + '/favicon.ico',
      destinationFolder + '/favicon.ico'
    );
    await fs.copy(
      resourceFolder + '/icon.png',
      destinationFolder + '/icon.png'
    );
    console.log('Copy resources: success!');

    // Compress folder
    console.log('Compress folder: ...');
    archive.pipe(output);
    archive.directory(destinationFolder + '/', 'GCWallet-linux');
    archive.finalize();
  } catch (err) {
    console.error(err);
  }
}

start();
