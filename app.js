// require the modules we need
// STOP: what are these modules? Use online documentation to read up on them.
var express = require('express');
var path = require('path');
var fs = require('fs');
var ejsLayouts = require("express-ejs-layouts");
var bodyParser = require('body-parser');
var db = require("./models");

var app = express();

// this sets a static directory for the views
app.use(express.static(path.join(__dirname, 'static')));

// using the body parser module
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.set('view engine', 'ejs');

// your routes here
app.get('/', function(req, res) {
    res.redirect('/games');
});

app.get('/games', function(req, res) {
    db.game.findAll().then(function(games) {
        res.render('games-index', { games: games });
    });
});

app.get('/games/new', function(req, res) {
    res.render('games-new');
});

app.post('/games', function(req, res) {
    var newGame = req.body;
    if (newGame.name === '' || newGame.description === '' || newGame.numberOfPlayers === '') {
        res.redirect('/games/new');
    } else {
        db.game.findOrCreate({
            where: {
                name: newGame.name,
                description: newGame.description,
                numberOfPlayers: newGame.numberOfPlayers
            }
        }).spread(function(game) {
            res.redirect('/games');
        });
    }
});

// show page
app.get('/game/:name', function(req, res) {
    var nameOfTheGame = req.params.name;
    db.game.findOne({
        where: {
            name: nameOfTheGame
        }
    }).then(function(game) {
        res.render('games-show', { game: game });
    }).catch(function(error) {
        res.sendStatus(404).render('error');
    });

});

app.get('/game/:name/edit', function(req, res) {
    var nameOfTheGame = req.params.name;
    db.game.findOne({
        where: {
            name: nameOfTheGame
        }
    }).then(function(game) {
        res.render('games-edit', { game: game });
    }).catch(function(error) {
        res.sendStatus(404).render('error');
    });
});

///update game
app.put('/game/:name', function(req, res) {
    var theNewGameData = req.body;
    if (theNewGameData.name === '' || theNewGameData.description === '' || theNewGameData.numberOfPlayers === '') {
        res.redirect('/game/:name');
    } else {
        db.game.update({
            description: theNewGameData.description,
            numberOfPlayers: theNewGameData.numberOfPlayers
        }, { where: { name: theNewGameData.name } }).then(function(game) {
            res.send('edited');
        });
    }
});

//delete game
app.delete('/game/:name', function(req, res) {
    var nameOfTheGame = req.params.name;
    db.game.destroy({
        where: {
            name: nameOfTheGame
        }
    }).then(function(game) {
        res.send('game');

    });

});

// helper functions

function getGame(games, nameOfTheGame) {
    var game = null;

    for (var i = 0; i < games.length; i++) {
        if (games[i].name.toLowerCase() == nameOfTheGame.toLowerCase()) {
            game = games[i];
            break;
        }
    }

    return game;
}

// start the server

var port = 3000;
console.log("http://localhost:" + port);
app.listen(port);
