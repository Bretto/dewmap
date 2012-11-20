'use strict';
/* App Controllers */

var controllers = angular.module('GeoConnections.controllers', []);


controllers.controller('GeoConnectionsCtrl', function ($scope, $log, GeoConnectionsModel){

    $scope.geoConnectionsModel = GeoConnectionsModel;

});


controllers.controller('WorldCtrl', function ($scope, $log, GeoConnectionsModel, WorldModel){

    var geoPointsElem = [];
    $scope.addGeoPointsElem = function(elem){
        geoPointsElem.push(elem);
    }

    $scope.renderComplete = function(){
        WorldModel.setGeoPointsElem(geoPointsElem);
    }

});



















