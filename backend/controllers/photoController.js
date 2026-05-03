var PhotoModel = require('../models/photoModel.js');
var REPORT_THRESHOLD = 3;

function populatePhoto(query) {
    return query
        .populate('postedBy', 'username email')
        .populate('comments.postedBy', 'username email');
}

function getDecayScore(photo) {
    var createdAt = photo.createdAt || new Date();
    var ageHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
    return ((photo.likes || 0) - (photo.dislikes || 0)) / Math.pow(ageHours + 2, 1.2);
}

function userIdMatches(idA, idB) {
    return idA && idB && idA.toString() === idB.toString();
}

/**
 * photoController.js
 *
 * @description :: Server-side logic for managing photos.
 */
module.exports = {

    /**
     * photoController.list()
     */
    list: function (req, res) {
        populatePhoto(PhotoModel.find({ hidden: { $ne: true } }).sort({ createdAt: -1 }))
        .exec(function (err, photos) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }
            return res.json(photos);
        });
    },

    ranked: function (req, res) {
        populatePhoto(PhotoModel.find({ hidden: { $ne: true } }))
        .exec(function (err, photos) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting ranked photos.',
                    error: err
                });
            }

            photos.sort(function (a, b) {
                return getDecayScore(b) - getDecayScore(a);
            });

            return res.json(photos.map(function(photo) {
                var data = photo.toObject();
                data.score = getDecayScore(photo);
                return data;
            }));
        });
    },

    /**
     * photoController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        populatePhoto(PhotoModel.findOne({_id: id, hidden: { $ne: true }}))
        .exec(function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            return res.json(photo);
        });
    },

    /**
     * photoController.create()
     */
    create: function (req, res) {
        if (!req.file) {
            return res.status(400).json({
                message: 'Image is required.'
            });
        }

        if (!req.body.title || !req.body.message) {
            return res.status(400).json({
                message: 'Title and message are required.'
            });
        }

        var photo = new PhotoModel({
			title : req.body.title,
			message : req.body.message,
			path : "/images/"+req.file.filename,
			postedBy : req.session.userId
        });

        photo.save(function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating photo',
                    error: err
                });
            }

            return res.status(201).json(photo);
            //return res.redirect('/photos');
        });
    },

    vote: function(req, res) {
        var id = req.params.id;
        var value = req.body.value;

        if (value !== 'like' && value !== 'dislike') {
            return res.status(400).json({
                message: 'Vote must be like or dislike.'
            });
        }

        PhotoModel.findOne({_id: id, hidden: { $ne: true }}, function(err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            if (userIdMatches(photo.postedBy, req.session.userId)) {
                return res.status(403).json({
                    message: 'You cannot vote on your own photo.'
                });
            }

            var existingVote = photo.votes.find(function(vote) {
                return userIdMatches(vote.user, req.session.userId);
            });

            if (existingVote) {
                if (existingVote.value === value) {
                    return populatePhoto(PhotoModel.findById(photo._id)).exec(function(populateErr, populatedPhoto) {
                        if (populateErr) {
                            return res.status(500).json({ message: 'Error when getting photo.', error: populateErr });
                        }
                        return res.json(populatedPhoto);
                    });
                }

                if (existingVote.value === 'like') {
                    photo.likes = Math.max((photo.likes || 0) - 1, 0);
                } else {
                    photo.dislikes = Math.max((photo.dislikes || 0) - 1, 0);
                }
                existingVote.value = value;
            } else {
                photo.votes.push({
                    user: req.session.userId,
                    value: value
                });
            }

            if (value === 'like') {
                photo.likes = (photo.likes || 0) + 1;
            } else {
                photo.dislikes = (photo.dislikes || 0) + 1;
            }

            photo.save(function(saveErr) {
                if (saveErr) {
                    return res.status(500).json({
                        message: 'Error when saving vote.',
                        error: saveErr
                    });
                }

                populatePhoto(PhotoModel.findById(photo._id)).exec(function(populateErr, populatedPhoto) {
                    if (populateErr) {
                        return res.status(500).json({ message: 'Error when getting photo.', error: populateErr });
                    }
                    return res.json(populatedPhoto);
                });
            });
        });
    },

    comment: function(req, res) {
        var id = req.params.id;
        var message = req.body.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: 'Comment message is required.'
            });
        }

        PhotoModel.findOne({_id: id, hidden: { $ne: true }}, function(err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            photo.comments.push({
                postedBy: req.session.userId,
                message: message.trim()
            });

            photo.save(function(saveErr) {
                if (saveErr) {
                    return res.status(500).json({
                        message: 'Error when saving comment.',
                        error: saveErr
                    });
                }

                populatePhoto(PhotoModel.findById(photo._id)).exec(function(populateErr, populatedPhoto) {
                    if (populateErr) {
                        return res.status(500).json({ message: 'Error when getting photo.', error: populateErr });
                    }
                    return res.status(201).json(populatedPhoto);
                });
            });
        });
    },

    report: function(req, res) {
        var id = req.params.id;

        PhotoModel.findOne({_id: id, hidden: { $ne: true }}, function(err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo.',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            if (userIdMatches(photo.postedBy, req.session.userId)) {
                return res.status(403).json({
                    message: 'You cannot report your own photo.'
                });
            }

            var alreadyReported = photo.reports.some(function(report) {
                return userIdMatches(report.user, req.session.userId);
            });

            if (!alreadyReported) {
                photo.reports.push({
                    user: req.session.userId
                });
                photo.reportCount = photo.reports.length;

                if (photo.reportCount >= REPORT_THRESHOLD) {
                    photo.hidden = true;
                }
            }

            photo.save(function(saveErr) {
                if (saveErr) {
                    return res.status(500).json({
                        message: 'Error when reporting photo.',
                        error: saveErr
                    });
                }

                return res.json({
                    reportCount: photo.reportCount,
                    hidden: photo.hidden
                });
            });
        });
    },

    /**
     * photoController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        PhotoModel.findOne({_id: id}, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            photo.title = req.body.title ? req.body.title : photo.title;
            photo.message = req.body.message ? req.body.message : photo.message;
			photo.path = req.body.path ? req.body.path : photo.path;
			photo.postedBy = req.body.postedBy ? req.body.postedBy : photo.postedBy;
			photo.likes = req.body.likes ? req.body.likes : photo.likes;
            photo.dislikes = req.body.dislikes ? req.body.dislikes : photo.dislikes;
			
            photo.save(function (err, photo) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating photo.',
                        error: err
                    });
                }

                return res.json(photo);
            });
        });
    },

    /**
     * photoController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        PhotoModel.findByIdAndRemove(id, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the photo.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    publish: function(req, res){
        return res.render('photo/publish');
    }
};
