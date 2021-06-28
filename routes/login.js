
var express = require('express');
var router  = express.Router();
const Sequelize     = require('sequelize')
const bcrypt = require('bcrypt')
const Op            = Sequelize.Op;
const adminModel = require('../models').Admin;
const { redirectHome, redirectLogin } = require('../middleware/redirect')



/* dashboard */

const get_login_message = (req,res, next) => {
  req.flash('info', 'ログインページです')
  next()
}

/** ログイン 表示 */
const getLogin = async (req, res) => {

  res.render('admin/login',{
    status: 1,
    success: true,
    message: 'ログインページです',
  });
}

/* ダミーデータ　作成 */
router.route('/admin/login')
.get(get_login_message)
.get(redirectHome, getLogin)
.post(async (req, res, next) => {
    try {
        // emailを調査
        const user = await adminModel.findOne({
            where:{
                email: {
                    [Op.eq]:req.body.email
                }
            }
        })

        if (user) {
            //passwordを比較する
            bcrypt.compare(req.body.password, user.password, function(error, result) {
                if (result) {
                    // user has data
                    req.session.isLoggedIn = true;
                    req.session.userId = user.id;
                    console.log('session', req.session)
                    res.redirect('/admin')

                }else {
                    req.flash('error', 'パスワードは承認されませんでした')
                    res.redirect('/admin/login')
                }
            })
        }
        else {
            req.flash('error',　'アカウントが見つかりませんでした')
            res.redirect('/admin/login')
        }


    } catch(err) {
        res.status(500).json({
            status: 0,
            success: false,
            message: 'アカウントは作成されませんでした'
        })
    }

})

router.get('/admin/register', (req, res) => {
    adminModel.create({
        name: 'lms admin',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('123456', 10)
    })
    .then(data => {
        if (data) {
            res.status(200).json({
                success: true,
                status:1,
                message: 'adminが作成されました'
            })
        } else {
            res.status(500).json({
                success: false,
                status:0,
                message: 'adminが作成されませんでした'
            })
        }
    })
})

router.get('/admin/logout', redirectLogin, (req, res, next) => {
    req.session.destroy((error) => {

        if(error) {
            res.redirect('/admin')
        }
        console.log(req.session)
        res.redirect('/admin/login')
    })
})




module.exports = router;
