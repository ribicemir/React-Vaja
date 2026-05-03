var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var voteSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	'value': {
		type: String,
		enum: ['like', 'dislike'],
		required: true
	}
}, { _id: false });

var commentSchema = new Schema({
	'postedBy': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	'message': {
		type: String,
		required: true,
		trim: true
	},
	'createdAt': {
		type: Date,
		default: Date.now
	}
});

var reportSchema = new Schema({
	'user': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	'createdAt': {
		type: Date,
		default: Date.now
	}
}, { _id: false });

var photoSchema = new Schema({
	'title': {
		type: String,
		required: true,
		trim: true
	},
	'message': {
		type: String,
		required: true,
		trim: true
	},
	'path': {
		type: String,
		required: true
	},
	'postedBy': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	'likes': {
		type: Number,
		default: 0
	},
	'dislikes': {
		type: Number,
		default: 0
	},
	'votes': {
		type: [voteSchema],
		default: []
	},
	'comments': {
		type: [commentSchema],
		default: []
	},
	'reports': {
		type: [reportSchema],
		default: []
	},
	'reportCount': {
		type: Number,
		default: 0
	},
	'hidden': {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('photo', photoSchema);
