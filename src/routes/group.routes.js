const express = require('express')
const router = express.Router()
const groupController = require('../controllers/group.controller')
const auth = require('../controllers/authentication.controller')

router.post('/', auth.validateToken, groupController.addGroup)


module.exports = router