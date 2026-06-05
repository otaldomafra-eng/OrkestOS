import jwt from 'jsonwebtoken'

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado')
}

const authUser = async (req, res, next) => {

    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader

    if (!token) {
        return res.json({ success: false, message: 'Não autorizado. Faça login novamente.' })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: decoded.id }
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Não autorizado. Faça login novamente.' })
    }
}

export default authUser
