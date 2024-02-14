import mongoose from "mongoose";

// Users
export default new mongoose.Schema({
	user_id : {
		type : Number,
		unique : true
	},
	counte_msg : {
		type: Number,
		default: 0
	},
});