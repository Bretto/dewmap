'use strict';
/* App Controllers */

var controllers = angular.module('LeapApp.controllers', []);

controllers.controller('MainCtrl', function ($scope, $rootScope, $timeout, $log, Leap, MainModel){
    $log.info('MainCtrl');

    $scope.MainModel = MainModel;

    MainModel.onGallery = function(e, direction){

        var dir = (e.direction === 'right')? -1:1;
        var currentIdx = MainModel.currentIndex;
        var newIdx = currentIdx + dir;

        if(newIdx < 1 ){
            newIdx = 6;
        }else if(newIdx > 6){
            newIdx = 1;
        }

        MainModel.currentIndex = newIdx;

    }

    MainModel.onThumb = function(idx){
        MainModel.currentIndex = idx;
    }

});











