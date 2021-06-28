var express = require('express');
var router  = express.Router();
const Sequelize     = require('sequelize')
const Op            = Sequelize.Op;
const categoryModel  = require('../models').Category
const bookModel      = require('../models').Book
const userModel      = require('../models').User
const { redirectHome, redirectLogin } = require('../middleware/redirect')

/* dashboard */

const get_flash_message_dashboard = (req,res, next) => {
  req.flash('info', 'ダッシュボードページです')
  next()
}

const getDashboard = async (req, res) => {
  const total_categories = await categoryModel.count()
  const total_users = await userModel.count()
  const total_books = await bookModel.count()
  res.render('admin/dashboard',{
    status: 1,
    success: true,
    message: 'Admin ページ',
    users:total_users,
    categories:total_categories,
    books:total_books,
    title: 'ダッシュボード | LMS'
  });
}

router.route('/admin')
.get(get_flash_message_dashboard)
.get(redirectLogin,getDashboard)




module.exports = router;
