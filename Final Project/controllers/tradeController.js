const model = require('../models/trade');
const watch = require('../models/watch');
const User = require('../models/user');
const Trading = require('../models/trading');

exports.index = (req, res, next) => {
    model.find()
    .then(trades => {
        var result = [];
        trades.forEach(function (hash) {
            return function (a) {
                if (!hash[a.category]) {
                    hash[a.category] = { category: a.category, records: []};
                    result.push(hash[a.category]);
                }
                hash[a.category].records.push({ id: a.id, title: a.title, content: a.content });
            };
        }(Object.create(null)));
        res.render('./trade/index', {result});
    })
    .catch(err => next(err));
};

exports.new = (req,res)=>{
    res.render('./trade/new');
};

// POST /trades: create a new trade
exports.create = (req,res, next)=>{
    let trade = new model(req.body);

    trade.author = req.session.user;

    trade.save()
    .then(trade => res.redirect('/trades'))
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.statuc = 400;
        }
        next(err);
    });
};

exports.show = (req,res, next)=>{
    let id = req.params.id; 

    model.findById(id).populate('author', 'firstName lastName')
    .then(trade=> {
        watch.find({itemId: id, authorId: req.session.user})
        .then(result => {
            let watched = false;
            if (result.length) {
                watched = true;
            }
            if (trade) {
                return res.render('./trade/show', {trade, watched});
            } else {
                let err = new Error('Cannot find a item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err));  
    })
    .catch(err=>next(err));
};

exports.watch = (req, res, next) => {
    let watchList  = new watch(req.body);
    let itemId = req.params.id;
    let authorId = req.session.user;
    
    model.findById(itemId)
    .then(result => {
        watchList.authorId = authorId;
        watchList.itemId = itemId; 
        watchList.itemTitle = result.title;
        
        watchList.save()
        .then(item => res.redirect('/trades/'+itemId))
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.unwatch = (req, res, next) => {
    watch.findOneAndDelete({itemId: req.params.id, authorId: req.session.user})
    .then(item => {
        if (item) {
            res.redirect('/trades/' + req.params.id);
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
}

exports.trade = (req, res, next) => {
    let id = req.session.user;

    Promise.all([User.findById(id), model.find({author: id}), watch.find({authorId: id}), model.findOne({_id: req.params.id})])
    .then(results=>{
        const [user, trades, author, tradeItem] = results;
        let makeTrade = req.params.id;
        let curS = req.session;
        curS.tradeId = makeTrade;
        curS.authorId = tradeItem.author;
        res.render('./user/profile', {user, trades, author, makeTrade});
    })
    .catch(err=>next(err));
}

exports.makeTrade = (req, res, next) => {
    let initItemId = req.params.id;
    let initAuthorId = req.session.user;
    let tradeItemId = req.session.tradeId;
    let tradeAuthorId = req.session.authorId;

    let trading = new Trading();
    trading.initItemId = initItemId;
    trading.initAuthorId = initAuthorId;
    trading.tradeItemId = tradeItemId;
    trading.tradeAuthorId = tradeAuthorId;

    Promise.all([model.findByIdAndUpdate(tradeItemId, {status: "Awaiting"}), model.findByIdAndUpdate(initItemId, {status : "Pending"}), trading.save() ])
    .then(result => {
        res.redirect('/users/profile');
    })
    .catch(err=>next(err));
    
    // res.redirect('/users/profile');
}

exports.accept = (req, res, next) => {
    let id = req.params.id;

    Trading.findOne({tradeItemId: id})
    .then(result => {
        let initItemId = result.initItemId;
        let initAuthorId = result.initAuthorId;
        let tradeItemId = result.tradeItemId;
        let tradeAuthorId = result.tradeAuthorId;

        Promise.all([model.findByIdAndUpdate(initItemId, {author: tradeAuthorId, status: "Available"}), model.findByIdAndUpdate(tradeItemId, {author: initAuthorId, status: "Available"})])
        .then(result2 => {
            Trading.findOneAndDelete({initItemId: initItemId, initAuthorId: initAuthorId, tradeItemId: tradeItemId, tradeAuthorId: tradeAuthorId})
            .then(result3 => {
                res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err))
}

exports.reject = (req, res, next) => {
    let id = req.params.id;

    Trading.findOne({tradeItemId: id})
    .then(result => {

        let initItemId = result.initItemId;
        let initAuthorId = result.initAuthorId;
        let tradeItemId = result.tradeItemId;
        let tradeAuthorId = result.tradeAuthorId;

        Promise.all([model.findByIdAndUpdate(initItemId, {status: "Available"}), model.findByIdAndUpdate(tradeItemId, {status: "Available"})])
        .then(result2 => {
            Trading.findOneAndDelete({initItemId: initItemId, initAuthorId: initAuthorId, tradeItemId: tradeItemId, tradeAuthorId: tradeAuthorId})
            .then(result3 => {
                res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err))
}

exports.cancel = (req, res, next) => {
    let id = req.params.id;
    Trading.findOne({initItemId: id})
    .then(result => {
        let initItemId = result.initItemId;
        let initAuthorId = result.initAuthorId;
        let tradeItemId = result.tradeItemId;
        let tradeAuthorId = result.tradeAuthorId;
         
        Promise.all([model.findByIdAndUpdate(initItemId, {status: "Available"}), model.findByIdAndUpdate(tradeItemId, {status: "Available"})])
        .then(result2 => {
            Trading.findOneAndDelete({initItemId: initItemId, initAuthorId: initAuthorId, tradeItemId: tradeItemId, tradeAuthorId: tradeAuthorId})
            .then(result3 => {
                res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err))
}

exports.edit = (req,res, next)=>{
    let id = req.params.id;

    model.findById(id)
    .then(trade=> {
        if (trade) {
            return res.render('./trade/edit', {trade});
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req,res, next)=>{
    let trade  = req.body;
    let id  = req.params.id;

    model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
    .then(item=> {
        if (item) {
            res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if (err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err)
    });
};

exports.delete = (req,res, next)=>{
    let id = req.params.id;

    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(item => {
        if (item) {
            res.redirect('/trades');
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};