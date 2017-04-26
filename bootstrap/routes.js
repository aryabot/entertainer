// Load dependencies for route handling
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var osmosis = require('osmosis');

// Load the logger because logging is important for obvious reasons!
var Logger = require(__dirname + '/../services/logger').Logger;

module.exports = function(app) {
    var comicsRouter = express();
    /************************************
     *            MIDDLEWARES           *
     ***********************************/
    // Body parser converts JSON and Form data to object
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    // Custom Middleware to log all request
    app.use('/*', logRequest);


    /*************************************
     *              ROUTES               *
     ************************************/
    // This would have all the routes starting with /api
    // /api would be the core, will be authenticated and should never
    // go down! ever!
    app.use('/api', comicsRouter);
    comicsRouter.get('/', function(req, res) {
        res.status = 401;
        res.json({
            status: 'ERROR',
            message: 'Not allowed to use this route'
        });
        res.end();
    });

    comicsRouter.get('/comic', function(req, res) {
        var sites = [
            'ex', 'xkcd', 'ch'
        ];

        var site = _.sample(sites);

        switch (site) {
            case 'ch':
                osmosis
                    .get('http://www.channelate.com/?randomcomic&nocache=1')
                    .set({
                        image: 'div#comic-1 > img@src',
                        title: 'h2.post-title > a',
                        author: 'span.post-author > a',
                        publish_date: 'span.post-date'
                    })
                    .data(function(scrapeData) {
                        scrapeData.channel = 'Channelate';
                        res.json(scrapeData);
                        res.end();
                    }).debug(console.log);

                break;

            case 'ex':
                osmosis
                    .get('http://explosm.net/comics/random')
                    .set({
                        image: '#main-comic@src',
                        author: 'small.author-credit-name',
                        publish_date: '.past-week-comic-title'
                    })
                    .data(function(scrapeData) {
                        scrapeData.image = 'http:' + scrapeData.image;
                        scrapeData.channel = 'Cyanide and Happiness';
                        res.json(scrapeData);
                        res.end();
                    }).debug(console.log);

                break;

            case 'xkcd':
                osmosis
                    .get('http://c.xkcd.com/random/comic/')
                    .set({
                        image: '#comic > img@src',
                        title: '#ctitle',
                        desc: '#comic > img@title'
                    })
                    .data(function(scrapeData) {
                        scrapeData.channel = 'XKCD';
                        scrapeData.image = 'http:' + scrapeData.image;
                        res.json(scrapeData);
                        res.end();
                    }).debug(console.log);

                break;

        }

    });
};

var logRequest = function(req, res, next) {
    var logData = {
        url: req.originalUrl,
        time: new Date(),
        parameters: req.params,
        body: req.body,
        query_parameters: req.query
    };
    Logger.mongo(logData, 'request_log');
    next();
};
