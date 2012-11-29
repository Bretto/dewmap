'use strict';


var services = angular.module('Box2dDom.services', []);



services.factory('Box2dDomModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var Box2dDomModel = {

        box2dObjs:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    };

    return Box2dDomModel;
});


