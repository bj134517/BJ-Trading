const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradingSchema = new Schema({
    initAuthorId: {type: Schema.Types.ObjectId, ref: 'User'},
    initItemId: {type: Schema.Types.ObjectId, ref: 'Item'},
    tradeAuthorId: {type: Schema.Types.ObjectId, ref: 'Item'},
    tradeItemId: {type: Schema.Types.ObjectId, ref: 'Item'}
});

module.exports = mongoose.model('trading', tradingSchema);