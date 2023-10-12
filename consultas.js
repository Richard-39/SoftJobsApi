const bcrypt = require('bcryptjs')
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    host: process.env.DB_HOST, // al parecer no reconoce el host local en env, por lo que usa el externo
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // PORT lo usa el sistema general, por lo que al parecer genera problemas usarlo // https://render.com/docs/environment-variables#all-services-1
    ssl: true, // importante para evitar error de ssl en consola de render // https://stackoverflow.com/questions/22301722/ssl-for-postgresql-connection-nodejs
    allowExitOnIdle: true
})

const registrarUsuario = async (usuario) => {
    let { email, password, rol, lenguage } = usuario
    const passwordEncriptada = bcrypt.hashSync(password)
    password = passwordEncriptada
    const values = [email, passwordEncriptada, rol, lenguage]
    const consulta = "INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4)"
    try {
        await pool.query(consulta, values)
    } catch (error) {
        console.log(error);
    }
    
}

const obtenerDatosDeUsuario = async (email) => {
    const values = [email]
    const consulta = "SELECT * FROM usuarios WHERE email = $1"

    const { rows: [usuario], rowCount } = await pool.query(consulta, values)

    if (!rowCount) {
        throw { code: 404, message: "No se encontró ningún usuario con este email" }
    }

    delete usuario.password
    return usuario
}

const verificarCredenciales = async (email, password) => {
    const values = [email]
    const consulta = "SELECT * FROM usuarios WHERE email = $1"

    const { rows: [usuario], rowCount } = await pool.query(consulta, values)
    console.log(usuario);
    const { password: passwordEncriptada } = usuario
    const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada)
    
    if (!passwordEsCorrecta || !rowCount)
        throw { code: 401, message: "Email o contraseña incorrecta" }
}


module.exports = { registrarUsuario, verificarCredenciales, obtenerDatosDeUsuario }