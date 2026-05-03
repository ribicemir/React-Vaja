var express = require('express');
// Vključimo multer za file upload
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

var router = express.Router();
var photoController = require('../controllers/photoController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', photoController.list);
router.get('/ranked', photoController.ranked);
//router.get('/publish', requiresLogin, photoController.publish);
router.get('/:id', photoController.show);

router.post('/', requiresLogin, upload.single('image'), photoController.create);
router.post('/:id/vote', requiresLogin, photoController.vote);
router.post('/:id/comments', requiresLogin, photoController.comment);
router.post('/:id/report', requiresLogin, photoController.report);

router.put('/:id', photoController.update);

router.delete('/:id', photoController.remove);

module.exports = router;
