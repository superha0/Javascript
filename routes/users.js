var express = require('express');
var router = express.Router();
var model = require('../model/mulpangDao');
var MyUtil = require('../utils/myutil');
var checklogin = require('../middleware/checklogin');

router.get('/new', function(req, res, next) {
  res.render('join', {title: '회원 가입', js: 'join.js'});
});
var path = require('path'); //코어 모듈
var tmp = path.join(__dirname, '..', 'public', 'tmp'); //임시 이미지 저장경로
var multer = require('multer'); // 확장 모듈 , 설치함

router.post('/profileUpload', multer({dest: tmp}).single('profile'), function(req, res, next) {
  res.end(req.file.filename);   // 임시 파일명 응답
  //multer(저장경로).(profile로 넘어오는파일하나) : 도 미들웨어 function(..)도 미들웨어
});
router.post('/new', function(req, res, next) {
  model.registMember(req.body, function(err, result){
    if(err){
      res.json({errors:err});
    }else{
      res.end('OK');
    }
  }); // post 방식 : req.body에 저장, get : req.query에 저장
});
router.post('/simpleLogin', function(req, res, next) {
  model.login(req.body, function(err, result){
    if(err){
      res.json({errors:err});
    }else{
      req.session.user = result; // 세션값있으면 로그인한거.
       // 형식 예 ) res.json({_id: 'uzoolove@gmail.com', profileImage: 'uzoolove@gmail.com'});
      res.json(result);
    }
  })
});
router.get('/logout', function(req, res, next) {
  req.session.destroy(); // 세션 객체 삭제함.
  res.redirect('/'); //홈으로 ㄱㄱ
});
router.get('/login', function(req, res, next) {
  res.render('login', {title: '로그인'});
});
router.post('/login', function(req, res, next) { //로그인 하고 나서
  model.login(req.body, function(err, result){
    if(err){
      res.render('login',{title:'로그인',errors:err}); // 실패하면 제자리, 에러메시지 보여주면됨.
    }else{
      req.session.user = result; // 세션값있으면 로그인한거.
      res.redirect(req.session.backUrl || '/'); 
      // 이전 페이지가 있으면 이전페이지로 가고 아니면 메인페이지
    }
  })
});
router.get('/', checklogin, function(req, res, next) {
  var userid = req.session.user._id;
  model.getMember(userid, function(result){
    res.render('mypage', {
      title: '마이페이지', 
      css: 'mypage.css', 
      js: 'mypage.js',
      purchases:result,
      toStar: MyUtil.toStar,
    });
  });
  
});
router.put('/', checklogin, function(req, res, next) {
  var userid = req.session.user._id;
  model.updateMember(userid, req.body, function(err, result){
    if(err){
      res.json({errors:err});
    }else{
      res.end('OK');
    }
  });
  
});
router.post('/epilogue', checklogin, function(req, res, next) {
  var userid = req.session.user._id;
  model.insertEpilogue(userid, req.body, function(){
    res.end('success');
  });
});
module.exports = router;
