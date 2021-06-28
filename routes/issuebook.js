var express          = require('express');
var router           = express.Router();
const Sequelize      = require('sequelize');
const Op             = Sequelize.Op;
const categoryModel  = require('../models').Category
const bookModel      = require('../models').Book
const userModel      = require('../models').User
const issueBookModel = require('../models').IssueBook
const dayModel    = require('../models').DaySetting
const { redirectHome, redirectLogin } = require('../middleware/redirect')


/* カテゴリーとブックとユーザーをゲット*/

const getMultipleModel = async (req, res) => {
  try {
    const categories = await categoryModel.findAll({
      where: {
        status: {
          [Op.eq]:'1'
        }
      }
    })

    const date = await dayModel.findAll({
      where: {
        status: {
          [Op.eq]:'1'
        }
      }
    })

    const users = await userModel.findAll({
      where: {
        status: {
          [Op.eq]:'1'
        }
      }
    })

    res.render('admin/issue-a-book',{
      status: 1,
      success: true,
      message: '本を登録しましょう',
      categories,
      users,
      date,
      title: 'ブックの貸し出し | LMS'
    });
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

/** 本の発行  */

router.route('/admin/issue-book')
.get(redirectLogin,getMultipleModel)
.post(async (req, res) => {

  // 同じ人が同じ本を借りるのは避けたい
  //userを特定
  //bookを特定
  // is_returned 0であればまだ返送されていない故に借り続けていると判断

  let is_book_issued = await issueBookModel.count({
    where: {
      userId: {
        [Op.eq]: req.body.dd_user
      },
      bookId: {
        [Op.eq]: req.body.dd_book
      },
      is_returned: {
        [Op.eq]:'0'
      }
    }
  })

  if(is_book_issued > 0) {
    // 既に借りている場合
    req.flash('error','こちらの本はこちらのユーザーに貸し出されています')
    res.redirect('/admin/issue-book/')
  } else {

    // 条件に合うデータの「件数」を取得する場合
    // 本がまだ返却されていないことも数える必要があるので
    //合わせるとまだ返却されていないユーザーの全ての本を数えている
  let count_books = await issueBookModel.count({
    where: {
      userId: {
        [Op.eq]: req.body.dd_user
      },
      is_returned: {
        [Op.eq]:'0' // default valueでもある
      }
    }
  })


  if(count_books >= 2) {

    req.flash('error','貸し出し本数はお一人様2本までです')
    res.redirect('/admin/issue-book/')

  }else {
    issueBookModel.create({
      categoryId: req.body.dd_category,
      bookId: req.body.dd_book,
      userId:req.body.dd_user,
      days_issued:req.body.dd_days
    })
    .then(data => {
      if(data) {
        req.flash('success', 'イシューブックが作成されました')
      } else {
        req.flash('error', 'イシューブックが作成sされませんでした')
      }
      res.redirect('/admin/issue-book/')
    })
  }
  }
})


/** リスト */
/** jquery Ajax  TRY*/
/* 関連のあるデータだけを返す　*/
router.post('/admin/category-list-book', async (req, res, next) => {
  // let category_id = req.body.cat_id
  // console.log('cate', category_id)
  let books = await bookModel.findAll({
    where: {
      categoryId: {
        [Op.eq]: req.body.cat_id
      }
    }
  })
  return res.json({
    status: 1,
    books
  })
})

router.get('/admin/list-issue-book',redirectLogin, async (req, res, next) =>{
  // categoryの取得
  const value = await issueBookModel.findAll({
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
  attributes:['days_issued', 'issued_date'],
  where: {
    is_returned: {
      [Op.eq]:'0'
    }
  }
  })

  if(value) {
    // req.flash('success','データを取得しました')
    res.render('admin/issue-history', {
      success:true,
      message: 'データを取得しました',
      list:value,
      title: '貸し出しリスト | LMS'
    })
  } else {
    req.flash('error','データを取得できませんでした')
    res.redirect('/admin/issue-book/')
  }

  res.redirect('/admin/list-issue-book');
  //res.json(value)
});



module.exports = router

