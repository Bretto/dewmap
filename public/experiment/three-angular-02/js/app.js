'use strict';



'use strict';

angular.module('App', ['App.filters', 'App.services', 'App.directives', 'App.controllers', 'ui.compat']).
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
                    promiseData:salePromise
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
                    promiseData:productPromise
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
                    promiseData:itemPromise
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


var productPromise = function ($q, $route, GILT, $http, $log, $stateParams) {

    var deferred = $q.defer();
    var promiseData = {};

    var productData = productDataPromise($q, $route, GILT, $http, $log, $stateParams);
    productData.then(function (result) {
        promiseData.data = result;
        if (result.products) {
            var products = productsPromise($q, $route, GILT, $http, $log, result, $stateParams);
            products.then(function (result) {
                promiseData.products = result;
                deferred.resolve(promiseData);
            });
        } else {
            deferred.resolve(promiseData);
        }

    });


    return deferred.promise;
}


var productsPromise = function ($q, $route, GILT, $http, $log, result, $stateParams) {

    var deferred = $q.defer();
    var finished = 0;
    var products = [];

    if (result.products) {
        var limit = Math.min(9, result.products.length);

        for (var i = 0; i < limit; i++) {
            (function (i) {
                var productUri = result.products[i];
                productItemPromise($q, $route, GILT, $http, $log, productUri).then(function (result) {
                    products.push(result);
                    if (++finished === limit) {
                        deferred.resolve(products);
                    }
                });
            }(i));
        }
    }

    return deferred.promise;
}

var productItemPromise = function ($q, $route, GILT, $http, $log, productUri) {

    var deferred = $q.defer();

    var successCb = function (result) {
        deferred.resolve(result);
        //$log.info(result);
    };

    var errorCb = function (error) {
        //$log.info(error);
    };


    var itemURI = productUri + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:itemURI}).success(successCb).error(errorCb);

    return deferred.promise;
}


var itemPromise = function ($q, $route, GILT, $http, $log, $stateParams) {

    var deferred = $q.defer();
    var promiseData = {};

    var productData = productDataPromise($q, $route, GILT, $http, $log, $stateParams);
    productData.then(function (result) {
        promiseData.data = result;

        var itemData = itemDataPromise($q, $route, GILT, $http, $log, result, $stateParams);
        itemData.then(function (result) {
            promiseData.item = result;
            deferred.resolve(promiseData);
        });

    });


    return deferred.promise;
}

var productDataPromise = function ($q, $route, GILT, $http, $log, $stateParams) {

    var deferred = $q.defer();


    var successCb = function (result) {
        deferred.resolve(result);
        //$log.info(result);
    };

    var errorCb = function (error) {
        //$log.info(error);
    };

    var uri = $stateParams.uri.replace(/_/g, '/');
    var productURI = GILT.API + uri + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:productURI}).success(successCb).error(errorCb);

    return deferred.promise;
}

var itemDataPromise = function ($q, $route, GILT, $http, $log, result, $stateParams) {

    var deferred = $q.defer();


    var successCb = function (result) {
        deferred.resolve(result);
        //$log.info(result);
    };

    var errorCb = function (error) {
        //$log.info(error);
    };

    var id = $stateParams.id.replace(/_/g, '/');
    var itemURI = GILT.API + id + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:itemURI}).success(successCb).error(errorCb);

    return deferred.promise;
}


var salePromise = function ($q, $route, GILT, $http, $log, $stateParams) {

    var deferred = $q.defer();
    var promiseData = {};

    var saleData = saleDataPromise($q, $route, GILT, $http, $log, $stateParams);
    saleData.then(function (result) {
        promiseData.data = result;

        var itemData = saleItemPromise($q, $route, GILT, $http, $log, result);
        itemData.then(function (result) {
            promiseData.item = result;
            deferred.resolve(promiseData);
        });

    });

    return deferred.promise;
}


var saleDataPromise = function ($q, $route, GILT, $http, $log, $stateParams) {

    var successCb = function (result) {
        deferred.resolve(result);
        //$log.info(result);
    };

    var errorCb = function (error) {
        //$log.info(error);
    };

    var deferred = $q.defer();
    var saleUrl = GILT.SALE + $stateParams.type + GILT.ACTIVE + GILT.APIKEY + GILT.CALLBACK;
    //var saleUrl = GILT.SALE + $route.current.params.type + GILT.ACTIVE + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:saleUrl}).success(successCb).error(errorCb);

    return deferred.promise;
}

var saleItemPromise = function ($q, $route, GILT, $http, $log, result) {

    var successCb = function (result) {
        deferred.resolve(result);
        //$log.info(result);
    };

    var errorCb = function (error) {
        //$log.info(error);
    };

    var deferred = $q.defer();
    var index = Math.floor(Math.random() * result.sales.length);
    var productURI = result.sales[index].sale + GILT.APIKEY + GILT.CALLBACK;
    $http({method:GILT.METHOD, url:productURI}).success(successCb).error(errorCb);

    return deferred.promise;
}






//angular.module('App', ['App.filters', 'App.services', 'App.directives', 'App.controllers', 'ui.compat']).
//    config(function ($stateProvider, $urlRouterProvider, $routeProvider, $locationProvider) {
//
//        $stateProvider
//            .state('products', {
//                url:'/products',
//                views:{
//                    'products':{
//                        templateUrl:'partial/products.html',
//                        controller:'ProductsCtrl'
//                    }
//                },
//                resolve:{
//                    promiseData:productsPromise
//                },
//                onEnter:function ($rootScope, $state, $log) {
//                    $rootScope.$broadcast('PRODUCTS:onEnter');
//                },
//                onExit:function ($rootScope, $state) {
//                    $rootScope.$broadcast('PRODUCTS:onExit');
//                }
//            })
//            .state('products.product', {
//                url:'/:id',
//                views:{
//                    'product':{
//                        templateUrl:'partial/product.html',
//                        controller:'ProductCtrl'
//                    }
//                },
//                resolve:{
//                    promiseData:productPromise
//                },
//                onEnter:function ($rootScope, $state, $log) {
//                    $rootScope.$broadcast('PRODUCT:onEnter');
//                },
//                onExit:function ($rootScope, $state) {
//                    $rootScope.$broadcast('PRODUCT:onExit');
//                }
//            })
//
//        //$urlRouterProvider.otherwise('/');
//
//    })
//    .run(
//    function ($rootScope, $state, $stateParams) {
//        $rootScope.$state = $state;
//        $rootScope.$stateParams = $stateParams;
//    });


//var productsPromise = function ($q, $route, $http, $log, $stateParams, $timeout) {
//
//    function makeObj(i){
//        return {title:'Product: ' + i}
//    }
//
//    var deferred = $q.defer();
//    var promiseData = [];
//
//    for (var i = 0; i < 10; i++) {
//        promiseData.push(makeObj(i));
//    }
//
//    $timeout(function(){deferred.resolve(promiseData); },0);
//
//    return deferred.promise;
//}


//var productsPromise = function ($q, $route, $http, $log, $stateParams, $timeout) {
//
//    var api_key, deferred, params, url;
//    deferred = $q.defer();
//    api_key = '2bb0b524a3e3cbb9ceaea74b30dabf93';
//    url = 'http://api.flickr.com/services/rest/';
//    params = {
//        method: 'flickr.photos.search',
//        api_key: api_key,
//        text: 'cameleon',
//        per_page: 22,
//        content_type: 1,
//        in_gallery: true,
//        format: 'json',
//        page: 1,
//        jsoncallback: 'JSON_CALLBACK'
//    };
//    $http.jsonp(url, {
//        params: params
//    }).success(function(data, status, headers, config) {
//            var page_info, photos;
//            page_info = {};
//            page_info.page = data.photos.page;
//            page_info.pages = data.photos.pages;
//
//            photos = $.map(data.photos.photo, function(photo) {
//                return {
//                    title: photo.title,
//                    thumb_src: "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg",
//                    src: "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg"
//                };
//            });
//            return deferred.resolve(photos);
//        });
//    return deferred.promise;
//}






//var productPromise = function ($q, $route, $http, $log, $stateParams, $timeout) {
//
//    var deferred = $q.defer();
//    var promiseData = {title:$stateParams.id};
//
//    $timeout(function(){deferred.resolve(promiseData); },0);
//
//    return deferred.promise;
//}