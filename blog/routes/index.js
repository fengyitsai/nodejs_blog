var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Main' });
});

router.post('/', function(req, res) {
});

router.get('/reg', function(req, res) {
  res.render('register', { title: 'Register' });
});

router.post('/register', function(req, res) {
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

router.post('/login', function(req, res) {
});

router.get('/post', function(req, res) {
  res.render('post', { title: 'Post' });
});

router.post('/post', function(req, res) {
});

router.get('/logout', function(req, res) {
  res.render('logout', { title: 'Logout' });
});

router.post('/logout', function(req, res) {
});

module.exports = router;
