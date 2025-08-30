const connectar = require("../database/database")
const Vendedor = require("../Vendedor/vendedor")
const {Sequelize} = require("sequelize")
const Produtos = connectar.define("Produtos",{
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    preco:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    foto:{
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao:{
        type: Sequelize.TEXT
    },
    quantidade:{
        type:Sequelize.INTEGER,
        allowNull: false
    }

})
Vendedor.hasMany(Produtos)
Produtos.belongsTo(Vendedor)


Produtos.sync({force: false})
module.exports = Produtos



