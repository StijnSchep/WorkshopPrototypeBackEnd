const express = require('express')
const router = express.Router()
const organisationController = require('../controllers/organisation.controller')
const auth = require('../controllers/authentication.controller')

router.get('/', organisationController.getAllOrganisations)
router.post('/',  auth.validateToken, organisationController.addOrganisation)
router.put('/:organisationId', auth.validateToken, organisationController.updateOrganisation)
router.get('/registrees/:organisationId', auth.validateToken, organisationController.getGroupsAndRegistreesByOrganisation)
router.get('/single/:organisationId', auth.validateToken, organisationController.getOrganisationById)
router.delete('/:organisationId', auth.validateToken, organisationController.deleteOrganisation)

module.exports = router