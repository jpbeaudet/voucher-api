// server.js
// Author: Jean-Philippe Beaudet @ S3R3NITY Technology
// Voucher-api.
//
// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose user model
var Matrix   = require('./app/models/matrix'); // get our mongoose matrix model
var api   = require('./api'); // get our api method library
//TODO : connect to private db

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 4006;        // set our port
var mongoose   = require('mongoose');
mongoose.connect(config.database); // database
app.set('superSecret_client', config.secret_client); // secret variable
app.set('superSecret_admin', config.secret_admin); // secret variable
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("db started ------------");
});


//ROUTES FOR OUR API
//=============================================================================
var router = express.Router();              // get an instance of the express Router

// Middleware before authentification
router.post('/setup', function(req, res) {
	  //console.log("setup server.js body: "+JSON.stringify(req.body));		
	  var _cb = function(response){ 
	    //console.log('User: '+ req.body.name+' saved successfully');
	    res.json(response);
	  };
	  api.createUser(req.body, app, _cb);
	 // });
	});


router.post('/authenticate', function(req, res) {
	//console.log("authenticate server.js body: "+JSON.stringify(req.body));
	//console.log("authenticate server.js name: "+req.body.name);
	//console.log("authenticate server.js password: "+req.body.password);
	//console.log("authenticate server.js admin: "+req.body.admin);
	 
	var _cb = function(response){
	//console.log("response recieved by server.js " + JSON.stringify(response));
	res.json(response);
	};
	api.authenticateUser(req.body, app,_cb);
	});

//middleware to use for all requests while authenticated
router.use(function(req, res, next) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, app.get('superSecret_client'), function(err, decoded) {      
	      if (err) {
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;    
	        next();
	      }
	    });

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	    
	  }
	});

//test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
 res.json({ message: 'hooray! welcome to our api!' });   
});


router.route('/users') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);
				res.json(users);
 });
});

router.route('/users/:users_id')

// get the user with that id (accessed at GET http://localhost:8080/api/bears/:users_id)
.get(function(req, res) {
    User.findById(req.params.users_id, function(err, user) {
        if (err)
            res.send(err);
        res.json(user);
    });
});

router.route('/users/:users_id')
.put(function(req, res) {

    // use our user model to find the user we want
    User.findById(req.params.users_id, function(err, user) {

        if (err)
            res.send(err);

        user.name = req.body.name;  // update the user name
        user.password = req.body.password;  // update the user password
        user.admin = req.body.admin;  // update the user admin
        // save the bear
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json({ success:true , message: 'User updated!' });
        });

    });
});

router.route('/users/:users_id')
.delete(function(req, res) {
    User.remove({
        _id: req.params.users_id
    }, function(err, user) {
        if (err)
            res.send(err);

        res.json({ success:true, message: 'User: '+ user+' Successfully deleted' });
    });
});

//REGISTER OUR ROUTES -------------------------------
//all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);