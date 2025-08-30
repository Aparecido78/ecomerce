const {Sequelize} = require("sequelize")
const connectar = require("../database/database")
const Vendedor = connectar.define("Vendedor",{
    nome:{
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    senha:{
        type: Sequelize.STRING,
        allowNull: false
    },
    foto:{
        type: Sequelize.STRING
    },
   



})

Vendedor.sync({alter:true})


module.exports = Vendedor


