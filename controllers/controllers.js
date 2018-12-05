
//连接数据库
const Mysql = require('node-mysql-promise');
const mysql = Mysql.createConnection({
    host        : '10.144.138.54',
    // host        : 'localhost',
    user        : 'root',
    password    : 'oracle',//服务器密码
    // password    : 'chl',//本地密码
    port:'3306',
    database: 'cAuth',
    dateStrings: true
});
const https = require('https');
const WXBizDataCrypt = require('../middleware/WXBizDataCrypt')

module.exports = {
    // 供测试使用
    hello: async (ctx, next) => {
        return ctx.response.body = '小程序已启动';
    },
    //选择测试
    select:async (ctx,next)=>{
      await mysql.table('users').select().then(function (data) {
            console.log('查询成功')
            ctx.response.body = {
                msg:'获取商品信息成功',
                data
              }
        }).catch(function (e) {
            console.log(e);
        });
    },

    
    //获取用户信息
    getuser:async(ctx,next) => {
        const {code} = ctx.request.body
  // console.log('用戶信息',code)
        if(code){
                try{
                let grant_type = 'authorization_code'
                let appid = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const { openid, session_key} = userinfo
                
                const userdata = await mysql.table('csessioninfo').where({open_id:openid}).select();
                    if (userdata[0].open_id){
                        ctx.response.body = {
                            state_code:'200',
                            imform:'success',
                            msg:'已经获取用户信息成功',
                        }
                    }else{
                    let datas={
                        open_id:openid,
                        session_key:session_key
                    }
                
                    await  mysql.table('csessioninfo').add(datas).then(data => {
                        //如果插入成功，返回插入的id
                        console.log('登入成功')
                        ctx.response.body = {
                            state_code:'200',
                            imform:'success',
                            msg:'获取用户信息成功',
                            datas
                        }
                        return true
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        console.log(err)
                        return false
                    })
                }
            }catch(e){
                console.log(e);
                
            }
        }
    },



    //获取用户信息以及电话号码
    login:async (ctx,next) =>{
        const {code,encryptedData,iv} = ctx.request.body
        if(code&&iv){
            try{
                let grant_type = 'authorization_code'
                let appId = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const { openid, session_key} = userinfo

                const sessionkey = session_key;

                const pc = new WXBizDataCrypt(appId, sessionkey)

                const da = pc.decryptData(encryptedData , iv)

                console.log('解密后 data: ', da)

                let datas = {
                    openid:openid,
                    session_key:sessionkey,
                    phone:da.phoneNumber
                }
                await  mysql.table('users').add(datas).then(function (data) {
                    //如果插入成功，返回插入的id
                    console.log('登入成功')
                 ctx.response.body = {
                        state_code:'200',
                        imform:'success',
                        msg:'获取用户信息成功',
                        data:datas
                 }
                    return true
                }).catch(function (err) {
                    //插入失败，err为具体的错误信息
                   console.log(err)
                   return false
                })
                
                

            }catch(e){
                console.log(e);

            }
        }else{

        }
    },

    
//注册测试
    register:async (ctx,next)=>{
            let datas  = {
                name:ctx.request.body.name
            };
            console.log(datas)
             await  mysql.table('users').add(datas).then(function (data) {
                    //如果插入成功，返回插入的id
                    console.log('插入成功')
                 ctx.response.body = {
                        state_code:'200',
                        msg:'获取用户信息成功',
                        data:datas
                 }
                    return true
                }).catch(function (err) {
                    //插入失败，err为具体的错误信息
                   console.log(err)
                })

    }
};

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