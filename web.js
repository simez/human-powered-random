var express = require('express');
var logfmt = require('logfmt');

var app = express();

app.use(logfmt.requestLogger());

app.get('/', function (request, response) {

  var options = {
    path: '/v1/media/popular?client_id=5d8fd13a49b949279f0ee9eb5b11f65b',
    host: 'api.instagram.com',
    headers: {'user-agent': 'Human-powered Randomness (https://github.com/FaridW/human-rng)'}
  };

  var https = require('https');
  https.get(options, function (res) {
    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function (){
      var api_response = JSON.parse(body);
      var data = api_response.data;
      var media = data[0]; // Get first image

      var image = media.images.standard_resolution; // Contains url, width, height
      var web_url = media.link;
      var comments = media.comments;

      var crypto = require('crypto')
      var sha1 = crypto.createHash('sha1');
      sha1.update(JSON.stringify(comments.data));
      var the_hash = sha1.digest('hex');

      var rc4 = require('rc4');
      var generator = new rc4(the_hash);
      var random = generator.randomFloat();

      var jade = require('jade');
      var html = jade.renderFile('template.jade',{
        web: web_url,
        image: image,
        count: comments.count,
        hash: the_hash,
        random: random
      });

      response.send(html);
      response.end();
    });
  });
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
  console.log("Listening on " + port);
});
