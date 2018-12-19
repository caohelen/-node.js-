const Mysql = require('node-mysql-promise');
const mysql = Mysql.createConnection({
    host: '10.144.138.54',
    // host: 'localhost',
    user: 'root',
    password: 'oracle',//服务器密码
    // password: 'chl',//本地密码
    port: '3306',
    database: 'cAuth',
    dateStrings: true
});
const https = require('https');
const WXBizDataCrypt = require('../middleware/WXBizDataCrypt');
module.exports = {
    login: async (ctx, next) => {
        const { avatarUrl, nickName, gender, proVince, city, code, iv, encryptedData } = ctx.request.body

        if (code) {
            try {
                let grant_type = 'authorization_code'
                let appId = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                // console.log(userinfo)
                const { openid, session_key } = userinfo

                const sessionkey = session_key;

                const pc = new WXBizDataCrypt(appId, sessionkey)

                const da = pc.decryptData(encryptedData , iv)

                console.log('解密后 data: ', da)

                // console.log('111')
                let userdata = await mysql.table('user').where({ open_id: openid }).select();

                // console.log('222')
                // console.log('userdata1111:', userdata)
                if (!userdata || userdata.length === 0) {
                    console.log(da)
                    let datas = {
                        open_id: openid,
                        session_key: session_key,
                        gender: gender,
                        proVince: proVince,
                        nickName: nickName,
                        avatarUrl: avatarUrl,
                        city: city,
                        phone:da.phoneNumber
                    }
                    // console.log('userdata2222:', userdata)
                    // console.log('datas:', datas)

                    await mysql.table('user').add(datas).then(function (data) {
                        //如果插入成功，返回插入的id
                        console.log('登入成功')
                        ctx.response.body = {
                            state_code: '1',
                            msg: '登入成功',
                        }
                    }).catch(function (err) {
                        //插入失败，err为具体的错误信息
                        console.log(err)
                        ctx.response.body = {
                            code: '-1',
                            mes: '登入失败：' + err
                        }
                    })
                } else {
                    // console.log('222222222222222222222222')
                    ctx.response.body = {
                        state_code: '1',
                        msg: '登入成功',
                    }
                }
            } catch (e) {
                console.log(e);

            }
        } else {

        }
    },
    getphone: async (ctx, next) => {

    },

    selectlogin: async (ctx,next) => {
        const {code} = ctx.request.body
        if (code) {
            try {
                let grant_type = 'authorization_code'
                let appId = "wx2b4b61fd602aaaa0"
                let secret = "0f4b566d652dd9e624e57139bd38863d"

                let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=' + grant_type
                const userinfo = await getJSON(url)
                const { openid, session_key } = userinfo

                let userdata = await mysql.table('user').where({ open_id: openid }).select();


                if (!userdata || userdata.length === 0) {
                    ctx.response.body = {
                        state_code:'0',
                        msg:'尚未登入，请先登入',
                    }

                } else {
                    ctx.response.body = {
                        state_code: '1',
                        msg: '登入成功',
                    }
                }
            } catch (e) {
                console.log(e);

            }
        } else {

        }
    },
};

function getJSON(url) {
    return new Promise((reslove, reject) => {
        https.get(url, res => {
            let urlData = ''
            res.on('data', data => {
                urlData += data
            })
            res.on('end', data => {
                const userinfo = JSON.parse(urlData)
                if (userinfo.openid) {
                    reslove(userinfo)
                }
                reject(userinfo)
            })
        })
    })
}