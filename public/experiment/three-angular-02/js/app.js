'use strict';



'use strict';

var app = angular.module('App', ['App.filters', 'App.services', 'App.directives', 'App.controllers', 'ui.compat']).
    config(function ($stateProvider, $urlRouterProvider, $routeProvider, $locationProvider) {

        $stateProvider
            .state('home', {
                url:'/',
                views:{
                    'sale':{
                        templateUrl:'partial/welcome.html',
                        controller:'WelcomeCtrl'
                    }
                }
            })
            .state('sale', {
                url:'/sale/:type',
                views:{
                    'sale':{
                        templateUrl:'partial/sales.html',
                        controller:'SalesCtrl'
                    }
                },
                resolve:{
                    promiseData:getSales
                },
                onEnter:function ($rootScope, $state, $log) {
                    $log.info('Sale:onEnter');
                    $rootScope.$broadcast('Sale:onEnter');
                },
                onExit:function ($rootScope, $state) {
                    $rootScope.$broadcast('Sale:onExit');
                }
            })
            .state('sale.product', {
                url:'/product/:uri',
                views:{
                    'product':{
                        templateUrl:'partial/products.html',
                        controller:'ProductsCtrl'
                    }
                },
                resolve:{
                    promiseData:getProducts
                },
                onEnter:function ($rootScope, $state, $stateParams, $log) {
                    $log.info('Product:onEnter');
                    $rootScope.$broadcast('Product:onEnter', $state, $stateParams);
                },
                onExit:function ($rootScope, $state, $stateParams) {
                    $rootScope.$broadcast('Product:onExit', $state, $stateParams);
                }
            })
            .state('sale.product.item', {
                url:'/item/:id',
                views:{
                    'item':{
                        templateUrl:'partial/product.html',
                        controller:'ProductCtrl'
                    }
                },
                resolve:{
                    promiseData:getProduct
                },
                onEnter:function ($rootScope, $state, $log) {
                    $log.info('Item:onEnter');
                    $rootScope.$broadcast('Item:onEnter');
                },
                onExit:function ($rootScope, $state) {
                    $rootScope.$broadcast('Item:onExit');
                }
            });
        $urlRouterProvider.otherwise('/');

    })
    .run(
    function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    });
;

app.factory('giltRequest', function (GILT, $http, $log) {
    return function (uri) {
        return $http({method:GILT.METHOD, url:uri}).then(
            function (response) {
                $log.info(response.data);
                return response.data;
            },
            function (error) {
                $log.info(error);
            });
    };
});


var getSales = function ($q, $stateParams, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};
    var saleUrl = GILT.SALE + $stateParams.type + GILT.ACTIVE + GILT.APIKEY + GILT.CALLBACK;

    giltRequest(saleUrl)
        .then(function (data) {
            promiseData.data = data;
            var index = Math.floor(Math.random() * data.sales.length);
            var productURI = data.sales[index].sale + GILT.APIKEY + GILT.CALLBACK;

            giltRequest(productURI)
                .then(function (data) {
                    promiseData.item = data;
                    deferred.resolve(promiseData);
                });
        });

    return deferred.promise;
};

var getProducts = function ($q, $stateParams, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};

    var uri = $stateParams.uri.replace(/_/g, '/');
    var productURI = GILT.API + uri + GILT.APIKEY + GILT.CALLBACK;
    giltRequest(productURI)

        .then(function (data) {
            promiseData.data = data;
            if (data.products) {

                var limit = Math.min(9, data.products.length);
                var productsPromises = [];
                promiseData.products = [];

                for (var i = 0; i < limit; i++) {

                    var product = data.products[i] + GILT.APIKEY + GILT.CALLBACK;
                    productsPromises.push(giltRequest(product)
                        .then(function (data) {
                            promiseData.products.push(data);
                        }));
                }

                $q.all(productsPromises)
                    .then(function (data) {
                        deferred.resolve(promiseData);
                    })
            }
            else{
                deferred.resolve(promiseData);
            }
        });

    return deferred.promise;
};

var getProduct = function ($q, $stateParams, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};

    var uri = $stateParams.uri.replace(/_/g, '/');
    var productURI = GILT.API + uri + GILT.APIKEY + GILT.CALLBACK;

    giltRequest(productURI)
        .then(function (data) {
            promiseData.data = data;
            var id = $stateParams.id.replace(/_/g, '/');
            var itemURI = GILT.API + id + GILT.APIKEY + GILT.CALLBACK;

            giltRequest(itemURI)
                .then(function (data) {
                    promiseData.item = data;
                    deferred.resolve(promiseData);
                });
        });

    return deferred.promise;
};