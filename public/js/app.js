'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.controllers', 'myApp.filters', 'myApp.services', 'myApp.directives']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/nav', {templateUrl:'partial/nav'}).
        when('/experiment/:idx', {controller:'ExperimentCtrl', templateUrl:'partial/include-experiment'}).
        otherwise({redirectTo:'/nav'});
    $locationProvider.html5Mode(false);
}]);


