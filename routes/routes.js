const Router = require('koa-router');
const controllers=require('../controllers/controllers');
const coupon = require('../controllers/coupon');
const login = require('../controllers/login');
const router = new Router({
    prefix: '/wx'

});
router.get('/', controllers.hello);
router.post('/login',login.login);
// router.post('/login', controllers.login);
router.post('/getuser',controllers.getuser);
router.post('/register', controllers.register);
router.get('/select', controllers.select);
router.post('/createcoupon',coupon.createcoupon);//创建优惠券
router.post('/delectcoupon',coupon.delectecoupon);//删除券
router.get('/selectgoods',coupon.selectgoods);//查看商品
router.post('/bargain',coupon.bargain);//砍价
router.post('/selectlogin',login.selectlogin);//查询登入
router.post('/getgood',coupon.getgood);//查询单件商品
router.post('/selctbargain',coupon.selctbargain);//查询砍价清单
router.post('/selectcoupon',coupon.selectcoupon);//查询用户是否存在砍价中的券
router.post('/modifycoupon',coupon.modifycoupon);//修改优惠券状态
router.post('/getcoupon',coupon.getcoupon);//修改优惠券状态
router.post('/paycoupon',coupon.paycoupon);//创建支付优惠券
router.post('/findcoupon',coupon.findcoupon);//查询砍价优惠券

module.exports=router;
