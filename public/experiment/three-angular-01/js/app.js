'use strict';

var app = angular.module('GiltApp', ['GiltApp.filters', 'GiltApp.services', 'GiltApp.directives', 'GiltApp.controllers']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {templateUrl:'partial/welcome.html', controller:'WelcomeCtrl'}).
            when('/sale/:type', {templateUrl:'partial/sales.html', controller:'SalesCtrl', resolve:{promiseData:getSales}}).
            when('/sale/:type/product/:uri', {templateUrl:'partial/products.html', controller:'ProductsCtrl', resolve:{promiseData:getProducts}}).
            when('/sale/:type/product/:uri/item/:id', {templateUrl:'partial/product.html', controller:'ProductCtrl', resolve:{promiseData:getProduct}}).
            otherwise({redirectTo:'/'});
        $locationProvider.html5Mode(false);
    }]);

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


var getSales = function ($q, $route, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};
    var saleUrl = GILT.SALE + $route.current.params.type + GILT.ACTIVE + GILT.APIKEY + GILT.CALLBACK;

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

var getProducts = function ($q, $route, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};

    var uri = $route.current.params.uri.replace(/_/g, '/');
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

var getProduct = function ($q, $route, GILT, giltRequest) {

    var deferred = $q.defer();
    var promiseData = {};

    var uri = $route.current.params.uri.replace(/_/g, '/');
    var productURI = GILT.API + uri + GILT.APIKEY + GILT.CALLBACK;

    giltRequest(productURI)
        .then(function (data) {
            promiseData.data = data;
            var id = $route.current.params.id.replace(/_/g, '/');
            var itemURI = GILT.API + id + GILT.APIKEY + GILT.CALLBACK;

            giltRequest(itemURI)
                .then(function (data) {
                    promiseData.item = data;
                    deferred.resolve(promiseData);
                });
        });

    return deferred.promise;
};

