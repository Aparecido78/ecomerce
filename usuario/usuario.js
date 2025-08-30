const {Sequelize} = require("sequelize")
const connectar = require("../database/database")
const Usuario = connectar.define("Usuario",{
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
    dinheiro:{
        type: Sequelize.INTEGER,
        defaultValue: 20000
    }
})

Usuario.sync()


module.exports = Usuario



