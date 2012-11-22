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



//register a plungin to detect location change from an experiment to trigger the destroy function
//http://www.bennadel.com/blog/1520-Binding-Events-To-Non-DOM-Objects-With-jQuery.htm

(
    function( $ ){
// Default to the current location.
        var strLocation = window.location.href;
        var strHash = window.location.hash;
        var strPrevLocation = "";
        var strPrevHash = "";

// This is how often we will be checkint for
// changes on the location.
        var intIntervalTime = 100;

// This method removes the pound from the hash.
        var fnCleanHash = function( strHash ){
            return(
                strHash.substring( 1, strHash.length )
                );
        }

// This will be the method that we use to check
// changes in the window location.
        var fnCheckLocation = function(){
// Check to see if the location has changed.
            if (strLocation != window.location.href){

// Store the new and previous locations.
                strPrevLocation = strLocation;
                strPrevHash = strHash;
                strLocation = window.location.href;
                strHash = window.location.hash;

// The location has changed. Trigger a
// change event on the location object,
// passing in the current and previous
// location values.
                $( window.location ).trigger(
                    "change",
                    {
                        currentHref: strLocation,
                        currentHash: fnCleanHash( strHash ),
                        previousHref: strPrevLocation,
                        previousHash: fnCleanHash( strPrevHash )
                    }
                );

            }
        }

// Set an interval to check the location changes.
        setInterval( fnCheckLocation, intIntervalTime );
    }
    )( jQuery );

