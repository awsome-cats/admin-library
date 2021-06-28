var express              = require('express');
var router               = express.Router();
const Sequelize          = require('sequelize');
const Op                 = Sequelize.Op;
const optionModel        = require('../models').Option
const dayModel    = require('../models').DaySetting
const { redirectHome, redirectLogin } = require('../middleware/redirect')


const getCurrencyFlashMessage = (req, res, next) => {
  req.flash('info', '通貨を設定しましょう')
  next()
}


/** currency setting */

const getCurrency = async (req, res) => {

  try {
    const currency_data = await optionModel.findOne({
      where: {
        option_name: {
          [Op.eq]: 'active_currency'
        }
       }
    })
    res.render('admin/currency-setting',{
      status: 1,
      success: true,
      message: '通貨を設定しましょう',
      currency_data: currency_data,
      title: '通貨の設定 | LMS'
    });
  }catch(err) {
      res.status(500).json({
          status: 0,
          success: false,
          message: 'データを取得できませんでした'
      })
  }
}

const addCurrency = async(req, res) => {
  try {

    const value = await optionModel.findOne({
      where: {
        option_name: {
          [Op.eq]: 'active_currency'
        }
      }
    })

    if(value) {
      optionModel.update({
        option_value: req.body.dd_currency
      },{
        where: {
          option_name: {
            [Op.eq]: 'active_currency'
          }
        }
      })
      .then(data => {
        if(data) {
          req.flash('success', '設定は更新されました')
        }else {
          req.flash('error', '設定は更新されませんでした')
        }

        res.redirect('/admin/currency-settings')
      })
    }else {
      const newValue = await optionModel.create({
        option_name: 'active_currency', // defaultで作成してしまう
        option_value: req.body.dd_currency
      })

      if(newValue) {
        req.flash('success', '設定は保存されました')
      }else {
        req.flash('error', '設定は保存されませんでした')
      }

      res.redirect('/admin/currency-settings')
    }


  }catch(err) {
    console.log(err)
  }
}


router.route('/admin/currency-settings')
.get(getCurrencyFlashMessage)
.get(redirectLogin,getCurrency)
.post(addCurrency);


/** days setting */

const get_day_flash_message = (req,res, next) => {
  req.flash('info', '日付を設定しましょう')
  next()
}

const getDaySettings = async (req,res, next) => {
  try{

    const daySettings = await dayModel.findAll()

    res.render('admin/day-setting',{
      status: 1,
      success: true,
      message: 'データを取得しました',
      daySettings,
      title: '日付の設定 | LMS'
    });

  }catch(err) {
    res.status(500).json({
      success:false,
      status:1,
      message: 'データを取得できませんでした'
    })
  }
}

const addDaySetting = async (req, res) => {
  try {
    const day_setting = await dayModel.findOne({
      where: {
        total_days: {
          [Op.eq]: req.body.day_count
        }
      }
    })

    if(day_setting) {

      req.flash('error', `${req.body.day_count}日は既に追加されている設定です`)
      res.redirect('/admin/days-settings')

    }else {
      const status = await dayModel.create({
        total_days: req.body.day_count
      })

      if(status) {
        req.flash('success', `${req.body.day_count}日の設定が追加されました`)
      }else {
        req.flash('error', '設定は追加されませんでした')
      }
      res.redirect('/admin/days-settings')
    }
  }catch(err) {
      res.status(500).json({
        status: 0,
        success: false,
        message: 'データを追加できませんでした'
      })
  }
}

router.route('/admin/days-settings')
.get(get_day_flash_message)
.get(redirectLogin,getDaySettings)
.post(addDaySetting)

/** delete setting */

const deleteDaySetting = (req, res) => {

    dayModel.destroy({
      where: {
        id: {
          [Op.eq]: req.params.dayId
        }
      }
    })
    .then(status => {
      if(status) {
        req.flash('success', `${req.body.day_total_day}日設定は削除されました`)
      }else {
        req.flash('error', `${req.body.day_total_day}日の設定は削除されませんでした`)
      }
      res.redirect('/admin/days-settings')
    })





}

router.post('/admin/delete-day/:dayId', deleteDaySetting)



module.exports = router;
