const express = require("express");
const Usuario = require("./usuario");
const rota = express.Router();
const bcrypt = require("bcryptjs");
const Produtos = require("../produtos/tabela_produtos");
const Carrinho = require("../carrinho/Carrinho");
const Historico = require("../Historico/historico");
const autenticar_usuario = require("../autenticacao/autenticacao");


rota.get("/", (req, res) => {
    res.render("tela_inicial");
});


rota.get("/login/cliente", (req,res) => {
    res.render("usuario/login", { mensagem: req.session.mensagem });
    req.session.mensagem = null; 
});

rota.post("/logar/usuario", (req,res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    Usuario.findOne({ where: { email } })
    .then(usu => {
        if (!usu) {
            req.session.mensagem = "Email ou senha incorreto!";
            return res.redirect("/login/cliente");
        }

        const senha_correta = bcrypt.compareSync(senha, usu.senha);
        if (!senha_correta) {
            req.session.mensagem = "Email ou senha incorreto!";
            return res.redirect("/login/cliente");
        }

        
        req.session.usua = { id: usu.id, email: usu.email };
        req.session.mensagem = "Usuário logado com sucesso!";

        const UsuarioId = req.session.usua.id;

        Usuario.findByPk(UsuarioId)
        .then(usu => {
            Produtos.findAll()
            .then(pro => {
                Carrinho.findAll({ where: { UsuarioId }, include: [{ model: Produtos }] })
                .then(carr => {
                    Historico.findAll({ where: { UsuarioId }, include: [{ model: Produtos }] })
                    .then(histo => {
                        res.render("usuario/produtos_cliente", {
                            produtos: pro,
                            carrinho: carr,
                            historico: histo,
                            usuario: usu,
                            mensagem: req.session.mensagem
                        });
                        req.session.mensagem = null;
                    });
                });
            });
        });
    })
    .catch(err => {
        req.session.mensagem = "Email ou senha incorreto!";
        console.log(err);
        res.redirect("/login/cliente");
    });
});

rota.get("/pagina/cadastro/usuario", (req,res) => {
    res.render("usuario/cadastro_usuario", { mensagem: req.session.mensagem });
    req.session.mensagem = null;
});

rota.post("/cadastrar/usuario", (req,res) => {
    const { nome, email, senha } = req.body;
    const sal = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, sal);

    Usuario.findOne({ where: { email } })
    .then(usu => {
        if (usu) {
            req.session.mensagem = "Email já cadastrado!";
            return res.redirect("/login/cliente");
        }

        Usuario.create({ nome, email, senha: hash })
        .then(() => {
            req.session.mensagem = "Usuário cadastrado com sucesso!";
            res.redirect("/login/cliente");
        })
        .catch(err => {
            req.session.mensagem = "Erro ao cadastrar usuário!";
            console.log(err);
            res.redirect("/login/cliente");
        });
    })
    .catch(err => {
        req.session.mensagem = "Erro ao cadastrar usuário!";
        console.log(err);
        res.redirect("/login/cliente");
    });
});


rota.get("/pagina/produtos", autenticar_usuario, (req,res) => {
    if (!req.session.usua || !req.session.usua.id) return res.redirect("/login/cliente");

    const UsuarioId = req.session.usua.id;

    Usuario.findByPk(UsuarioId)
    .then(usu => {
        Produtos.findAll()
        .then(pro => {
            Carrinho.findAll({ where: { UsuarioId }, include: [{ model: Produtos }] })
            .then(carr => {
                Historico.findAll({ where: { UsuarioId }, include: [{ model: Produtos }] })
                .then(histo => {
                    res.render("usuario/produtos_cliente", {
                        produtos: pro,
                        carrinho: carr,
                        historico: histo,
                        usuario: usu,
                        mensagem: req.session.mensagem
                    });
                    req.session.mensagem = null;
                });
            });
        });
    });
});

rota.post("/adicionar/carrinho/:id", autenticar_usuario, (req,res) => {
    const ProdutoId = req.params.id;
    const UsuarioId = req.session.usua.id;

    Carrinho.create({ quantidade: 1, ProdutoId, UsuarioId })
    .then(() => {
        req.session.mensagem = "Produto adicionado ao carrinho com sucesso!";
        res.redirect("/pagina/produtos");
    })
    .catch(() => {
        req.session.mensagem = "Erro ao adicionar produto!";
        res.redirect("/pagina/produtos");
    });
});


rota.post("/remover/carrinho/:id", autenticar_usuario, (req,res) => {
    const CarrinhoId = req.params.id;

    Carrinho.destroy({ where: { id: CarrinhoId } })
    .then(() => {
        req.session.mensagem = "Produto removido do carrinho!";
        res.redirect("/pagina/produtos");
    })
    .catch(err => {
        req.session.mensagem = "Erro ao remover produto!";
        console.log(err);
        res.redirect("/pagina/produtos");
    });
});

rota.post("/comprar/produto/:id", autenticar_usuario, (req,res) => {
    const CarrinhoId = req.params.id;
    const ProdutoId = req.body.id;
    const UsuarioId = req.session.usua.id;
    const quantidade = 1;

    Usuario.findByPk(UsuarioId)
    .then(usua => {
        if (!usua) {
            req.session.mensagem = "Usuário não encontrado!";
            return res.redirect("/pagina/produtos");
        }

        Produtos.findByPk(ProdutoId)
        .then(pro => {
            if (!pro) {
                req.session.mensagem = "Produto não encontrado!";
                return res.redirect("/pagina/produtos");
            }

            if (usua.dinheiro >= pro.preco && pro.quantidade > 0) {
                Historico.create({ UsuarioId: usua.id, ProdutoId: pro.id, quantidade })
                .then(() => {
                    Carrinho.destroy({ where: { ProdutoId: pro.id, UsuarioId } })
                    .then(() => {
                        pro.quantidade -= 1;
                        usua.dinheiro -= pro.preco;
                        pro.save();
                        usua.save();
                        req.session.mensagem = "Produto comprado com sucesso!";
                        res.redirect("/pagina/produtos");
                    }).catch(err => {
                        req.session.mensagem = "Erro ao atualizar carrinho!";
                        console.log(err);
                        res.redirect("/pagina/produtos");
                    });
                }).catch(err => {
                    req.session.mensagem = "Erro ao registrar compra!";
                    console.log(err);
                    res.redirect("/pagina/produtos");
                });
            } else {
                req.session.mensagem = "Saldo insuficiente ou produto indisponível!";
                res.redirect("/pagina/produtos");
            }
        }).catch(err => {
            req.session.mensagem = "Erro ao buscar produto!";
            console.log(err);
            res.redirect("/pagina/produtos");
        });
    }).catch(err => {
        req.session.mensagem = "Erro ao buscar usuário!";
        console.log(err);
        res.redirect("/pagina/produtos");
    });
});

rota.get("/pagina/editar/usuario", autenticar_usuario, (req, res) => {
    const id = req.session.usua.id;

    Usuario.findByPk(id)
    .then(usuario => {
        if (usuario) {
            res.render("usuario/perfil_usuario", { usuario, mensagem: req.session.mensagem });
            req.session.mensagem = null;
        } else {
            req.session.mensagem = "Usuário não encontrado!";
            res.redirect("/pagina/produtos");
        }
    })
    .catch(err => {
        req.session.mensagem = "Erro ao buscar usuário!";
        console.log(err);
        res.redirect("/pagina/produtos");
    });
});

rota.post("/editar/perfil/:id", autenticar_usuario, (req,res) => {
    const id = req.params.id;
    const { nome, email, senha } = req.body;

    const hash_senha = bcrypt.hashSync(senha, bcrypt.genSaltSync(10));

    Usuario.findByPk(id)
    .then(usu => {
        if (usu) {
            Usuario.update({ nome, email, senha: hash_senha }, { where: { id: usu.id } })
            .then(() => {
                req.session.mensagem = "Perfil atualizado com sucesso!";
                res.redirect("/pagina/produtos");
            })
            .catch(err => {
                req.session.mensagem = "Erro ao atualizar perfil!";
                console.log(err);
                res.redirect("/pagina/produtos");
            });
        } else {
            req.session.mensagem = "Usuário não encontrado!";
            res.redirect("/pagina/produtos");
        }
    })
    .catch(err => {
        req.session.mensagem = "Erro ao buscar usuário!";
        console.log(err);
        res.redirect("/pagina/produtos");
    });
});

module.exports = rota;
