const db = require("../../database/models");

module.exports = {
    categories: (req,res) => {
        return res.json({
            categories: [
                {
                    url: 'https://ramedeco.herokuapp.com/',
                    title: "INICIO",
                    classIcon:"fas fa-home"
                },
                {
                    url: 'https://ramedeco.herokuapp.com/products/',
                    title: "LISTADO DE PRODUCTOS",
                    classIcon:"fas fa-align-justify"
                },
                {
                    url:'https://ramedeco.herokuapp.com/products/create',
                    title: "AGREGAR PRODUCTO",
                    classIcon:"fas fa-plus-circle"
                },
                {
                    url:'https://ramedeco.herokuapp.com/users/',
                    title: "USUARIOS",
                    classIcon:"fas fa-users"
                }
            ]
        })

    }
};