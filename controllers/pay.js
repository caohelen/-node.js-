require('../middlewares/util')
const https = require('https')
const axios = require('axios')
const MD5 = require('MD5')
var hash_hmac = require('sha1');
var xmlreader = require("xmlreader");

module.exports = async (ctx)=>{
  const {code,nonce_str} = ctx.request.body
  console.log(nonce_str)
  // console.log(code)
  if(code){
    try{
      let grant_type = 'authorization_code'
      let appid = "wx2b4b61fd602aaaa0"
      let secret = "0f4b566d652dd9e624e57139bd38863d"
      let mch_id= "1509053081"
      let device_info = "1000"
      let body = "测试微信支付"
      let total_fee = "100"
      let total_type = "JSAPI"
      let notify_url = ""
      let key = "abcd1508901234123456745678256345"
      let spbill_create_ip = ctx.req.connection.remoteAddress
      console.log(spbill_create_ip)
      let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
      const userinfo = await getJSON(url)
      // console.log(nonce_str)
      // console.log(userinfo)
      const { openid, session_key} = userinfo
      //创建商户订单Id
        const r1 = Math.floor(Math.random()*10);
        const r2 = Math.floor(Math.random()*10);

        const sysDate = new Date().Format('yyyyMMddhhmmss'); // 系统时间：年月日时分秒
        const actionNo = r1+sysDate+r2; // 18位
        console.log(actionNo)

        // const data={
        //     "payType": "WX_PUB",
        //     "bizid": 1001,
        //     "action": "car.plate.pay",
        //     "actionNo": "actionNo",
        //     "body": "水电代扣",
        //     "detail": "水电代扣：A",
        //     "totalFee": 0.01,
        //     "evidence": "openid"
        // }
        // console.log('data:'+data)
      axios.post('http://10.144.135.178:8394/service//uni/pay', {
        data
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

     

    }catch(e){
      console.log(e);

    }
  }
}



function getJSON(url){
  return new Promise((reslove,reject)=>{
    https.get(url,res=>{
      let urlData = ''
      res.on('data', data=>{
        urlData += data
      })
      res.on('end', data=>{
        const userinfo = JSON.parse(urlData)
        if(userinfo.openid){
          reslove(userinfo)
        }
        reject(userinfo)
      })
    })
  })
}
