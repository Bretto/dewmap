'use strict';


var services = angular.module('myApp.services', []);


services.constant('LAYOUT', {

    GRID : 'grid',
    SPHERE : 'sphere',
    DISK : 'disk'

});

services.factory('AppModel', function ($http, $log, $rootScope, $routeParams, $location, LAYOUT) {

    var items = [];

    for(var i=0; i<16; i++)
    {
        var idx = (i+1);
        items.push({name:'Dynamic filter system Angularjs ' + idx, url:'comp'+ idx, idx:idx})
    }


    var AppModel = {
        items : items,
        layout: LAYOUT.GRID,
        currentItem: null,
        controls: null
    };



    return AppModel;
});
