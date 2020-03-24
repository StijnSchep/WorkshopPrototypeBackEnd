const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')

chai.should()
chai.use(chaiHttp)

const getAllWorkShopEndPoint = '/api/workshops'

describe('WorkShop API Test', () => {
    it('should get all workshops', done => {
        chai
            .request(server)
            .get(getAllWorkShopEndPoint)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                done()
            })
    })







})