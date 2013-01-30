'use strict';
/* App Controllers */

var controllers = angular.module('pie-menu-d3.controllers', []);



// inspired by: http://paal.org/blog/2012/07/06/running-box2d-on-server-with-node-js-via-socket-io/
controllers.controller('PieMenuCtrl', function ($scope, $rootScope, $timeout, $compile, $log, PieMenuModel){

    $('#preloader').css('display','none');
    // register the listener for self destruction
    $timeout(function() {
        $( window.location ).one(
            "change",
            function( objEvent, objData ){
                $rootScope.$broadcast(':destroy-experiment');
            }
        );
    }, 0, false);

    $scope.pieMenuModel = PieMenuModel;

    $scope.onMenuPieSelect = function(obj){
        $log.info(obj);
    }

});























