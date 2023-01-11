const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchSchema = new Schema({
    itemId: {type: Schema.Types.ObjectId, ref: 'Item'},
    itemTitle: {type: String, required:[true, 'title is required']},
    authorId: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Watch', watchSchema);