const trade = require('../models/trade');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are signed in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isSignedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to sign in first');
        return res.redirect('/users/signin');
    }
};

//check if use is author of the item
exports.isAuthor = (req, res, next) => {
    let id = req.params.id;
    trade.findById(id)
    .then(item=>{
        if (item) {
            if (item.author == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};