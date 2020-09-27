const express = require("express");
const router = express.Router();
const Expense = require('./../model/expense.model');
const mongoose = require("mongoose");
const extend  = require('lodash/extend');

router.post('/api/expenses/',async (req, res)=>{
    try {
        req.body.recorded_by = req.userId
        const expense = new Expense(req.body)
        await expense.save()
        return res.status(200).json({
          message: "Expense recorded!"
        })
      } catch (err) {
        return res.status(400).json({
          error: err
        })
      }
}) 

router.get('/api/expenses/current/preview',async (req, res)=>{
  const date = new Date(), y = date.getFullYear(), m = date.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)

  const today = new Date()
  today.setUTCHours(0,0,0,0)
  
  const tomorrow = new Date()
  tomorrow.setUTCHours(0,0,0,0)
  tomorrow.setDate(tomorrow.getDate()+1)
  
  const yesterday = new Date()
  yesterday.setUTCHours(0,0,0,0)
  yesterday.setDate(yesterday.getDate()-1)
  
  try {
    let currentPreview = await Expense.aggregate([
      {
          $facet: { month: [
                              { $match : { incurred_on : { $gte : firstDay, $lt: lastDay }, recorded_by: mongoose.Types.ObjectId(req.userId)}},
                              { $group : { _id : "currentMonth" , totalSpent:  {$sum: "$amount"} } },
                            ],
                    today: [
                      { $match : { incurred_on : { $gte : today, $lt: tomorrow }, recorded_by: mongoose.Types.ObjectId(req.userId) }},
                      { $group : { _id : "today" , totalSpent:  {$sum: "$amount"} } },
                    ],
                    yesterday: [
                      { $match : { incurred_on : { $gte : yesterday, $lt: today }, recorded_by: mongoose.Types.ObjectId(req.userId) }},
                      { $group : { _id : "yesterday" , totalSpent:  {$sum: "$amount"} } },
                    ]
                  }
      }])
    let expensePreview = {month: currentPreview[0].month[0], today: currentPreview[0].today[0], yesterday: currentPreview[0].yesterday[0] }
    res.json(expensePreview)
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})

router.get('/api/expenses/by/category', async (req,res)=>{
  const date = new Date(), y = date.getFullYear(), m = date.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)

  try {
    let categoryMonthlyAvg = await Expense.aggregate([
      {
        $facet: {
            average: [
              { $match : { recorded_by: mongoose.Types.ObjectId(req.userId) }},
              { $group : { _id : {category: "$category", month: {$month: "$incurred_on"}}, totalSpent:  {$sum: "$amount"} } },
              { $group: { _id: "$_id.category", avgSpent: { $avg: "$totalSpent"}}},
              {
                  $project: {
                    _id: "$_id", value: {average: "$avgSpent"},
                  }
              }
            ],
            total: [
              { $match : { incurred_on : { $gte : firstDay, $lte: lastDay }, recorded_by: mongoose.Types.ObjectId(req.userId) }},
              { $group : { _id : "$category", totalSpent:  {$sum: "$amount"} } },
              {
                $project: {
                  _id: "$_id", value: {total: "$totalSpent"},
                }
              }
            ]
        }
      },
      {
        $project: {
          overview: { $setUnion:['$average','$total'] },
        }
      },
      {$unwind: '$overview'},
      {$replaceRoot: { newRoot: "$overview" }},
      { $group: { _id: "$_id", mergedValues: { $mergeObjects: "$value" } } }
    ]).exec()
    res.json(categoryMonthlyAvg)
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})

router.get('/api/expenses/plot' , async (req, res)=>{
  const date = new Date(req.query.month), y = date.getFullYear(), m = date.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)

  try {
    let totalMonthly = await Expense.aggregate(  [
      { $match: { incurred_on: { $gte : firstDay, $lt: lastDay }, recorded_by: mongoose.Types.ObjectId(req.userId) }},
      { $project: {x: {$dayOfMonth: '$incurred_on'}, y: '$amount'}}
    ]).exec()
    res.json(totalMonthly)
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})

router.get('/api/expenses/category/averages' , async (req, res)=>{
  const firstDay = new Date(req.query.firstDay)
  const lastDay = new Date(req.query.lastDay)

  try {
    let categoryMonthlyAvg = await Expense.aggregate([
      { $match : { incurred_on : { $gte : firstDay, $lte: lastDay }, recorded_by: mongoose.Types.ObjectId(req.userId)}},
      { $group : { _id : {category: "$category"}, totalSpent:  {$sum: "$amount"} } },
      { $group: { _id: "$_id.category", avgSpent: { $avg: "$totalSpent"}}},
      { $project: {x: '$_id', y: '$avgSpent'}}
    ]).exec()
    res.json({monthAVG:categoryMonthlyAvg})
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})


router.get('/api/expenses/yearly',async (req, res)=>{
  const y = req.query.year
  const firstDay = new Date(y, 0, 1)
  const lastDay = new Date(y, 12, 0)
  try {
    let totalMonthly = await Expense.aggregate(  [
      { $match: { incurred_on: { $gte : firstDay, $lt: lastDay }, recorded_by: mongoose.Types.ObjectId(req.userId) }},
      { $group: { _id: {$month: "$incurred_on"}, totalSpent:  {$sum: "$amount"} } },
      { $project: {x: '$_id', y: '$totalSpent'}}
    ]).exec()
    res.json({monthTot:totalMonthly})
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})

router.get('/api/expenses', async (req, res)=>{
  let firstDay = req.query.firstDay
  let lastDay = req.query.lastDay
  try {
    let expenses = await Expense.find({'$and':[{'incurred_on':{'$gte': firstDay, '$lte':lastDay}}, {'recorded_by': req.userId}]}).sort('incurred_on').populate('recorded_by', '_id name')
    res.json(expenses)
  } catch (err){
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
})

router.put('/api/expenses/:expenseId' , async (req, res)=>{
  try {
    let expense = req.expense
    expense = extend(expense, req.body)
    expense.updated = Date.now()
    await expense.save()
    res.json(expense)
  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
})

router.delete('/api/expenses/:expenseId', async (req, res)=>{
  try {
    let expense = req.expense
    let deletedExpense = await expense.remove()
    res.json(deletedExpense)
  } catch (err) {
    return res.status(400).json({
      error: err
    })
  }
})

const expenseByID = async (req, res, next, id) => {
    try {
      let expense = await Expense.findById(id).populate('recorded_by', '_id name').exec()
      if (!expense)
        return res.status('400').json({
          error: "Expense record not found"
        })
      req.expense = expense
      next()
    } catch (err){
      return res.status(400).json({
        error: err
      })
    }
}
  
router.param('expenseId',expenseByID)

module.exports = router;