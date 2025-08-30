const {Sequelize}= require("sequelize")
const connectar = require("../database/database")
const Produtos = require("../produtos/tabela_produtos")
const Usuario = require("../usuario/usuario")
const Historico = connectar.define("Historico",{
    quantidade:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

Usuario.hasMany(Historico)
Historico.belongsTo(Usuario)


Produtos.hasMany(Historico)
Historico.belongsTo(Produtos)


Historico.sync({force:false})



module.exports = Historico

