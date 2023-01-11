const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    title: {type: String, required:[true, 'title is required']},
    category: {type: String, required: [true, 'category is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    status: {type: String, default: "Available"},
    content: {type: String, required: [true, 'content is required'], minLength: [10, 'the content should have at least 10 characters']}
},
{timestamps: true}

);
// collection name is items in the database
module.exports = mongoose.model('Item', gameSchema);