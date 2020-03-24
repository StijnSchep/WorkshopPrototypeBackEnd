const express = require('express')
const router = express.Router()
const controller = require('../controllers/round.controller');
const auth = require('../controllers/authentication.controller')

router.post('/', auth.validateToken, controller.addRound);
router.post('/workshop', auth.validateToken, controller.addRoundWorkshop);
router.post('/workshop/group', auth.validateToken, controller.addRoundWorkshopGroup)

router.post('/registree', auth.validateToken, controller.getAllRoundsWorkshopsRegistree)

module.exports = router