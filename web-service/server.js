/*
    server.js
    main server script for our task list web service
*/

var port = 8080;

// load all modules we need
// express web-server framework
var express = require('express');

// sqlite library
var sqlite = require('sqlite3');

// create a new express app
var app = express();

//body parser library
var bodyParser = require('body-parser');

// add a route for our homepage
//app.get('/', function(req, res) {
//    res.send('<h1>Hello World</h1>');
//});

// tell express to server static files from the /static subdir
// express.static returns another function and looks at the rquested url
// if it finds the file it streams it
// if request url doesn't find something
// express will continue finding other ones so other functions have a chance to be
// added to the app
app.use(express.static(__dirname + '/static'));

// tell express to parse post body data as json
app.use(bodyParser.json());

// grabs the 'my tasks' page
app.get('/api/tasks', function(req, res, next) {
   var sql = 'select rowid, title, done, createdOn from tasks where done !=1';
    db.all(sql, function(err, rows) {
        if (err) {
            next(err);
        }

        // send rows back to client as JSON
        res.json(rows);
    });
});

// will only be called with it is post
app.post('/api/tasks', function(req, res, next) {
    var newTask = {
        title: req.body.title,
        done: false,
        createdOn: new Date()
    };
    var sql = 'insert into tasks(title, done, createdOn) values(?, ?, ?)';
    db.run(sql, [newTask.title, newTask.done, newTask.createdOn], function(err) {
        if (err) {
            return next(err);
        }

        res.status(201).json(newTask);
    });
});

// when someone PUTs to /api/tasks/<task-id>
app.put('/api/tasks/:rowid', function(req, res, next) {
   // sql inject attacks happen when people don't use question marks
    // DON'T DO THIS var sql = 'update tasks set done='+req.body
   // if you do that the client can figure out that they're behaving this way
   // they can do ;drop database
   // or select * from users
   var sql = 'update tasks set done=? where rowid=?';
    db.run(sql, [req.body.done, req.params.rowid], function(err) {
        if (err) {
            return next(err);
        }

        res.json(req.body);
    });
});

//create database
var db = new sqlite.Database(__dirname + '/data/tasks.db', function(err) {
    if (err) {
        throw err;
    }

    var sql = 'create table if not exists ' +
        'tasks(title string, done int, createdOn datetime)';
    db.run(sql, function(err) {
        if (err) {
            throw err;
        }
    });

    // start the server
    app.listen(port, function() {
        console.log('server is listening on http://localhost:' + port);
    });
});

