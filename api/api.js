
var User   = require('./app/models/user'); // get our mongoose user model
var Matrix   = require('./app/models/matrix'); // get our mongoose matrix model
var mongoose   = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

module.exports= {
"updateUserVoucherById": function(userId, voucherId, callback){
var response;
Matrix.findOne({
	user_id: userId		
	}, function(err, matrix) {
	console.log("put did find "+matrix);
	console.log("put did find matrix.circles.first_circle.voucher "+matrix.circles.first_circle.voucher);
	var arr = [];
	try {
	var arr_before = matrix.circles.first_circle.voucher;
	for (i = 0; i < arr_before.length; i++) { 
		arr.push(arr_before[i]);
		}
	matrix.circles.first_circle.voucher = undefined;	
	matrix.save(function(err) {						
		matrix.circles.first_circle.voucher = arr;		
		matrix.save(function(err) {
		if (err){callback(err,response);}
		response = {success:true , message: 'Voucher updated! New voucher added : ' +voucherId};
		callback(response);
		});
		});
	}catch(err) {		
		console.log("the user id or voucher id provided was wrong ! "); 
		response = {success:false, message:"the user id or voucher id provided was wrong ! " }
		callback(err, response);
		
	}
});
	
},
"updateUserById" : function(body, userId, callback){
var response;
User.findById(userId, function(err, user) {
     if (err){res.send(err);}
     user.name = body.name;  // update the user name
     user.password = body.password;  // update the user password
     user.admin = body.admin;  // update the user admin
     // save the user
     user.save(function(err) {
        if (err){callback(err, response);}               
        response = { success:true , message: 'User updated!' };
        callback(response);
        });
});	
},
"getUserThirdCircle" : function(userId, callback){
var response;
Matrix.findOne({
	user_id: userId
	}, function(err, matrix) {
	if (err) callback(err,response);
	response = matrix.circles.third_circle;
	callback(response);
});
},
"getUserSecondCircle" : function(userId, callback){
var response;
Matrix.findOne({
	user_id: userId
	}, function(err, matrix) {
	if (err) callback(err,response);
	response = matrix.circles.second_circle;
	callback(response);
});
},
"getUserFirstCircle" : function(userId, callback){
var response;
Matrix.findOne({
	user_id: userId
	}, function(err, matrix) {
	if (err) callback(err,response);
	response = matrix.circles.first_circle;
	callback(response);
});
},
"getUserCircles" : function(userId, callback){
var response;	
Matrix.findOne({
	user_id: userId
	}, function(err, matrix) {
	if (err) callback(err,response);
	response = matrix;
    callback(response);
});
},		
"getUsers" : function(callback){
User.find(function(err, users) {
	var response;
	if (err) callback(err,response);
	response = users;
	callback(response);
});
},
"getUserById" : function(userId, callback){
User.findById(userId, function(err, user) {
	var response;
	if (err) callback(err,response);;
	response = user;
	callback(response);
});
},
"createUser" : function (body, callback){
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
		name: body.name,
		user_id: _id._id,
		created: now		  
		});			  
		matrix.save(function(err,_id) {
			if (err) throw err;
		  	});
	  });
	var response = { success: true };
	callback(response);
},
"authenticateUser" : function (body, secret, callback){
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
	  	    var token = jwt.sign(user, secret, {
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
	        var token = jwt.sign(user, secret, {
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
	      }}}
	  });	
}
};