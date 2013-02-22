'use strict';


var services = angular.module('LeapApp.services', []);


services.factory('MainModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var mainModel = {
        currentIndex:1
    };

    mainModel.panesOffset = function () {
        return 'panesOffset' + mainModel.currentIndex;
    }


    return mainModel;
});

services.factory('Leap', function ($log, $rootScope) {
    var leap;
    var frameCnt = 0;

// Support both the WebSocket and MozWebSocket objects
    if ((typeof(WebSocket) == 'undefined') &&
        (typeof(MozWebSocket) != 'undefined')) {
        WebSocket = MozWebSocket;
    }

// Create the socket with event handlers
    function init() {
        //Create and open the socket
        leap = new WebSocket("ws://localhost:6437/");

        // On successful connection
        leap.onopen = function (event) {
            $log.info("Connected to Leap WebSocket!");
        };

        // On message received
        leap.onmessage = function (event) {

            $rootScope.$broadcast('leapData', $.parseJSON(event.data));


        };

        // On socket close
        leap.onclose = function (event) {
            leap = null;
            $log.info("WebSocket connection closed");
        }

        //On socket error
        leap.onerror = function (event) {
            alert("Received error");
        };
    }

    init();

    $log.info('leap created');
    return leap
});


