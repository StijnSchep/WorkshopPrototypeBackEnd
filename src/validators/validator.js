const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')

module.exports = {

    validateRegistration: (registration, callback) => {

        const dateValidator = new RegExp('([0][1-9]|[1][0-2])-([0-2][0-9]|[3][0-1])-[0-9]{4}')

        //check openingdate is a valid date
        if(typeof registration.OpeningDate !== 'string' || !dateValidator.test(registration.OpeningDate)){
            const errorObject = {
                message: 'Opening date missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }

         //check EndDate is a valid date
         if(typeof registration.EndDate !== 'string' || !dateValidator.test(registration.EndDate)){
            const errorObject = {
                message: 'End date missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }
        
         //check workshop date is a valid date
         if(typeof registration.WorkshopDate !== 'string' || !dateValidator.test(registration.WorkshopDate)){
            const errorObject = {
                message: 'Workshop date missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }

        const openDate = new Date(registration.OpeningDate)
        const endDate = new Date(registration.EndDate)
        const workshopDate = new Date(registration.workshopDate)
        const today = new Date()

        if(openDate < today){
            const errorObject = {
                message: 'OpeningDate should be today or after today',
                code: 400
            }
            callback(errorObject)
            return;
        }

        if(endDate < openDate){
            const errorObject = {
                message: 'EndDate should be after OpeningDate',
                code: 400
            }
            callback(errorObject)
            return;
        }

        if(workshopDate < endDate) {
            const errorObject = {
                message: 'WorkshopDate should be after EndDate',
                code: 400
            }
            callback(errorObject)
            return;
        }

        if(registration.ContactCode !== 'string'){
            const errorObject = {
                message: 'ContactCode should be a string',
                code: 400
            }
            callback(errorObject)
            return;
        }
        if(registration.RegistreeCode !== 'string'){
            const errorObject = {
                message: 'Registree should be a string',
                code: 400
            }
            callback(errorObject)
            return;
        }

        //check if organisationID exist

    },

    validateRegistree: (registree, callback) => {

        //Firstname

        const nameValidator = new RegExp("([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$")
        if (typeof registree.FirstName !== 'string' || !nameValidator.test(registree.FirstName)) {
            const errorObject = {
                message: 'First name missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }

        //Lastname

        if (typeof registree.FirstName !== 'string' || !nameValidator.test(registree.FirstName)) {
            const errorObject = {
                message: 'Last name missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }

        //Email
        const emailValidator = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
        if (typeof registree.EmailAddress !== 'string' || !emailValidator.test(registree.EmailAddress)) {
            const errorObject = {
                message: 'Email Address missing or invalid',
                code: 400
            }
            callback(errorObject)
            return;
        }
        callback(null)
        return;

        //GroupId

        //query maken voor check if exists



    }

}