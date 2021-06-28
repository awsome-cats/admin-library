var express         = require('express');
var router          = express.Router();
const Sequelize     = require('sequelize');
const categoryModel = require('../models').Category
const Op            = Sequelize.Op;
const { redirectHome, redirectLogin } = require('../middleware/redirect')

/* カテゴリーを追加する */
const addCategory = async (req, res, next) => {
  try {
    const value = await categoryModel.findOne({
      where: {
        name: {
          [Op.eq]:req.body.name
        }
      }
    })
    if(value) {

      req.flash('error','既に同じカテゴリーが存在します');
      res.redirect('/admin/add-category')

    } else {

      const category = await categoryModel.create({
        name: req.body.name,
        status: req.body.status
      })

      if(category) {
        req.flash('success','カテゴリーを追加しました');
        res.redirect('/admin/add-category')
      } else {
        req.flash('error','カテゴリーの追加ができませんでした');
        res.redirect('/admin/add-category')
      }
    }
  }catch(e) {
    req.flash('error','something wrong');
    res.redirect('/admin/add-category')
  }
}

router.route('/admin/add-category')
.get(redirectLogin,(req, res) => {
  req.flash('info', 'カテゴリーを追加します')
  res.render('admin/add-category', {
    title: 'カテゴリー追加 | LMS'
  })
})
.post(addCategory)


//////////////////////////////////


/* カテゴリーリストに表示する */

const getFlashCateList = (req,res, next) => {
  req.flash('info', 'カテゴリーリストから編集や削除ができます')
  next()
}


/* カテゴリーページ表示 */
const listCategory = async (req, res) => {
  try {

    const value = await categoryModel.findAll()

    if(value) {

      res.render('admin/list-category',{
        status: 1,
        success: true,
        message: 'カテゴリーリストから編集や削除ができます',
        categories:value,
        title: 'カテゴリーのリスト | LMS'
      });
    }else {
      res.render('admin/add-category')
    }

  }catch(err) {
    res.status(500).json({
      status: 0,
      success: false,
      message: 'データを取得できませんでした',
      error: err
  })
  }
}
router.route('/admin/list-category')
.get(getFlashCateList).get(redirectLogin,listCategory);


//////////////////////////////////



/* カテゴリー編集 */
const getCategoryOne = async(req, res) => {
  try {
    console.log(req.body)
    const value = await categoryModel.findOne({
      where: {
        id: {
          [Op.eq]: req.params.categoryId
        }
      }
    })

    res.render('admin/edit-category', {
      title: 'カテゴリーの編集 | LMS',
      category: value // categoryとしてデータを返すことで編集する際のidはcategory.idとなることに気をつけて
    })
  }catch(e) {
    res.status(500).json({
      status: 0,
      success: false,
      message: '時間がたってから試してください'
  })
  }
}

/** AND条件 */
/** ne: 「以外」のデータを取得する NOT EQUAL*/
/** Category_name = update_name AND category_id != categoryId */
const updateCategory = async(req, res) => {

  try{
   const value = await categoryModel.findOne({
      where: {
        [Op.and]:[
          {
            id: {
              [Op.ne]: req.params.categoryId
            }
          },
          {
            name: {
              [Op.eq]: req.body.name
            }
          },
        ]
      }
    })

      if(value) {
        // 既に存在するか
        req.flash('error', 'データが存在します')
      }else {
        console.log(value)
        // 存在しない
        const updateValue = await categoryModel.update({
          name: req.body.name,
          status: req.body.status
        },
        {
          where: {
            id: req.params.categoryId
          }
        })

          if (updateValue) {
            req.flash('success', 'カテゴリーが更新されました')
          }else {
            req.flash('error', 'カテゴリーの更新ができませんでした')
          }

          res.redirect('/admin/edit-category/' + req.params.categoryId)
      }

  } catch(e) {
    res.status(500).json({
      status: 0,
      success: false,
      message: 'カテゴリーの更新ができませんでした',
      error:e
  })
  }
}

router.route('/admin/edit-category/:categoryId')
.get(redirectLogin,getCategoryOne )
.post(redirectLogin,updateCategory)


////////////////////////

/* カテゴリー削除 */

const deleteCategoryOne = async (req, res) => {
  console.log(req.body)
  try {
    const value = await categoryModel.findOne({
      where: {
        id: {
          [Op.eq]: req.body.category_id // nameバリューと同じにする
        }
      }
    })

    if(value) {
      const result = await categoryModel.destroy({
        where: {
          id: {
            [Op.eq]: req.body.category_id // paramsジャなくてbody
          }
        }
      })

      if(result) {
        req.flash('success', `${req.body.name}は削除されました`)
      }else {
        req.flash('error', '削除されませんでした')
      }
      res.redirect('/admin/list-category')
    }else {
      req.flash('error', '削除されませんでした')
    }
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'エラーです'
      })
  }
}

router.post('/admin/delete-category', deleteCategoryOne)



module.exports = router;
