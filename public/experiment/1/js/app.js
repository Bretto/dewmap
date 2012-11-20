'use strict';


// Declare app level module which depends on filters, and services
angular.module('GeoConnections', ['GeoConnections.filters', 'GeoConnections.services', 'GeoConnections.directives', 'GeoConnections.controllers']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/world', {templateUrl:'partial/world.html'}).
        otherwise({redirectTo:'/world'});
    $locationProvider.html5Mode(false);
}]);


