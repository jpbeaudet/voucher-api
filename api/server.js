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


//ROUTES FOR VOUCHER-API
//=============================================================================
var router = express.Router();              // get an instance of the express Router

// Voucher api CRUD sections
/////////////////////////////////////////
//Create section

// Middleware to create a new user
router.post('/setup', function(req, res) {
	  //console.log("setup server.js body: "+JSON.stringify(req.body));		
	  var _cb = function(response){ 
	    console.log('User: '+ req.body.name+' saved successfully');
	    res.json(response);
	  };
	  api.createUser(req.body, _cb);
	 // });
	});

/////////////////////////////////////////
//Authenticate section

router.post('/authenticate', function(req, res) {
	var secret;
	if(req.body.admin){ secret = app.get('superSecret_admin');}else{secret = app.get('superSecret_client');}

	var _cb = function(response){
	console.log("response recieved by server.js " + JSON.stringify(response));
	console.log("User authenticated successfully: " +req.body.name);
	res.json(response);
	};
	api.authenticateUser(req.body, secret, _cb);
	});

////////////////////////////////////////////////////////
//middleware to use for all requests while authenticated

router.use(function(req, res, next) {	
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var _cb = function(response, decoded){
		if (response != "null") {			
			if(response == "error"){ 
			console.log("User is not authenticated ");
		    return res.json({ success: false, message: 'Failed to authenticate token.' });    
		    } else {
		    // if everything is good, save to request for use in other routes
			console.log("User is authenticated ");		    	
		    req.decoded = decoded;    
		    next();
		    }
		} else if(response =="null"){
			 //if there is no token
			 //return an error
			console.log("User token was not provided ");	
			return res.status(403).send({ 
		        success: false, 
		        message: 'No token provided.' 
		    });	    
		    }	
		};
		api.isAuthenticated(token, app.get('superSecret_admin'), _cb);
});

// While authenticated:
/////////////////////////////////////////
router.route('/myVoucher/:users_id') 
//refresh and thnen get the user updated data (accessed at GET http://localhost:4006/api/myVoucher/:user_id)
.get(function(req, res) {
	var _cb = function(user){
		console.log("User document updated: " + JSON.stringify(user));
		res.json(user);
		};	
		api.refreshVouchersById(req.params.users_id, _cb);
});

/////////////////////////////////////////
// Read section

//test route to make sure everything is working (accessed at GET http://localhost:4006/api)
router.get('/', function(req, res) {
 res.json({ message: 'Voucher API!' });   
});


router.route('/users') 
//get all the users (accessed at GET http://localhost:4006/api/users)
.get(function(req, res) {		
	var _cb = function(err, users){ 
	console.log('Users returned successfully ');
	if(err){res.send(err);}else{res.json(users);}		  
	};
	api.getUsers(_cb);
});

router.route('/users/:users_id')
//get the all user data (accessed at GET http://localhost:4006/api/users/:users_id)
.get(function(req, res) {	
	var _cb = function(err, users){ 
	console.log('User returned successfully ');
	if(err){res.send(err);}else{res.json(users);}		  
	};
	api.getUserById(req.params.users_id, _cb);	
});

router.route('/users/:users_id/circles')
//get the all user circles (accessed at GET http://localhost:4006/api/users/:users_id/circles')
.get(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User Circles returned successfully ');
	if(err){res.send(err);}else{res.json(matrix);}		  
	};	
	api.getUserCircles(req.params.users_id, _cb);
});

router.route('/users/:users_id/circles/first')
//get the user second circle (accessed at GET http://localhost:4006/api/users/:users_id/circles/first')
.get(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User First Circles returned successfully ');
	if(err){res.send(err);}else{res.json(matrix);}		  
	};	
	api.getUserFirstCircle(req.params.users_id, _cb);	
});

router.route('/users/:users_id/circles/second')
//get the user second circle (accessed at GET http://localhost:4006/api/users/:users_id/circles/second')
.get(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User Second Circles returned successfully ');
	if(err){res.send(err);}else{res.json(matrix);}		  
	};	
	api.getUserSecondCircle(req.params.users_id, _cb);	
});

router.route('/users/:users_id/circles/third')
//get the user third circle (accessed at GET http://localhost:4006/api/users/:users_id/circles/third')
.get(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User Third Circles returned successfully ');
	if(err){res.send(err);}else{res.json(matrix);}		  
	};	
	api.getUserThirdCircle(req.params.users_id, _cb);		
});

router.route('/users/:users_id/circles/myVoucher')
//get the user myVoucher(accessed at GET http://localhost:4006/api/users/:users_id/circles/myVoucher')
.get(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User myVoucher returned successfully ');
	if(err){res.send(err);}else{res.json(matrix);}		  
	};	
	api.getUserMyVoucher(req.params.users_id, _cb);		
});
/////////////////////////////////////////
//Update section

//update the user(not used) (accessed at PUT http://localhost:4006/api/users/:users_id/')
router.route('/users/:users_id')
.put(function(req, res) {
	var _cb = function(err, matrix){ 
	console.log('User Updated successfully: '+req.params.users_id);
	if(err){res.send(err);}else{res.json({ success:true , message: 'User updated!' });}		  
	};	
	api.updateUserById(req.body, req.params.users_id, _cb);	
});

//add a voucher to the user first circle (accessed at PUT http://localhost:4006/api/users/:users_id/circles')
router.route('/users/:users_id/circles/:voucher_id')
.put(function(req, res) {
	var _cb = function(err, response){ 
	console.log('User Voucher Updated successfully for : '+req.params.voucher_id);
	if(err){res.send(err);}else{res.json(response);}		  
	};	
	api.updateUserVoucherById(req.params.users_id, req.params.voucher_id, _cb);	
});

/////////////////////////////////////////
//Delete section

// delete a user by id  (accessed at DELETE http://localhost:4006/api/users/:users_id')
router.route('/users/:users_id')
.delete(function(req, res) {
	var _cb = function(err, response){ 
	console.log('User Deleted successfully for : '+req.params.users_id);
	if(err){res.send(err);}else{res.json(response);}		  
	};	
	api.deleteUserById(req.params.users_id, _cb);	
});

//delete a voucher in the user list by ids  (accessed at DELETE http://localhost:4006/api/users/:users_id/circles/:voucher_id')
router.route('/users/:users_id/circles/:voucher_id')
.delete(function(req, res) {
	var _cb = function(err, response){ 
	console.log('User Voucher Deleted successfully for : '+req.params.voucher_id);
	if(err){res.send(err);}else{res.json(response);}		  
	};	
	api.deleteUserVoucherById(req.params.users_id, req.params.voucher_id, _cb);	
});

//REGISTER OUR ROUTES -------------------------------
//all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);