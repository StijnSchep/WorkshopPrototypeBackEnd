const express = require('express')
const router = express.Router()
const registrationController = require('../controllers/registration.controller')
const auth = require('../controllers/authentication.controller')

router.get('/', auth.validateToken, registrationController.getAllRegistrations)
router.post('/', auth.validateToken, registrationController.addRegistration)
router.delete('/:registrationId', auth.validateToken, registrationController.deleteRegistration)

//Voor contact login pagina
router.get('/workhops', auth.validateToken, registrationController.getRoundsWorkshops)
router.get('/info', auth.validateToken, registrationController.getInfo)

module.exports = router