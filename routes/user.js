var express     = require('express');
var router      = express.Router();
const Sequelize = require('sequelize');
const Op        = Sequelize.Op;
const userModel = require('../models').User
const { redirectHome, redirectLogin } = require('../middleware/redirect')

/* ユーザーの追加 */

const getFlashUserMessage = (req,res, next) => {

  req.flash('info', 'ユーザーを登録しましょう')
  next()

}

const addUser = async (req, res) => {
  try {
    const value = await userModel.findOne({
      where: {
        email: {
          [Op.eq]: req.body.email
        }
      }
    })

    if(value) {

      req.flash('error', 'ユーザーは既に存在しています')
      res.redirect('/admin/add-user')

    }else {
       await userModel.create({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        gender: req.body.dd_gender,
        address: req.body.address,
        status: req.body.status
      })
      .then(data => {
        if(data) {
          req.flash('success', 'ユーザーが作成されました')
          res.redirect('/admin/add-user')
        }else {
          req.flash('error', 'ユーザーが作成されませんでした')
          res.redirect('/admin/add-user')
        }
      })
    }
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: ''
      })
  }
}

router.route('/admin/add-user')
.get(getFlashUserMessage)
.get(redirectLogin,(req, res, next) => {
  res.render('admin/add-user',{
    status: 1,
    success: true,
    message: 'ユーザーを追加します',
    title: 'ユーザーの追加 | LMS'
  });
}).post(addUser)


/** user list 表示 */

router.route('/admin/list-user').get(redirectLogin,async (req, res, next) => {

  const users = await userModel.findAll()
      res.render('admin/list-user',{
        status: 1,
        success: true,
        message: 'ユーザーリストでは編集や削除ができます',
        users: users,
        title: 'ユーザーのリスト | LMS'
      });
})

/** edit user */

const getUserOne = async (req, res) => {
  try {
    const value = await userModel.findOne({
      where: {
        id: {
          [Op.eq]: req.params.userId
        }
      }
    })
    res.render('admin/edit-user',{
      status: 1,
      success: true,
      message: 'ユーザーを編集できます',
      user: value,
      title: 'アカウントの編集 | LMS'
    })
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

const updateUser = async (req, res) => {
  try {
        const updateUser = await userModel.update({
          name: req.body.name,
          email: req.body.email,
          mobile:req.body.mobile,
          gender:req.body.dd_gender,
          address:req.body.address,
          status:req.body.status,
        }, {
          where: {
            id: req.params.userId
          }
        })

        if(updateUser){
          req.flash('success', 'ユーザーは更新されました')
        }else {
          req.flash('error', 'ユーザーは更新されませんでした')
        }

        res.redirect('/admin/edit-user/' + req.params.userId)

  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

router.route('/admin/edit-user/:userId')
.get(redirectLogin,getUserOne)
.post(updateUser)

/** delete user */

const deleteUser = async (req, res) => {
  try {
      const value = await userModel.findOne({
        where: {
          id: {
            [Op.eq]: req.body.user_id
          }
        }
      })

      if(value) {
        const result = await userModel.destroy({
          where: {
            id: {
              [Op.eq]: req.body.user_id
            }
          }
        })

        if(result) {
          req.flash('success', `${req.body.name}は削除されました`)
          res.redirect('/admin/list-user')
        } else {
          req.flash('error', `${req.body.name}は削除されませんでした`)
          res.redirect('/admin/list-user')
        }

        req.flash('success', `${req.body.name}は削除されました`)
      } else {
        req.flash('error', `${req.body.name}は削除されませんでした`)
          res.redirect('/admin/list-user')
      }
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

router.post('/admin/delete-user/:userId', deleteUser)


module.exports = router

