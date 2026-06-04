import jwt from 'jsonwebtoken'

const authUser = async(req, res, next)=>{

    const { token } = req.headers;

    if(!token){
        return res.json({success: false, message: "Not Authorized, Entrar Again"});
    }

    // Modo demo: token gerado localmente, sem JWT real
    if(token.startsWith('demo-')){
        req.body.userId = 'demo';
        return next();
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})

    }
}

export default authUser;