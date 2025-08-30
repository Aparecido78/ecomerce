function autenticar(req, res, next) {
    if (req.session && req.session.usua && req.session.usua.id) {
        next();
    } else {
        return res.redirect("/login/cliente");
    }
}

module.exports = autenticar;
