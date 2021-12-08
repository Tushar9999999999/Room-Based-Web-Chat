const jwt = require('jsonwebtoken')

//Validation of the user for creating protected routes
module.exports = (req, res, next) => {
    //token stored in header with name as given
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).json({msg: "No Token - Authorization Denied"})
    }
    try{
        //decodes the token and return the id of the object with the help of the secret string
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if(!verified){
            return res.status(401).json({msg: "Cannot Verify - Authorization Denied"})
        }
        req.user = verified
        next()
    } catch(err){
        res.status(401).json({msg: err})
    }
}