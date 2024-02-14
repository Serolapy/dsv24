import mongoose from "mongoose";

// Valentines
export default new mongoose.Schema({
	from : {
		type : Number,
	},
	to : {
		type : Number,
	},
	text : {
		type : String,
	},
	date : {
		type : Date,
	},
});