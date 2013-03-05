'use strict';

angular.module('GiltApp', ['GiltApp.filters', 'GiltApp.services', 'GiltApp.directives', 'GiltApp.controllers']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {templateUrl:'partial/welcome.html', controller:'WelcomeCtrl'}).
        when('/sale/:type', {templateUrl:'partial/sales.html', controller:'SalesCtrl',
            resolve:{
                promiseData: salePromise
            }
        }).
        when('/sale/:type/product/:uri', {templateUrl:'partial/products.html', controller:'ProductsCtrl',
            resolve:{
                promiseData: productPromise
            }
        }).
        when('/sale/:type/product/:uri/item/:id', {templateUrl:'partial/product.html', controller:'ProductCtrl',
            resolve:{
                promiseData: itemPromise
            }
        }).
        otherwise({redirectTo:'/'});
    $locationProvider.html5Mode(false);
}]);


var productPromise = function($q, $route, GILT, $http, $log){

    var deferred = $q.defer();
    var promiseData = {};

    var productData = productDataPromise($q, $route, GILT, $http, $log);
    productData.then(function(result){
        promiseData.data = result;
        if(result.products){
            var products = productsPromise($q, $route, GILT, $http, $log, result);
            products.then(function(result){
                promiseData.products = result;
                deferred.resolve(promiseData);
            });
        }else{
            deferred.resolve(promiseData);
        }

    });



    return deferred.promise;
}


var productsPromise = function($q, $route, GILT, $http, $log, result){

    var deferred = $q.defer();
    var finished = 0;
    var products = [];

    if(result.products){
        var limit =  Math.min(9,result.products.length);

        for (var i = 0; i < limit; i++) {
            (function(i){
                var productUri = result.products[i];
                productItemPromise($q, $route, GILT, $http, $log, productUri).then(function(result){
                    products.push(result);
                    if(++ finished === limit){
                        deferred.resolve(products);
                    }
                });
            }(i));
        }
    }

    return deferred.promise;
}

var productItemPromise = function($q, $route, GILT, $http, $log, productUri){

    var deferred = $q.defer();

    var successCb = function (result)
    {
        deferred.resolve(result);
        $log.info(result);
    };

    var errorCb = function (error)
    {
        $log.info(error);
    };


    var itemURI = productUri + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:itemURI}).success(successCb).error(errorCb);

    return deferred.promise;
}


var itemPromise = function($q, $route, GILT, $http, $log){

    var deferred = $q.defer();
    var promiseData = {};

    var productData = productDataPromise($q, $route, GILT, $http, $log);
    productData.then(function(result){
        promiseData.data = result;

        var itemData = itemDataPromise($q, $route, GILT, $http, $log, result);
        itemData.then(function(result){
            promiseData.item = result;
            deferred.resolve(promiseData);
        });

    });



    return deferred.promise;
}

var productDataPromise = function($q, $route, GILT, $http, $log){

    var deferred = $q.defer();


    var successCb = function (result)
    {
        deferred.resolve(result);
        $log.info(result);
    };

    var errorCb = function (error)
    {
        $log.info(error);
    };

    var uri = $route.current.params.uri.replace(/_/g,'/');
    var productURI = GILT.API + uri + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:productURI}).success(successCb).error(errorCb);

    return deferred.promise;
}

var itemDataPromise = function($q, $route, GILT, $http, $log){

    var deferred = $q.defer();


    var successCb = function (result)
    {
        deferred.resolve(result);
        $log.info(result);
    };

    var errorCb = function (error)
    {
        $log.info(error);
    };

    var id = $route.current.params.id.replace(/_/g,'/');
    var itemURI = GILT.API + id + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:itemURI}).success(successCb).error(errorCb);

    return deferred.promise;
}



var salePromise = function($q, $route, GILT, $http, $log){

    var deferred = $q.defer();
    var promiseData = {};

    var saleData = saleDataPromise($q, $route, GILT, $http, $log);
    saleData.then(function(result){
        promiseData.data = result;

        var itemData = saleItemPromise($q, $route, GILT, $http, $log, result);
        itemData.then(function(result){
            promiseData.item = result;
            deferred.resolve(promiseData);
        });

    });

    return deferred.promise;
}


var saleDataPromise = function($q, $route, GILT, $http, $log){

    var successCb = function (result)
    {
        deferred.resolve(result);
        $log.info(result);
    };

    var errorCb = function (error)
    {
        $log.info(error);
    };

    var deferred = $q.defer();
    var saleUrl = GILT.SALE + $route.current.params.type + GILT.ACTIVE + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:saleUrl}).success(successCb).error(errorCb);

    return deferred.promise;
}

var saleItemPromise = function($q, $route, GILT, $http, $log, result){

    var successCb = function (result)
    {
        deferred.resolve(result);
        $log.info(result);
    };

    var errorCb = function (error)
    {
        $log.info(error);
    };

    var deferred = $q.defer();
    var index = Math.floor(Math.random()*result.sales.length);
    var productURI = result.sales[index].sale + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:productURI}).success(successCb).error(errorCb);

    return deferred.promise;
}
