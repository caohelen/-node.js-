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
router.get('/getgood',coupon.selectgoods);//查看商品
router.post('/bargain',coupon.bargain);//砍价

module.exports=router;
