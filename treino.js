const express = require("express")
const app = express()
const port = 3000
const Usuario = require("./usuario/usuario")
const session = require("express-session")
const flash = require("connect-flash")
const connectar = require("./database/database")
const Produtos = require("./produtos/tabela_produtos")

const rota_vendedor = require("./Vendedor/codigos_vendedor")
const rota_usuario = require("./usuario/codigo_usuario")

const bodypaser = require("body-parser")
const Vendedor = require("./Vendedor/vendedor")
const Carrinho = require("./carrinho/Carrinho")
const Historico = require("./Historico/historico")
app.use(session({
    secret:"dlkkdkddkd",
    cookie:{maxAge: 300000000}
}))


app.use(flash())


app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});




app.use(bodypaser.urlencoded({extended: true}))
app.use(bodypaser.json())
app.use(express.static("public"))
app.set("view engine","ejs")



app.use("/",rota_vendedor)
app.use("/",rota_usuario)
app.get("/",(req,res)=>{
    res.render("tela_inicial")
})



app.listen(port,()=>{

    console.log(`Porta aberta com sucesso: http://localhost:${port}`);

    
})