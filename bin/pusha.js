#!

// выдача по http get через send
// аплоад через busboy (для html форм)
// аплоад прямой
// push

var http = require('http');
var send = require('send'); // https://github.com/pillarjs/send
var url = require('url');
var Busboy = require('busboy'); // https://github.com/mscdex/busboy
var path = require('path');
var fs = require('fs');
var glob = require("glob"); // https://www.npmjs.com/package/glob
var request = require('request');

var config = require(process.argv[2] || "./conf.json");
//var config =  JSON.parse(fs.readFileSync( process.argv[2] || "./conf.json", "utf8"));
//var config =  JSON.parse('{ "dir": "qqq" }');
// json stream http://stackoverflow.com/a/17567608

console.log( "config.dir=",config.dir, "resolved to",path.resolve(config.dir) );

if (!fs.existsSync(config.dir)) {
  console.log("config.dir not exist! exiting.");
  process.exit(1);
}
if (!fs.statSync(config.dir).isDirectory())
{
  console.log("config.dir is not a dir! exiting.");
  process.exit(1);
}


var app = http.createServer(function(req, res){
  var urla = url.parse(req.url,true);
  
  /// аплоад
  
  if (req.method === 'POST') {
    console.log("have post III");
    console.log(req.headers);
    var saveTo = path.join(config.dir, urla.pathname );
    console.log("saveTo=",saveTo);
    
    var typ = req.headers['content-type'] || "";
    if (typ.indexOf("multipart") >= 0)
    { // аплоад через форму.. загружаем стримингом!
      var busboy = new Busboy({ headers: req.headers });
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log( "fieldname=",fieldname,"filename=",filename );
        // var saveTo = path.join(config.dir, "a" );
        file.pipe(fs.createWriteStream( path.join(saveTo,filename) ));
      });
      busboy.on('finish', function() {
        res.writeHead(200);
        res.end("That's all folks!");
      });
      return req.pipe(busboy);
    
    }
    else
    { // прямое аплоад
      req.on('end',function() {
        console.log("request ended");
        res.writeHead(200);
        res.end("That's all folks 3!");
      } );
      var x = fs.createWriteStream( saveTo );

      return req.pipe(x);
    }
  }

  /// спецфункции
  
  if (urla.pathname == "/list")
  {
    var pat = "*";
    res.writeHead(200, { 'Content-Type': 'text/plain'} );
    
    //fs.readdir(config.dir, function(err, list) {
    
    var options = { cwd: config.dir };
    glob("**/*", options, function (er, list) {
      res.write(list.join("\n"));
      res.end();
    } );

    return;
  }

  //if (urla.pathname == "/push")

  if (urla.query.push)
  {
    var t = urla.query.push;
    var msg = "scheduled to push "+urla.pathname+" to t="+t;

    res.writeHead(200, { 'Content-Type': 'text/plain'} );
    res.end(msg);    

    console.log(msg);
    
    var f = config.dir + urla.pathname;
    fs.createReadStream(f).pipe( request.post(t) );
    return;
  }

  /// раздача

  // your custom error-handling logic:
  function error(err) {
    res.statusCode = err.status || 500;
    res.end(err.message);
  }

  // your custom headers
  function headers(res, path, stat) {
    // serve all files for download
    // res.setHeader('Content-Disposition', 'attachment');
  }

  // your custom directory handling logic:
  function redirect() {
    res.statusCode = 301;
    res.setHeader('Location', req.url + '/');
    res.end('Redirecting to ' + req.url + '/');
  }

  function fin() {
    console.log("sent");
  }
  
  // transfer arbitrary files from within
  // /www/example.com/public/*
  
  console.log( urla.pathname );

  send(req, urla.pathname, {root: config.dir})
  .on('error', error)
  .on('directory', redirect)
  .on('headers', headers)
  .on('end', fin)
  .pipe(res);
}).listen(config.port);

console.log("pusha started on",config.port);
