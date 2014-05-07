var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
});

router.get('/reg', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/reg', function(req, res) {
});

router.get('/login', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res) {
});

router.get('/post', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/post', function(req, res) {
});

router.get('/logout', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/logout', function(req, res) {
});

module.exports = router;
