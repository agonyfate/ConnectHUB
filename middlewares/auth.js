const isLogin = async(req, res, next)=>{
    try{
        if(req.session.user){

        }
        else{
            res.redirect('/');
        }
        next();
    } catch(error){
        console.log(error.message);
    }
} //logic for checking whether user is logged in or not. if hes not, we move to login page

const isLogout = async(req, res, next)=>{
    try{
        if(req.session.user){
            res.redirect('/dashboard');
        }
        next();
    } catch(error){
        console.log(error.message);
    }
} //logic for checking the opposite lmao

const isAdmin = async(req, res, next)=> {
    try {
        if(req.session.user && req.session.user.role === 'admin') {
            return next();
        } else {
        return res.status(403).send('Access denied: Admins only');
        }
    } catch(error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    isAdmin
}