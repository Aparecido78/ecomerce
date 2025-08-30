const Vendedor = require("../Vendedor/vendedor");
const express = require("express");
const rota = express.Router();
const multer = require("multer");
const path = require("path");
const Produtos = require("../produtos/tabela_produtos");
const bcrypt = require("bcryptjs");



const storage  = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "public/image");
    },
    filename: (req,file,cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const imagen = multer({ storage: storage });


rota.get("/", (req,res) => {
    res.render("tela_inicial");
});


rota.get("/pagina/login", (req,res) => {
    res.render("vendedor/login_vendedor", { mensagem: req.session.mensagem });
    req.session.mensagem = null;
});

rota.get("/login/vendedor", (req,res) => {
    res.render("vendedor/login_vendedor", { mensagem: req.session.mensagem });
    req.session.mensagem = null;
});


rota.post("/logar/vendedor", (req,res) => {
    const { email, senha } = req.body;

    Vendedor.findOne({ where: { email } })
    .then(usu => {
        if (!usu) {
            req.session.mensagem = "Email ou senha incorreto!";
            return res.redirect("/pagina/login");
        }

        const senha_correta = bcrypt.compareSync(senha, usu.senha);
        if (!senha_correta) {
            req.session.mensagem = "Email ou senha incorreto!";
            return res.redirect("/pagina/login");
        }

        
        req.session.vendedor = { id: usu.id, email: usu.email,  nome: usu.nome };
        const VendedorId = req.session.vendedor.id;

        Produtos.findAll()
        .then(pro => {
            Produtos.findAll({ where: { VendedorId } })
            .then(prod_vendedor => {
                req.session.mensagem = "Vendedor logado com sucesso!";
                res.render("vendedor/produtos", {
                    produtos: pro,
                    prod_vendedor: prod_vendedor,
                    mensagem: req.session.mensagem,
                    vendedor: req.session.vendedor
                });
                req.session.mensagem = null;
            });
        });
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao logar!";
        res.redirect("/pagina/login");
    });
});


rota.get("/pagina/cadastro/vendedor", (req,res) => {
    res.render("vendedor/cadastro_vendedor", { mensagem: req.session.mensagem });
    req.session.mensagem = null;
});

rota.post("/cadastrar/vendedor", (req,res) => {
    const { nome, email, senha } = req.body;
    const hash = bcrypt.hashSync(senha, bcrypt.genSaltSync(10));

    Vendedor.findOne({ where: { email } })
    .then(usu => {
        if (usu) {
            req.session.mensagem = "Email já cadastrado!";
            return res.redirect("/pagina/cadastro/vendedor");
        }

        Vendedor.create({ nome, email, senha: hash })
        .then(() => {
            req.session.mensagem = "Vendedor cadastrado com sucesso!";
            res.redirect("/login/vendedor");
        })
        .catch(err => {
            console.log(err);
            req.session.mensagem = "Erro ao cadastrar vendedor!";
            res.redirect("/pagina/cadastro/vendedor");
        });
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao cadastrar vendedor!";
        res.redirect("/pagina/cadastro/vendedor");
    });
});


rota.get("/tela/produtos", (req,res) => {
    if (!req.session.vendedor) {
        req.session.mensagem = "Vendedor não logado!";
        return res.redirect("/login/vendedor");
    }

    const VendedorId = req.session.vendedor.id;

    Produtos.findAll()
    .then(pro => {
        Produtos.findAll({ where: { VendedorId } })
        .then(pro_ven => {
            res.render("vendedor/produtos", {
                produtos: pro,
                prod_vendedor: pro_ven,
                mensagem: req.session.mensagem,
                 vendedor:req.session.vendedor
            });
            req.session.mensagem = null;
        });
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao carregar produtos!";
        res.redirect("/pagina/login");
    });
});


rota.get("/pagina/cadastrar/produtos", (req,res) => {
    res.render("vendedor/cadastro_produto", { mensagem: req.session.mensagem });
    req.session.mensagem = null;
});


rota.post("/cadastrar/produtos", imagen.single("foto"), (req,res) => {
    if (!req.session.vendedor) {
        req.session.mensagem = "Vendedor não logado!";
        return res.redirect("/login/vendedor");
    }

    const { nome, preco, descricao, quantidade } = req.body;
    const foto = req.file.filename;
    const VendedorId = req.session.vendedor.id;

    Produtos.create({ nome, preco, descricao, quantidade, foto, VendedorId })
    .then(() => {
        req.session.mensagem = "Produto cadastrado com sucesso!";
        res.redirect("/tela/produtos");
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao cadastrar produto!";
        res.redirect("/tela/produtos");
    });
});


rota.post("/editar/produto/:id", (req,res) => {
    const ProdutoId = req.params.id;

    Produtos.findByPk(ProdutoId)
    .then(pro => {
        res.render("vendedor/editar_produtos", { produtos: pro, mensagem: req.session.mensagem });
        req.session.mensagem = null;
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao editar produto!";
        res.redirect("/tela/produtos");
    });
});


rota.post("/editar/produto/vendedor/:id", imagen.single("foto"), (req,res) => {
    const ProdutoId = req.params.id;
    const { nome, preco, descricao, quantidade } = req.body;
    const foto = req.file ? req.file.filename : null;

    let dadosParaAtualizar = { nome, preco, descricao, quantidade };
    if (foto) dadosParaAtualizar.foto = foto;

    Produtos.update(dadosParaAtualizar, { where: { id: ProdutoId } })
    .then(() => {
        req.session.mensagem = "Produto atualizado com sucesso!";
        res.redirect("/tela/produtos");
    })
    .catch(err => {
        console.log(err);
        req.session.mensagem = "Erro ao atualizar produto!";
        res.redirect("/tela/produtos");
    });
});

module.exports = rota;
