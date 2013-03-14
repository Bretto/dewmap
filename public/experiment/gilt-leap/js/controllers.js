'use strict';
/* App Controllers */

var controllers = angular.module('GiltApp.controllers', []);

controllers.controller('MainCtrl', function ($scope, $rootScope, $timeout, $log, Leap){
    $log.info('MainCtrl');


});

controllers.controller('MainContentCtrl', function ($scope, $rootScope, $timeout, $compile, $log){
    $log.info('MainContentCtrl');
});

controllers.controller('MainNavCtrl', function ($scope, $timeout, MainModel, $routeParams, $log){
    $log.info('MainNavCtrl');
    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;
    MainModel.productURI = $routeParams.uri;
    MainModel.productID = $routeParams.id;

    $scope.onGrid = function(){
        $log.info('onGrid', MainModel.isGrid);
        MainModel.isGrid = true;
    }

    $scope.onList = function(){
        MainModel.isGrid = false;
    }

});

controllers.controller('WelcomeCtrl', function ($scope, MainModel, $log, $http, $routeParams, GILT, $timeout){
    $log.info('HomeCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = 'welcome';

    MainModel.breadcrumbs(MainModel.root);
});

controllers.controller('SalesCtrl', function ($scope, MainModel, $log, $http, $routeParams, GILT, $timeout, promiseData){
    $log.info('SalesCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;


    MainModel.breadcrumbs(MainModel.root + ' sales');

});

controllers.controller('ProductsCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, $timeout){
    $log.info('ProductsCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;
    MainModel.productURI = $routeParams.uri;

    $scope.data = promiseData.data;
    $scope.products = promiseData.products;
    $scope.isSoldOut = (promiseData.products) ? false : true;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name );

});

controllers.controller('ProductCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, $timeout){
    $log.info('ProductCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;
    MainModel.productURI = $routeParams.uri;
    MainModel.productID = $routeParams.id;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name, promiseData.item.name );

});
















