var express          = require('express');
var router           = express.Router();
const Sequelize      = require('sequelize');
const Op             = Sequelize.Op;
const bookModel      = require('../models').Book
const userModel      = require('../models').User
const issueBookModel = require('../models').IssueBook
const categoryModel  = require('../models').Category
const { redirectHome, redirectLogin } = require('../middleware/redirect')



/** 返却本 作成 */

const getUserMessage = (req,res, next) => {

  req.flash('info', 'ユーザーとブックを登録しましょう')
  next()

}


const getCategories = async (req, res, next) =>{

  const users = await userModel.findAll({
    where: {
      status: {
        [Op.eq]: '1'
      }
    }
  })

  res.render('admin/return-a-book',{
    status: 1,
    success: true,
    message: 'データを取得しました',
    users,
    title: '返却 | LMS'
  });
};

// IssueBookを更新する
const updateIssueBook = async (req, res) => {
  try {
    const value = await issueBookModel.update(
      {
        is_returned: '1',
        returned_date: Sequelize.fn('NOW')
      },
      {
        where: {
          userId: {
            [Op.eq]: req.body.dd_user
          },
          bookId: {
            [Op.eq]: req.body.dd_book
          },
          is_returned: '0'
        }
    })

      if(value) {
        req.flash('success', 'データを更新しました')
      }else {
        req.flash('error', 'データを更新できませんでした')
      }

      res.redirect('/admin/return-a-book/')

  }catch(err) {
      res.status(500).json({
        status: 0,
        success: false,
        message: 'データを取得できませんでした'
    })
  }
}

router.route('/admin/return-a-book')
.get(redirectLogin,getUserMessage)
.get(redirectLogin,getCategories)
.post(updateIssueBook)


/** 返却本リスト　セレクトボックスの表示 */

/** AJAX */

router.post('/admin/user-list-book', async (req, res) => {
  let user_id = req.body.user_id
  const all_books = await issueBookModel.findAll({
    include: {
      model: bookModel,
      attributes:['name']
    },
    where: {
      userId: {
        [Op.eq]: user_id
      },
      is_returned:{
        [Op.eq]: '0'
      }
    },
    attributes:['bookId']
  })

  res.status(200).json({
    success:true,
    status:1,
    books: all_books
  })
})


/** 返却本リスト　表示 */

const getListMessage = (req,res, next) => {

  req.flash('info', '返却された本のリストです')
  next()

}

const getReturnBook = async (req, res, next) =>{

  const returnList = await issueBookModel.findAll({
    include: [
      {
        model: categoryModel,
        attributes:['name']
      },
      {
        model: userModel,
        attributes:['name', 'email']
      },
      {
        model: bookModel,
        attributes:['name', 'cover_image']
      }
  ],
  attributes:['days_issued', 'returned_date'],
  where: {
    is_returned: {
      [Op.eq]:'1'
    }
  }
  })
    res.render('admin/return-list',{
      status: 1,
      success: true,
      message: 'データを取得しました',
      list: returnList,
      title: '返却リスト | LMS'
    });
  };

router.route('/admin/return-list-book')
.get(getListMessage)
.get(redirectLogin,getReturnBook)

module.exports = router

