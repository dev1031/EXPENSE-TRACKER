const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title is required'
      },
      category: {
        type: String,
        trim: true,
        required: 'Category is required'
      },
      amount: {
          type: Number,
          min: 0,
          required: 'Amount is required'
      },
      incurred_on: {
        type: Date,
        default: Date.now
      },
      notes: {
        type: String,
        trim: true
      },
      updated: Date,
      created: {
        type: Date,
        default: Date.now
      },
      recorded_by: {
          type: mongoose.Schema.ObjectId, 
          ref: 'User'
    }
})

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;