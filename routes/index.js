exports.index = function(req, res){
    res.render('index');
};

exports.partial = function (req, res) {
    var name = req.params.name;
    res.render('partial/' + name);
};

exports.experiment = function (req, res) {
    var id = req.params.id;

    // this null is check is fixing the bug
    // where the include-experiment partial
    // try to load /experiment/null when coming
    // back to the nav menu
    if(id === 'null')res.end();

    res.render('experiment/' + id )
};


