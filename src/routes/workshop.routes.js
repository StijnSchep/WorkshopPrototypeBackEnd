const express = require('express')
const router = express.Router()
const workshopcontroller = require('../controllers/workshop.controller')
const auth = require('../controllers/authentication.controller')

router.get('/', auth.validateToken, workshopcontroller.getAllWorkshops)
router.post('/', auth.validateToken, workshopcontroller.addWorkshop)
router.put('/:workshopId', auth.validateToken, workshopcontroller.updateWorkshop)
router.delete('/:workshopId', auth.validateToken, workshopcontroller.deleteWorkshop)
router.get('/:workshopId', auth.validateToken, workshopcontroller.getWorkshopById)

module.exports = router