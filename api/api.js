
var User   = require('./app/models/user'); // get our mongoose user model
var Matrix   = require('./app/models/matrix'); // get our mongoose matrix model
var mongoose   = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

module.exports= { 		

"createUser" : function (body, app, callback){

var d = new Date();
var now = d.getUTCFullYear()+ "-"+d.getUTCMonth()+"-"+d.getUTCDay();
// create a sample user
var user = new User({ 
	name: body.name, 
	password: body.password,
	admin: body.admin 
	});

// save the sample user
user.save(function(err,_id) {
	if (err) throw err;
	 
	// create a matrix instance to the user.id
	var matrix = new Matrix({
		name: { type: body.name, trim: true },
		user_id: _id,
		created: now		  
		});			  
		matrix.save(function(err,_id) {
			if (err) throw err;
		  	});
	  });
	var response = { success: true };
	callback(response);
},
"authenticateUser" : function (body, app, callback){
	console.log("authenticate user has fired");
	console.log("authenticate user name: "+body.name);
	  // find the user
	  User.findOne({
	    name: body.name
	  }, function(err, user) {
		  console.log("found user has fired");
	    if (err) throw err;

	    if (!user) {
	    	response = { success: false, message: 'Authentication failed. Wrong password.' };
	    	callback(response);
	      // res.json({ success: false, message: 'Authentication failed. User not found.' });
	    } else if (user) {

	      // check if password matches
	      if (user.password != body.password) {
	    	response = { success: false, message: 'Authentication failed. Wrong password.' };
	    	callback(response);
	        // res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	      } else {
	    	  if(body.admin ){
	    		  // If is admin 
	  	        // if user is found and password is right
	  	        // create a token
	  	        var token = jwt.sign(user, app.get('superSecret_admin'), {
	  	          expiresInMinutes: 1440 // expires in 24 hours
	  	        });

	  	        // return the information including token as JSON
	  	        response = {
	  	          success: true,
	  	          message: 'Enjoy your token!',
	  	          token: token
	  	        };
	  	      callback (response);
	    	  }else{
	    		  // If is client 
	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign(user, app.get('superSecret_client'), {
	          expiresInMinutes: 1440 // expires in 24 hours
	        });

	        // return the information including token as JSON
	        response = {
	          success: true,
	          message: 'Enjoy your token!',
	          token: token
	        };
	        console.log("response has fired"+ JSON.stringify(response));
	        callback(response);
	      }
	      }   

	    }

	  });	
}
};