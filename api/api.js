
var User   = require('./app/models/user'); // get our mongoose user model
var Matrix   = require('./app/models/matrix'); // get our mongoose matrix model
var mongoose   = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var config = require('./config'); // get our config file

module.exports= {
"isAuthenticated" : function (token, secret, callback){
	// decode token
	if (token) {
		// verifies secret and checks exp
	    jwt.verify(token, secret, function(err, decoded) {      
	    if (err) {
	    callback("error");    
	    } else {
	    callback("success", decoded);
	    }
	 });
	 } else {
		// if there is no token
		// return an error
		 callback("null");	    
	 }	
},
"refreshVouchersById" : function(userId, callback){
	var response;
	var newVoucher = [];
	// Loop through all documents to find new voucher to update
	Matrix.find(function(err, documents) {
		if (err){callback(err, response);}
		//console.log("Documents : "+documents);
		var arr = [];
		// in all documents founds loop througth there first circle voucher
		for (x in documents){
			if (documents[x].user_id != userId){ 
			//console.log("Document : "+documents[x]);
			if(documents[x].circles.first_circle.voucher[0]){
				//console.log("Document array : "+documents[x].circles.first_circle.voucher[0]+" is type of : "+ typeof(documents[x].circles.first_circle.voucher));
				// in the first circle voucher loop to see if the userId is mentioned if so ass to newVoucher
				for (i = 0; i < documents[x].circles.first_circle.voucher.length; i++) { 
					console.log("documents[x].circles.first_circle.voucher[i]: "+documents[x].circles.first_circle.voucher[i]);
					if(documents[x].circles.first_circle.voucher[i] == userId ){ 
				console.log("New voucher for: "+userId+" from: "+documents[x].user_id);				
				newVoucher.push(documents[x].user_id);
					}
			}}}
		}
	// if there is new voucher to update
	if (newVoucher[0]){
		Matrix.findOne({
			user_id : userId
		},function(err, user) {		
		user.circles.my_voucher = newVoucher;
		user.save(function(err, _id) {
			if (err){callback(err, response);}
			response = { success:true , message: "user myVoucher circle successfully updated", user: _id};
			callback(response);
			});

		});	
	}else{
		console.log(" No new voucher to update for: " + userId); 
		Matrix.findOne({
			user_id : userId
		},function(err, user) {		
		response = { success:false , message: " No new voucher to update for: " + userId, user: user};
		callback(response);
		});			

		
	}		
});		
},
"deleteUserVoucherById" : function(userId,voucherId, callback){
var response;
var message="No messages. id was : ";
Matrix.findOne({
	user_id: userId	
	}, function(err, matrix) {
		//console.log("delete did find "+matrix);
		var arr = [];
		try {
		var arr_before = matrix.circles.first_circle.voucher
		for (i = 0; i < arr_before.length; i++) { 
			arr.push(arr_before[i]);
			}	
		matrix.circles.first_circle.voucher = undefined;
		matrix.save(function(err) {				
		var index = arr.indexOf(voucherId);
		if(index != null && index != undefined){ 				
			arr.splice(index, 1);
			matrix.circles.first_circle.voucher = arr;
			message = "Voucher succesfully removed :";
			}else{
			matrix.circles.first_circle.voucher = arr;	
			message = "Voucher did not exist :";
			}
		matrix.save(function(err) {
			//console.log("delete arr after "+arr);
			if (err){callback(err, response);}
			response = { success:true , message: message+ ' : ' +voucherId};
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
"deleteUserById" : function(userId, callback){
var response;
 User.remove({
    _id: userId
    }, function(err, user) {
    if (err){callback(err, response);}
    response = { success:true, message: 'User: '+ user+' Successfully deleted' };
    callback(response);
});	
},
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
	console.log("arr_before: "+arr_before);
	for (i = 0; i < arr_before.length; i++) { 
		arr.push(arr_before[i]);
		}
	arr.push(voucherId)
	matrix.circles.first_circle.voucher = undefined;	
	matrix.save(function(err) {	
		console.log("arr_after: "+arr);
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
"getUserMyVoucher" : function(userId, callback){
var response;
Matrix.findOne({
	user_id: userId
	}, function(err, matrix) {
	if (err) callback(err,response);
	response = matrix.circles.my_voucher;
	callback(response);
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