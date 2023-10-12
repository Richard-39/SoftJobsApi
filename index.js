const express = require("express")
const jwt = require("jsonwebtoken")

const cors = require("cors")
const app = express()

require('dotenv').config()

const { registrarUsuario, verificarCredenciales, obtenerDatosDeUsuario } = require("./consultas")
const { checkCredentialsExists, tokenVerification } = require("./middlewares")

app.listen(3000, console.log("SERVER ON"))
app.use(cors())
app.use(express.json())

app.post("/usuarios", checkCredentialsExists, async (req, res) => {
    try {
        
        const usuario = req.body
        await registrarUsuario(usuario)
        res.send("Usuario creado con éxito")
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/usuarios", tokenVerification, async (req, res) => {
    try {
        const token = req.header("Authorization").split("Bearer ")[1]
        const { email } = jwt.decode(token)
        const usuario = await obtenerDatosDeUsuario(email)
        res.json(usuario)
    } catch (error) {
        console.log(error)
        const { code, message } = error
        res.status(code).send(message)
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        
        const value = await verificarCredenciales(email, password)
        console.log(value)
        const token = jwt.sign({ email }, process.env.SECRETKEY)
        res.send(token)
    } catch ({ code, message }) {
        console.log(message)
        res.status(code).send(message)
    }

})