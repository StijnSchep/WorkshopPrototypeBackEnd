//Routering with express
const express = require('express')
const router = express.Router()

//Controllers
const enrollController = require('../controllers/enroll.controller')
const auth = require('../controllers/authentication.controller')

router.get('/', auth.validateToken, enrollController.getAllEnrollments)
router.post('/',  auth.validateToken, enrollController.addEnrollment)
router.get('/enrolls', auth.validateToken, enrollController.getEnrollmentsByRoundWorkshopID)

module.exports = router
