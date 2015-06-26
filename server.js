var path = require("path");
var express = require("express");
var app = express();
var mongoose = require('mongoose');
var moment = require("moment");
var bodyParser = require("body-parser");
var validate = require("mongoose-validator");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/static")));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})


mongoose.connect('mongodb://localhost/message_board');
var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
	name: {type: String, minlength: 4},
	message: String,
	created_at: {type: String, default: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")},
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});
var Message = mongoose.model('Message', MessageSchema);

var CommentSchema = mongoose.Schema({
 // since this a reference to a different document, the _ is the naming convention!
 	_message: {type: Schema.ObjectId, ref: 'message'},
 	cname: String,
 	comment: String, 
 	created_at: {type: String, default: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
});

var Comment = mongoose.model('Comment', CommentSchema);


MessageSchema.path('name').required(true, 'Name must have 4 characters');
MessageSchema.path('message').required(true, 'Message cannot be blank');

app.get('/', function(req, res) {
	Message.find({})
		.populate('comments')
		.exec(function(err,messages){
			res.render('index', {data:messages, messageError: ''});
		})
})

app.post('/message', function(req,res){
	console.log('message posted', req.body);
	var message = new Message(req.body);
	message.save(function(err){
		if(err){
			console.log("msg error");
			res.render('index', {title: 'errors present!', errors: message.errors})
		}else{
			res.redirect('/');
		}
	})
})

app.post('/comment/:id', function(req,res){
	// console.log("POST DATA", req.body);
	Message.findOne({_id: req.params.id}, function(err,message){
		var comment = new Comment(req.body);
		console.log(comment);
		comment._message = message._id;
		message.comments.push(comment);
		comment.save(function(err){
			message.save(function(err){
				if(err){
					console.log('Comment Error');
				}else{
					res.redirect('/');
				}
			})
		})
	})
})
