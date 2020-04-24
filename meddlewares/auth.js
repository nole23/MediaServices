exports.isLogged = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['authorization'];
    if (!token) {
			res.json({ success: false, msg: "no token provided" });
		}
	else {
        res.locals.currUser = token;
        next();
    }
}