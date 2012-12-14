'use strict';
/* App Controllers */

var controllers = angular.module('AbstractTech.controllers', []);


controllers.controller('AbstractTechCtrl', function ($scope, $rootScope, $location, $browser, $log, AbstractTechModel){

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    $scope.abstractTechModel = AbstractTechModel;

});


controllers.controller('WorldCtrl', function ($scope, $rootScope, $log, $timeout, AbstractTechModel, WorldModel){

    WorldModel.init();

    $scope.worldModel = WorldModel;

    // register the listener for self destruction
    $timeout(function() {
        $( window.location ).one(
            "change",
            function( objEvent, objData ){
                $rootScope.$broadcast(':destroy-experiment');
            }
        );
    }, 0, false);

});





















