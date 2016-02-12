// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Matrix', new Schema({ 
    name: { type: String, trim: true },
    user_id: String,
    created: Date,
    circles:{ 
    	last_modified: Date,
    	first_circle:{
    		total: Number,
    		voucher: Array, //{ id: String, grade: Number, source: String }
        	last_modified: Date    		
			},
	    second_circle:{
	    	total: Number,
	    	voucher: Array, //{ id: String, grade: Number, source: String  }
	    	last_modified: Date			
			},
		third_circle:{
		    total: Number,
		    voucher: Array, //{ id: String, grade: Number, source: String  }
	    	last_modified: Date			
			},
		my_voucher:{
		    total: Number,
		    voucher: Array, //{ id: String, grade: Number, source: String  }
	    	last_modified: Date			
			}
	}

}));