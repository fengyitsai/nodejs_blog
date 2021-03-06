var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var fs = require('fs');
var request = require('request');
var Comment = require('../models/comment.js');

function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error','not log in yet');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error','already logged in');
		res.redirect('back');
	}
	next();
}

/* GET home page. */
router.get('/', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getTen(null, page, function (err, posts, total) {
		if (err) {
			posts = [];
		} 
		res.render('index', {
			title: 'Main Page',
			posts: posts,
			page: page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * 10 + posts.length) == total,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
		res.render('register', { 
		title: 'Register', 
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'];
	console.log("Name:"+name);
	if (password != password_re){
		req.flash('error','Passwords do not match.');
		return res.redirect('/reg');
	}

	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');

	var newUser = new User({
		name: name,
		password: password,
		email: req.body.email
	});

	console.log("Name:"+newUser.name);

	User.get(newUser.name, function(err, user){
		console.log(user);
		if(user){
			req.flash('error','This username is not available.');
			return res.redirect('/reg');
		}
		newUser.save(function(err,user){
			if(err){
				req.flash('error','This username is not available.');
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success','success');
			return res.redirect('/');
		});

	});
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
	res.render('login', { 
		title: 'Login',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');

	User.get(req.body.name, function(err, user){
		if(!user){
			req.flash('error','User do not exists');
			return res.redirect('/login');
		}

		if(user.password != password){
			req.flash('error','password incorrect');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success','login success');
		res.redirect('/');
	});
});

router.get('/post', checkLogin);
router.get('/post', function(req, res) {
	res.render('post', {
		title: 'Post',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
	var currentUser = req.session.user,
		post = new Post(currentUser.name,req.body.title, req.body.post);

	post.save(function(err){
		if(err){
			req.flash('err',err);
			return res.redirect('/');
		}
		req.flash('success',"post success");
		res.redirect('/');
	});
});

router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
  res.render('upload', {
    title: 'Upload',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {

	for (var i in req.files) {
	if (req.files[i].size == 0){
	} else {
	console.log(req.files[i]);
	var target_path = './public/images/' + req.files[i].originalname;
	fs.renameSync(req.files[i].path, target_path);
	console.log('Successfully renamed a file!');
	}
	}

	req.flash('success', 'Upload Successfully!');
	res.redirect('/upload');
});

router.get('/u/:name', function (req, res) {

	var page = req.query.p ? parseInt(req.query.p) : 1;

	User.get(req.params.name, function (err, user) {
		if (!user) {
			req.flash('error', 'This user doesn\'t exist!'); 
			return res.redirect('/');
		}

		Post.getTen(user.name, page, function (err, posts, total) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	}); 
});

router.get('/u/:name/:day/:title', function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

// router.param('name', function(req, res, next, name) {
// 	// do validation on name here
// 	// blah blah validation
// 	// log something so we know its working
// 	console.log('doing name validations on ' + name);

// 	// once validation is done save the new item in the req
// 	req.name = name;
// 	// go to the next thing
// 	next();	
// });

// router.get('/hello/:name', function(req, res) {
// 	res.send('hello ' + req.name + '!');
// });

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success','logout success');
	res.redirect('/');
});

router.get('/logout', checkLogin);
router.post('/logout', function(req, res) {
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function (req, res) {
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
		if (err) {
			req.flash('error', err); 
			return res.redirect('back');
		}
		res.render('edit', {
			title: 'EDIT',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function (req, res) {
	var currentUser = req.session.user;
	Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
	var url = '/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;
	if (err) {
		req.flash('error', err); 
		return res.redirect(url);
	}
	req.flash('success', 'SUCCESS!');
	res.redirect(url);
	});
});

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function (req, res) {
	var currentUser = req.session.user;
	Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
		if (err) {
			req.flash('error', err); 
			return res.redirect('back');
		}
		req.flash('success', 'DELETED!');
		res.redirect('/');
	});
});

router.post('/u/:name/:day/:title', function (req, res) {
	var date = new Date();
	var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
             date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	var comment = {
		name: req.body.name,
		email: req.body.email,
		website: req.body.website,
		time: time,
		content: req.body.content
	};

	var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
	newComment.save(function (err) {
		if (err) {
			req.flash('error', err); 
			return res.redirect('back');
		}
		req.flash('success', 'Comment success!');
		res.redirect('back');
	});
});

router.get('/archive', function (req, res) {
  Post.getArchive(function (err, posts) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('archive', {
      title: 'Archive',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;

