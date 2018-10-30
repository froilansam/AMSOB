exports.employeeLoggedIn = (req, res, next) => {//For Management

    
    


    
    
    if (req.session && req.session.user && req.session.utilities) return next();
    return res.redirect(`/login?redirect=${req.url}`);
}

exports.noAuthed = (req, res, next) => {
    if (req.session && req.session.user && Object.keys(req.session.user).length > 0) return res.redirect('/index');
    return next();
}

exports.acquisitionQualified = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.booAcquisition == 1) return next();
    return res.redirect('/');
}

exports.inventoryQualified = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.booInventory == 1) return next();
    return res.redirect('/');
}

exports.auctionQualified = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.booAuction == 1) return next();
    return res.redirect('/');
}

exports.acquisitionOrInventoryQualified = (req, res, next) => {
    if (req.session && req.session.user && (req.session.user.booAcquisition == 1 || req.session.user.booInventory == 1) ) return next();
    return res.redirect('/');
}

exports.acquisitionOrAuctionQualified = (req, res, next) => {
    if (req.session && req.session.user && (req.session.user.booAcquisition == 1 || req.session.user.booAuction == 1) ) return next();
    return res.redirect('/');
}

exports.inventoryOrAuctionQualified = (req, res, next) => {
    if (req.session && req.session.user && (req.session.user.booInventory == 1 || req.session.user.booAuction == 1) ) return next();
    return res.redirect('/');
}

exports.consignorNotLoggedIn = (req, res, next) => {//For Consignor Home
    if (req.session && req.session.consignor && Object.keys(req.session.consignor).length > 0) return next();
    return res.redirect(`/consignorportal?redirect=${req.url}`);
}

exports.consignorLoggedIn = (req, res, next) => {//For Log In Page (Consignor Portal)
    if (req.session && req.session.consignor && Object.keys(req.session.consignor).length > 0) return res.redirect('/consignorhome');
    return next();
}

exports.bidderNotLoggedIn = (req, res, next) => {//For Log In Page (bidder Portal)
    if (req.session && req.session.bidder && Object.keys(req.session.bidder).length > 0) return next();
    return res.redirect(`/bid`);
}


exports.bidderLoggedIn = (req, res, next) => {//For Log In Page (bidder Portal)
    if (req.session && req.session.bidder && Object.keys(req.session.bidder).length > 0) return res.redirect('/bid');
    return next();
}



