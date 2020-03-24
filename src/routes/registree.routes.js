const express = require('express')
const router = express.Router()
const registreeController = require('../controllers/registree.controller')
const auth = require('../controllers/authentication.controller')

router.post('/', auth.validateToken, registreeController.addRegistree)
router.put('/:registreeId', auth.validateToken, registreeController.updateRegistree)
router.get('/notEnrolled', auth.validateToken, registreeController.getNotEnrolled)

module.exports = router