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
module.exports = {
    createcoupon: async (ctx,next) => {
        const {code,good_id} = ctx.request.body
        // console.log(code)
        // console.log(good_id)
        if(code){
          try{
            let grant_type = 'authorization_code'
            let appid = "wx2b4b61fd602aaaa0"
            let secret = "0f4b566d652dd9e624e57139bd38863d"

            let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
            const userinfo = await getJSON(url)
            // console.log(userinfo)
            const { openid, session_key} = userinfo
            // console.log(openid)
            
            let userdata = await mysql.table('user').where({open_id:openid}).select();
            
            // console.log('0000000000')

            if(userdata || userdata.length === 1){
                
                //创建券ID
                let r1 = Math.floor(Math.random()*10);
                let r2 = Math.floor(Math.random()*10);
                // let sysDate = new Date().Format('yyyyMMddhhmmss'); // 系统时间：年月日时分秒
                
                //获取系统时间
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth()+1;
                let day = date.getDate();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let second = date.getSeconds();
                let sysDate = year+''+month+''+day+''+hour+''+minute+''+second
                // console.log('当前时间:'+sysDate);

                let coupon_id = r1+sysDate+r2; // 18位
                console.log('coupon_id:'+coupon_id)

                const gooddata = await  mysql.table('goods').where({good_id:good_id}).select();

                console.log('商品信息:'+gooddata[0].good_id)

                let coupontdata = {
                    coupon_id:coupon_id,
                    coupon_name:gooddata[0].good_name,
                    coupon_descript:gooddata[0].good_descript,
                    coupon_price:gooddata[0].good_price,
                    good_id:gooddata[0].good_id,
                }
                await mysql.table('coupons').add(coupontdata).then(insertId => {
                    //如果插入成功，返回插入的id
                    console.log('优惠券存储成功')
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        ctx.response.body = {
                        code:-1,
                        data:{
                            msg:'获取失败'+err
                        }
                        }
                    })
                    let data = {
                    openid:openid,
                    session_key:session_key,
                    coupon_id:coupon_id,
                    coupon_name:gooddata[0].good_name,
                    coupon_descript:gooddata[0].good_descript,
                    coupon_price:gooddata[0].good_price,
                    good_id:gooddata[0].good_id,
                    coupon_statute:0,
                    }
                    await mysql.table('coupon_manage').add(data).then(insertId => {
                    //如果插入成功，返回插入的id
                        ctx.response.body = {
                        code:'1',
                        msg:'获取商品信息成功',
                        data
                        }
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        ctx.response.body = {
                            code:-1,
                            data:{
                            msg:'获取失败'+err
                            }
                        }
                    })

                }else{
                ctx.response.body = {
                    code:-1,
                    data:{
                    msg:'获取失败:登入错误'
                    }
                }
                return
                }
            }catch(e){
              console.log(e);
            }
        }
    },

    //添加待付款优惠券
    paycoupon:async (ctx,next) => {
        const {code,good_id} = ctx.request.body
        // console.log(code)
        // console.log(good_id)
        if(code){
            try{
                let grant_type = 'authorization_code'
                let appid = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const { openid, session_key} = userinfo
                console.log(openid)

                let userdata = await mysql.table('user').where({open_id:openid}).select();

                // console.log('0000000000')

                if(userdata || userdata.length === 1){

                    //创建券ID
                    let r1 = Math.floor(Math.random()*10);
                    let r2 = Math.floor(Math.random()*10);
                    // let sysDate = new Date().Format('yyyyMMddhhmmss'); // 系统时间：年月日时分秒

                    //获取系统时间
                    let date = new Date();
                    let year = date.getFullYear();
                    let month = date.getMonth()+1;
                    let day = date.getDate();
                    let hour = date.getHours();
                    let minute = date.getMinutes();
                    let second = date.getSeconds();
                    let sysDate = year+''+month+''+day+''+hour+''+minute+''+second
                    // console.log('当前时间:'+sysDate);

                    let coupon_id = r1+sysDate+r2; // 18位
                    console.log('coupon_id:'+coupon_id)

                    const gooddata = await  mysql.table('goods').where({good_id : good_id}).select();

                    console.log('商品信息:'+gooddata[0].good_id)

                    let coupontdata = {
                        coupon_id:coupon_id,
                        coupon_name:gooddata[0].good_name,
                        coupon_descript:gooddata[0].good_descript,
                        coupon_price:gooddata[0].good_price,
                        good_id:gooddata[0].good_id
                    }
                    await mysql.table('coupons').add(coupontdata).then(insertId => {
                        //如果插入成功，返回插入的id
                        console.log('优惠券存储成功')
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        ctx.response.body = {
                            code:-1,
                            data:{
                                msg:'获取失败'+err
                            }
                        }
                    })
                    let data = {
                        openid:openid,
                        session_key:session_key,
                        coupon_id:coupon_id,
                        coupon_name:gooddata[0].good_name,
                        coupon_descript:gooddata[0].good_descript,
                        coupon_price:gooddata[0].good_price,
                        good_id:gooddata[0].good_id,
                        //0代表砍价中,1代表待付款，2代表待使用，3代表已使用
                        coupon_statute:1,
                    }
                    await mysql.table('coupon_manage').add(data).then(insertId => {
                        //如果插入成功，返回插入的id
                        ctx.response.body = {
                            code:'1',
                            msg:'获取商品信息成功',
                            data
                        }
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        ctx.response.body = {
                            code:-1,
                            data:{
                                msg:'获取失败'+err
                            }
                        }
                    })

                }else{
                    ctx.response.body = {
                        code:-1,
                        data:{
                            msg:'获取失败:登入错误'
                        }
                    }
                    return
                }
            }catch(e){
                console.log(e);
            }
        }
    },

    selectgoods:async (ctx,next) => {
        await mysql.table('goods').select().then(function (datas) {
            // console.log('查询成功')
            ctx.response.body = {
                msg:'获取商品信息成功',
                datas
              }
        }).catch(function (e) {
            ctx.response.body = {
                code:-1,
                data:{
                msg:'获取失败:'+e
                }
            }
            console.log(e);
        });
    },

//查看单件商品
    getgood:async (ctx,next) => {
        const {good_id} = ctx.request.body
        await mysql.table('goods').where({good_id:good_id}).select().then(function (data) {
            // console.log(data);
            ctx.response.body ={
                state_code:1,
                msg:'查询成功',
                datas:data[0]
            }

        }).catch(function (e) {
            console.log(e);
        });
},

    delectecoupon:async (ctx,next) => {
        const {coupon_id} = ctx.request.body
            try{
            await mysql.table('coupon_manage').where({ coupon_id: coupon_id }).delete()
            await mysql.table('coupons').where({ coupon_id: coupon_id }).delete().then(affectRows=>{
                ctx.response.body = {
                    code:1,
                    msg:'删除成功'
                }
            })
            }catch(e){
                ctx.response.body  = {
                    code:-1,
                    data:{
                        msg:'获取失败:'+e
                    }
                }
            }
    },

    bargain:async (ctx,next) => {
        const {code,avatarUrl,nickName,coupon_id,coupon_price,coupon_cont,coupon_url,coupon_total} = ctx.request.body

    try{
            let grant_type = 'authorization_code'
            let appid = "wx2b4b61fd602aaaa0"
            let secret = "0f4b566d652dd9e624e57139bd38863d"

            let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
            const userinfo = await getJSON(url)
            // console.log(userinfo)
            const { openid, session_key} = userinfo
            
            let bargaindata = await mysql.table('bargain').where({open_id:openid,coupon_url:coupon_url}).select()

            console.log('dafdaff'+bargaindata.length)
                if(bargaindata.length === 0){
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    var day = date.getDate();
                    var hour = date.getHours();
                    var minute = date.getMinutes();
                    var second = date.getSeconds();
                    var sysData = year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second
                    // console.log(coupon_price.toString(2))
                    // console.log(price.toString(2))
                    // console.log(year+''+month+''+day+''+hour+''+minute+''+second);
                    // console.log('dddd:'+sysData)
                    // remain_price = coupon_price - price
                    // console.log(remain_price)
                    let datas = {
                        open_id:openid,
                        session_key:session_key,
                        avatarUrl:avatarUrl,
                        nickName:nickName,
                        coupon_id:coupon_id,
                        coupon_price:coupon_price,
                        coupon_cont:coupon_cont,
                        time:sysData,
                        coupon_url:coupon_url,
                        coupon_total:coupon_total,
                    }
                    // console.log(datas)
                    await mysql.table('bargain').add(datas).then(data => {
                        ctx.response.body = {
                            code:'1',
                            msg:'砍价成功',
                            datas:datas
                        }
                    }).catch(err=>{
                        ctx.response.body = {
                            code:'-1',
                            msg:'砍价失败,只允许砍价一次' +  err
                        }
                    })
                } else {
                    ctx.response.body = {
                        code: -1,
                        msg: '只允许砍价一次'
                    }
                }
        }catch(e){
            console.log(e)
        }
    },

    selctbargain:async (ctx,next) => {
        const {coupon_id} = ctx.request.body;
        await mysql.table('bargain').where({coupon_id:coupon_id}).order('coupon_cont ASC').select().then(data=>{
            ctx.response.body = {
                code:1,
                msg:'查询成功',
                datas:data
            }
        }).catch(err => {
            ctx.response.body={
                code:-1,
                msg:'查询失败'+err
            }
        })
    },

    selectcoupon:async (ctx,next) => {
        const {code} = ctx.request.body;
        if(code) {
            try {
                let grant_type = 'authorization_code'
                let appid = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const { openid, session_key} = userinfo


              await mysql.table('bargain').where({open_id:openid}).select().then(data => {
                  // console.log(data)
                  // console.log('ddddd'+data.length)
                  if (data.length != 0){
                      for(i = 0; i < data.length;i++) {
                          if (data[i] != null && data[i].coupon_url != '') {
                              ctx.response.body = {
                                  code: 1,
                                  msg: '查询成功',
                                  datas: data[i],
                              }
                          } else {
                              ctx.response.body = {
                                  code: -1,
                                  msg: '查询成功,但没有返回值',
                              }
                          }
                      }
                  }else {
                      ctx.response.body = {
                          code:-1,
                          msg:'没有返回数据'
                      }
                  }
                    // console.log(ctx.response.body.datas)
                }).catch(function (e) {
                    ctx.response.body ={
                        code:-1,
                        msg:'查询错误'+e
                    }
                });

            } catch (e) {
                ctx.response.body = {
                    code: -1,
                    msg: '查询错误' + e
                }
            }

        }
    },

    modifycoupon:async (ctx,next) => {
        const {coupon_id} = ctx.request.body
        console.log(coupon_id)
        let data = {
            coupon_statute:2
        };
        let where = {
            coupon_id:coupon_id
        }
        await mysql.table('coupon_manage').where(where).update(data).then(()=>{
            ctx.response.body = {
                code:1,
                msg:'修改成功',

            }
        }).catch(err => {
            ctx.response.body={
                code:-1,
                msg:'修改失败'+err
            }
        })
    },

    getcoupon:async (ctx,next) => {
        const {code} = ctx.request.body;
        if(code) {
            try {
                let grant_type = 'authorization_code'
                let appid = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const {openid, session_key} = userinfo
                await mysql.table('coupon_manage').where({coupon_statute:1,openid:openid}).select().then(data=>{
                    ctx.response.body = {
                        code:1,
                        msg:'查询成功',
                        datas:data
                    }
                }).catch(err => {
                    ctx.response.body={
                        code:-1,
                        msg:'查询失败'+err
                    }
                })
            } catch (e) {
                ctx.response.body = {
                    code: 1,
                    msg: '查询失败' + e
                }
            }
        }
    },

    findcoupon:async (ctx,next) => {
        const {coupon_id} = ctx.request.body;
        await mysql.table('coupon_manage').where({coupon_id:coupon_id}).select().then(data=>{
            ctx.response.body = {
                code:1,
                msg:'查询成功',
                datas:data[0]
            }
        }).catch(err => {
            ctx.response.body={
                code:-1,
                msg:'查询失败'+err
            }
        })
    },



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