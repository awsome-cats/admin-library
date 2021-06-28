var express         = require('express');
var router          = express.Router();
const categoryModel = require('../models').Category
const bookModel     = require('../models').Book
const optionModel     = require('../models').Option
const Sequelize     = require('sequelize')
const Op            = Sequelize.Op;
const { redirectHome, redirectLogin } = require('../middleware/redirect')



/* Book ブックの追加にカテゴリーを表示する*/

const getFlashMessage = (req,res, next) => {
  req.flash('info', 'ブックを追加しましょう')
  next()
}

const get_all_category_and_currency = async (req, res) => {

  try {
    const categories = await categoryModel.findAll({
      where: {
        status: {
          [Op.eq]: '1'
        }
       }
    })

    const currency_data = await optionModel.findOne({
      where: {
        option_name: {
          [Op.eq]: 'active_currency'
        }
       }
    })

    res.render('admin/add-book',{
      status: 1,
      success: true,
      // message:'ブックを追加します',
      categories: categories,
      currency_data: currency_data,
      title: 'ブックの追加 | LMS'
    });
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした',
          error:err
      })
  }
}

const addBook = async(req, res) => {

  try {

    if(!req.files) {

      req.flash('error', '画像ファイルをアップロードしてください')

    }else {

      let image_attr = req.files.cover_image

      let valid_image_extensions = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

        if(valid_image_extensions.includes(image_attr.mimetype)) {

          await image_attr.mv("./public/uploads/" + image_attr.name, function(err) {
            if(err) {
              return res.status(500).json({
                err: err,
                message:'ファイルのアップができませんでした'
              })
            }
          })

          await bookModel.create({
            name: req.body.name,
            categoryId: req.body.dd_category,
            description: req.body.description,
            amount: req.body.amount,
            cover_image: "/uploads/" + image_attr.name, // img src="/uploads/---.jpg etc"
            author: req.body.author,
            status: req.body.status
          })
          .then(data => {
            if(data) {
              req.flash('success', 'ブックを作成しました')
            }else {
              req.flash('error', 'ブックを作成できませんでした')
            }

            res.redirect('/admin/add-book',{
              title: 'ブックの追加 | LMS'
            })
          })

        }else {
          req.flash('error', '有効なファイルを選択して下さい')
          res.redirect('/admin/add-book')
        }
    }

  }catch(err) {
    res.status(500).json({
      status: 0,
      success: false,
      message: 'ブックを作成できませんでした',
      error:err
  })
  }


}

router.route('/admin/add-book').get(getFlashMessage).get(redirectLogin,get_all_category_and_currency)
.post(addBook)



/////////////////////////////////
/** book list 表示 */

const getFlashMessageList = (req,res, next) => {
  req.flash('info', 'ブックリストでは編集や削除ができます')
  next()

}

const getAllBookList = async (req, res) => {
  try {
      const book_and_category = await bookModel.findAll({
        include: {
          model: categoryModel,
          attributes: ['name']
        }
      })

      const currency_data = await optionModel.findOne({
        where: {
          option_name: {
            [Op.eq]: 'active_currency'
          }
         }
      })

      res.render('admin/list-book',{
        status: 1,
        success: true,
        message: 'ブックリストでは編集や削除ができます',
        books: book_and_category,
        currency_data:currency_data,
        title: 'ブックのリスト | LMS'
      });

  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

router.route('/admin/list-book')
.get(getFlashMessageList)
.get(redirectLogin,getAllBookList);


/** book edit 編集 */

const getBookOne = async (req,res, next) => {

  try {
    let book = await bookModel.findOne({
      where: {
        id:{
          [Op.eq]: req.params.bookId
        }
      }})

      const categories = await categoryModel.findAll({
        where: {
          status: {
            [Op.eq]: '1'
          }
         }
      })

      const currency_data = await optionModel.findOne({
        where: {
          option_name: {
            [Op.eq]: 'active_currency'
          }
         }
      })

      res.render('admin/edit-book', {
        status: 1,
        success: true,
        message: 'タイトルや画像の編集をしましょう',
        book:book,
        categories:categories,
        currency_data:currency_data,
        title: 'ブックの編集 | LMS'
      })

  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: ''
      })
  }
}

const editBookOne = async (req, res) => {
  try {

      if(!req.files) {
        // not going to update cover_image
        await bookModel.update({
          name: req.body.name,
          categoryId: req.body.dd_category,
          description: req.body.description,
          amount: req.body.amount,
          author: req.body.author,
          status: req.body.status
        }, {
          where: {
            id: {
              [Op.eq]: req.params.bookId
            }
          }
        })
        .then(value => {
          if(value) {
            req.flash('success', 'ブックが更新されました')
          }else {
            req.flash('error', 'ブックの更新ができませんでした')
          }

          res.redirect('/admin/edit-book/' + req.params.bookId)

        })
      }else {

        let image_attr = req.files.cover_image

        let valid_image_extensions = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

        if(valid_image_extensions.includes(image_attr.mimetype)) {

          image_attr.mv("./public/uploads/" + image_attr.name, function(err) {
            if(err) {
              return res.status(500).json({
                err: err,
                message:'ファイルのアップができませんでした'
              })
            }
          })

          bookModel.update({
            name: req.body.name,
            categoryId: req.body.dd_category,
            description: req.body.description,
            amount: req.body.amount,
            cover_image: "/uploads/" + image_attr.name, // img src="/uploads/---.jpg etc"
            author: req.body.author,
            status: req.body.status
          }, {
            where: {
              id: {
                [Op.eq]: req.params.bookId
              }
            }
          })
          .then(data => {
            if(data) {
              req.flash('success', 'ブックを更新しました')
            }else {
              req.flash('error', 'ブックを更新できませんでした')
            }

            res.redirect('/admin/edit-book/' + req.params.bookId)
          })

        }else {
          req.flash('error', '有効なファイルを選択して下さい')
          res.redirect('/admin/edit-book/' + req.params.bookId)
        }
      }
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: ''
      })
  }
}

router.route('/admin/edit-book/:bookId')
.get(redirectLogin,getBookOne)
.post(editBookOne)

/** book delete 削除 */

const deleteBook = async (req, res) => {
  try {

      const value = await bookModel.findOne({
        where: {
          id: {
            [Op.eq]: req.body.book_id
          }
        }
      })

      if(value) {
        const result = await bookModel.destroy({
          where: {
            id: {
              [Op.eq]: req.body.book_id
            }
          }
        })

        if(result) {
          req.flash('success', `${req.body.name}は削除されました`)
          res.redirect('/admin/list-book')
        } else {
          req.flash('error', `${req.body.name}削除されませんでした`)
          res.redirect('/admin/list-book')
        }

        res.redirect('/admin/list-book')
      }else {
        req.flash('error', `${req.body.name}削除されませんでした`)
        res.redirect('/admin/list-book')
      }

      res.redirect('/admin/edit-book' + req.prams.book_id)
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: ''
      })
  }
}

router.post('/admin/delete-book/:bookId', deleteBook)






module.exports = router
