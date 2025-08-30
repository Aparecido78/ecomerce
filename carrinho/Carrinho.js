const {Sequelize} = require("sequelize")
const connectar = require("../database/database")
const Usuario = require("../usuario/usuario")
const Produtos = require("../produtos/tabela_produtos")

const Carrinho = connectar.define("Carrinho",{
    quantidade:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

Usuario.hasMany(Carrinho)
Carrinho.belongsTo(Usuario)

Carrinho.belongsTo(Produtos)
Produtos.hasMany(Carrinho)

Carrinho.sync({
    force: false
}
)

module.exports = Carrinho