var HelloController = {};

HelloController.get = function (req, res, next) {
    res.send('Hello ' + req.params.name);
};

module.exports = HelloController;