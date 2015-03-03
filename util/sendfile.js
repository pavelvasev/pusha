var request = require('request');
var fs = require('fs');

var f = process.argv[2];
fs.createReadStream(f).pipe( request.post('http://localhost:3333/kudatuda.txt') );
console.log("streaming");