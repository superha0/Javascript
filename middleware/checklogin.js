function requireLogin(req, res, next){
  if(req.session.user){
    next();
  }else{
    if(req.headers['x-requested-with'] == 'XMLHttpRequest'){ //ajax 요청일때
      res.json({errors: {message: '로그인이 필요한 서비스 입니다.'}});
    }else{
      req.session.backUrl = req.originalUrl;
      res.redirect('/users/login');
    }
  }
}

module.exports = requireLogin;