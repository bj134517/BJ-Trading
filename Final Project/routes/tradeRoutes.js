const express = require('express');
const controller = require('../controllers/tradeController');
const {isSignedIn, isAuthor} = require('../middlewares/auth');
const{validateId, validateStory, validateResult} = require('../middlewares/validator');

const router = express.Router();

// GET / trades: send all trades to the user

router.get('/', controller.index);

// GET /trades/new: send html form for creating a new trade
router.get('/new', isSignedIn, controller.new);

// POST /trades: create a new trade
router.post('/', isSignedIn, validateStory, validateResult, controller.create);

// GET /trades/:id: send details of trade identified by id
router.get('/:id', validateId, controller.show);

// Update watched item list
router.get('/:id/watch', validateId, isSignedIn, controller.watch);

// Unwatch the item
router.get('/:id/unwatch', validateId, isSignedIn, controller.unwatch);

// Initiate a trade
router.get('/:id/trade', validateId, isSignedIn, controller.trade)

// Make a trade
router.get('/:id/makeTrade', validateId, isSignedIn, controller.makeTrade);

// Accept the trade
router.get('/:id/accept', validateId, isSignedIn, isAuthor, controller.accept);

// Reject the trade
router.get('/:id/reject', validateId, isSignedIn, isAuthor, controller.reject);

// Cancel the trade
router.get('/:id/cancel', validateId, isSignedIn, isAuthor, controller.cancel);

// GET /trades/:id/edit: send html form for editing an existing trade
router.get('/:id/edit', validateId, isSignedIn, isAuthor, validateStory, controller.edit);

// PUT /trades/:id: update the trade identified by id
router.put('/:id', validateId, isSignedIn, isAuthor, validateStory, controller.update);

// DELETE /trades/:id: delete the trade identified by id
router.delete('/:id', validateId, isSignedIn, isAuthor, controller.delete);

module.exports = router;