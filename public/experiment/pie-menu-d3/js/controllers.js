'use strict';
/* App Controllers */

var controllers = angular.module('pie-menu.controllers', []);



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


    $scope.onMouseClick = function(e){


    }

    $scope.onSelect = function(data, e){

        $log.info('test', e.clientX, e.clientY );

        var str = '<pie-menu class="svgPie" radius="60" data="data"></pie-menu>';

        var elem = $compile(str)($scope);

        $('#experiment-content').append(elem);

        // before $timeout elem is still pie-menu, then it become the svg tag
        $timeout(function() {
            $(elem).offset({ top: e.clientY - 60, left: e.clientX - 60 })
        }, 0, false);


    }

});























