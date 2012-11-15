/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index');
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

exports.experiments = function (req, res) {
    var id = req.params.id;
    res.render('comp/' + id + '/index');
};

exports.compAssets = function (req, res) {
    var id = req.params.id;
    var name = req.params.name;
    res.render('comp/' + id + '/assets/' + name);
};