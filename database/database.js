const {Sequelize} = require("sequelize")
const connectar = new Sequelize("ecomerce_mercado","root","478432",{

     host:"localhost",
     dialect:"mysql"

})




module.exports = connectar