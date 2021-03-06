var express = require('express');
var app = express();

var request = require('request');
var cheerio = require('cheerio');

index = "<h1>Streak Report</h1><p>GitHub recently removed its \"streak\" feature, which told users how many consecutive days they'd made a public contribution to a GitHub repository. Streak Report attempts to replace this functionality by analyzing the contribution graph from a user's profile page to determine their current streak.<p>To start, point your browser to streak.report/usernameHere.<p>For example: <a href='https://streak.report/torvalds'>https://streak.report/torvalds</a>"

app.get('/', function(req, res) {
	res.send(index)
});

app.get('/:user', function(req, res) {
	countContribs(req.params.user).then(function(count) {
		res.send(count);
	})
	.catch(function(statusCode) {
		res.sendStatus(statusCode);
	});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

getContribs = function(user) {
	return new Promise(function(resolve, reject) {
		request('https://github.com/users/' + user +'/contributions', function (error, response, body) {
		  if (response.statusCode === 200) {
		  	resolve(body);
		  } else {
				console.log("WOOP GOT", response.statusCode);
				reject(response.statusCode);
			}
		});
	});
};

countContribs = function(user) {
	return getContribs(user).then(function(page) {
		$ = cheerio.load(page);
		var counts = []
		$('g rect').each(function(i, elem) {
			//console.log(elem.attribs['data-date'] + ": " + elem.attribs['data-count']);
			counts.push(parseInt(elem.attribs['data-count']));
		});
		var streak = 0;
		if(counts[counts.length -1 ] > 0) streak++;	// if the streak has already continued today

		for(var i=counts.length - 2; i > 0; i--) {
			if(counts[i] === 0) break;
			else streak++;
		}
		if(streak === counts.length - 1) return "STREAK: At *least* " + streak;
		else return "STREAK: " + streak
	});
};
