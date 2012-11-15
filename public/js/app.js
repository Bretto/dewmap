'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/nav', {templateUrl:'partials/nav'}).
        when('/comp/:idx', {controller:'CompCtrl', templateUrl:'partials/include-comp'}).
        otherwise({redirectTo:'/nav'});
    $locationProvider.html5Mode(false);
}]);


