var express = require('express');
var router = express.Router();
var model = require('../model/mulpangDao');
var MyUtil = require('../utils/myutil');
var checklogin = require('../middleware/checklogin');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('today');
});

router.get('/today', function(req, res, next) {
  if(req.query.page){
    req.query.page = parseInt(req.query.page);
  }else{
    req.query.page = 1;
    if(req.query.date){ req.url += '&page=1'; }else{ req.url += '?page=1';}
  }

  model.couponList({
    qs: req.query,
    callback: function(list){
      //rconsole.log(require('util').inspect(couponList,{depth:5}));

      list.page = {};
      if(req.query.page > 1){
        list.page.pre = req.url.replace(`page=${req.query.page}`, `page=${req.query.page-1}`);
      }
      if(req.query.page < list.totalPage){
        list.page.next = req.url.replace(`page=${req.query.page}`, `page=${req.query.page+1}`);
      }

       res.render('today', { 
         title: '오늘의 쿠폰', 
         list: list, 
         css:'today.css',
          query: req.query});
    }
  });
});

router.get('/coupons/:no', function(req, res, next) {
  var couponNo = req.params.no;
  var io = req.app.get('io');
  model.couponDetail(io,couponNo, function(coupon){
    res.render('detail',{
      title:coupon.couponName, 
      coupon: coupon, 
      toStar: MyUtil.toStar,
      css:'detail.css',
      js:'detail.js'
    });
  });
});

router.get('/purchase/:no', function(req, res, next) {
  var couponNo = req.params.no;
  model.buyCouponForm(couponNo, function(coupon){
    res.render('buy',{
      title:coupon.couponName, 
      coupon: coupon, 
      css:'detail.css',
      js:'buy.js'
    });
  });
});

router.post('/purchase',checklogin,function(req, res, next) {
  req.body.userid = req.session.user._id;
  model.buyCoupon(req.body, function(err,result){
    if(err){
      res.json({errors: err});
      //mulpangDao.js 에서  
      //cb({message: '쿠폰 구매에 실패했습니다. 잠시 후 다시 시도하시기 바랍니다.'});
      //err 를 errors 속성의 message로 담는다. -> buy.js 에서 alert(result.errors.message); 로 메세지 출력.
    }else{
      res.end('OK');
    }
  });
});

router.get('/location', function(req, res, next){
  model.couponList({
    callback: function(couponList){
      res.render('location', {
        list:couponList, 
        title: '근처 쿠폰', 
        css: 'location.css', 
        js: 'location.js'});
    }
  });
});


//뭐지----왜 지워졌을까....
router.get('/best', function(req, res, next){
 res.render('best', { 
        title: '추천 쿠폰', 
        css:'best.css',
        js:'best.js'});
});

router.get('/topCoupon', function(req, res, next){
  model.topCoupon(req.query.condition, function(list){
    //res.json([]); // 빈배열
    res.json(list); //list는 배열이니까 [] 필요없음.
  });
  
});


//-----

router.get('/all', function(req, res, next){
  model.couponList({
    qs: req.query,
    callback: function(couponList){
      res.render('all', { 
        title: '모든 쿠폰', 
        list: couponList, 
        css:'all.css',
      query: req.query});
    }
  });
});




router.get('/couponQuantity', function(req, res, next){
  model.couponQuantity(req.query.couponIdList.split(','),function(result){
    res.contentType('text/event-stream');
    res.write('data: ' + JSON.stringify(result) + '\n');
    res.write('\n');
    res.end('retry: 10000\n');
  });
});

router.get('/admin',checklogin, function(req, res, next){
  res.render('admin'); //admin.ejs 파일을 보여주도록
});


router.get('/couponList', function(req, res, next){
  var qs = req.query;
  qs.order = qs.sidx || 'saleDate.start';
  qs.keyword = qs.searchString;
  model.couponList({
    qs: qs,
    callback: function(list){
      console.log(list.length);
      var result = {
        page: qs.page,
        total: list.totalPage,
        rows: list
      };
      res.json(result);
    }
  });
});

router.post('/couponEdit', function(req, res, next){
  res.json('success');
});

module.exports = router;
