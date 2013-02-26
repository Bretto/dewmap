'use strict';
/* App Controllers */

var controllers = angular.module('GiltApp.controllers', []);

controllers.controller('MainCtrl', function ($scope, $rootScope, $timeout, $log, Scene3DApi){
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
});

controllers.controller('WelcomeCtrl', function ($scope, MainModel, $log, $http, $routeParams, GILT, $timeout, Scene3DApi){
    $log.info('HomeCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = 'welcome';

    MainModel.breadcrumbs(MainModel.root);

    $scope.initPositionFn = Scene3DApi.getFlyOutLayout;
    $scope.layoutFn = Scene3DApi.getProductLayout;

    $scope.$on('$routeChangeStart', function(){
        $scope.layoutFn = Scene3DApi.getFlyOutLayout;
    })


});

controllers.controller('SalesCtrl', function ($scope, MainModel, $log, $http, $routeParams, GILT, $timeout, promiseData, Scene3DApi){
    $log.info('SalesCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;

    MainModel.breadcrumbs(MainModel.root + ' sales');

    $scope.initPositionFn = Scene3DApi.getFlyOutLayout;
    $scope.layoutFn = Scene3DApi.getSalesLayout;

    $scope.$on('$routeChangeStart', function(){
        $scope.layoutFn = Scene3DApi.getFlyOutLayout;
    })

});

controllers.controller('ProductsCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, Scene3DApi, $timeout){
    $log.info('ProductsCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;
    MainModel.productURI = $routeParams.uri;

    $scope.data = promiseData.data;
    $scope.products = promiseData.products;
    $scope.isSoldOut = (promiseData.products) ? false : true;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name );

    $scope.initPositionFn = Scene3DApi.getFlyOutLayout;
    $scope.layoutFn = Scene3DApi.getProductsLayout;

    $scope.$on('$routeChangeStart', function(){
        $scope.layoutFn = Scene3DApi.getFlyOutLayout;
    })

});

controllers.controller('ProductCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, $timeout, Scene3DApi){
    $log.info('ProductCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $routeParams.type;
    MainModel.productURI = $routeParams.uri;
    MainModel.productID = $routeParams.id;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name, promiseData.item.name );


    $scope.initPositionFn = Scene3DApi.getFlyOutLayout;
    $scope.layoutFn = Scene3DApi.getProductLayout;

    $scope.$on('$routeChangeStart', function(){
        $scope.layoutFn = Scene3DApi.getFlyOutLayout;
    })

});
















