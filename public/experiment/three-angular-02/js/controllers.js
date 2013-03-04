'use strict';
/* App Controllers */

var controllers = angular.module('App.controllers', []);

controllers.controller('MainCtrl', function ($scope, $rootScope, $timeout, $log, Scene3DApi){
    $log.info('MainCtrl');
});

controllers.controller('MainContentCtrl', function ($scope, $rootScope, $timeout, $compile, $log, MainModel){
    $log.info('MainContentCtrl');

    $scope.$on('$stateChangeSuccess', function(e, to, from){
        $log.info('$stateChangeSuccess', 'PRODUCT');

        if(to.url === '/sale/:type'){
            $log.info('Sale:ACTIVE');
            MainModel.activeView = 'SALE';
        }else if(to.url === '/product/:uri'){
            MainModel.activeView = 'PRODUCT';
        }else if(to.url === '/item/:id'){
            MainModel.activeView = 'ITEM';
        }else if(to.url === '/'){
            MainModel.activeView = 'HOME';
        }
    });
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

    var homeObj3Ds = [];

    $scope.MainModel = MainModel;
    MainModel.root = 'welcome';

    MainModel.breadcrumbs(MainModel.root);

    $scope.$on('$stateChangeSuccess', function(e, to, from){
        $log.info('$stateChangeSuccess', 'HOME');
        if(MainModel.activeView === 'HOME'){

            $scope.transform(Scene3DApi.getHomeLayout(homeObj3Ds), 500);
        }
    });


    $scope.$on('addObj3D', function(e,obj3D){
        //$log.info('addObj3D', 'HOME')
        e.stopPropagation();
        homeObj3Ds.push(obj3D);
    });

    $scope.$on('render3dComplete', function(e,obj3D){
        //$log.info('render3dComplete', 'HOME');
        e.stopPropagation();
        $scope.setInitPosition(Scene3DApi.getFlyOutLayout(homeObj3Ds,$scope.getCamera()));
        $scope.transform(Scene3DApi.getHomeLayout(homeObj3Ds), 500);
    })


});

controllers.controller('SalesCtrl', function ($scope, MainModel, $log, promiseData, Scene3DApi, $stateParams, $state, $timeout, OBJ3D, $location){
    $log.info('SalesCtrl');

    $scope.MainModel = MainModel;
    MainModel.root = $stateParams.type;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;

    MainModel.breadcrumbs(MainModel.root + ' sales');

    $scope.$on('$stateChangeSuccess', function(e, to, from){
        $log.info('$stateChangeSuccess', 'PRODUCT');
        if(MainModel.activeView === 'SALE'){

            $scope.transform(Scene3DApi.getSalesLayout_IN(OBJ3D.SALE), 500);
        }
    });

    $scope.isOut = function(){
        return (MainModel.activeView === 'SALE')? false:true;
    }

    $scope.$on('Sale:onEnter', function(){
        $log.info('Sale:onEnter');
    });

    $scope.$on('Sale:onExit', function(){
        $log.info('Sale:onExit');
        OBJ3D.SALE = [];
    });

    $scope.$on('addObj3D', function(e,obj3D){
        //$log.info('addObj3D', 'SALES')
        e.stopPropagation();
        OBJ3D.SALE.push(obj3D);
    });

    $scope.$on('render3dComplete', function(e,obj3D){
        $log.info('render3dComplete', 'SALES');
        e.stopPropagation();
        $scope.setInitPosition(Scene3DApi.getFlyOutLayout(OBJ3D.SALE));

        if(MainModel.activeView === "SALE"){
            $scope.transform(Scene3DApi.getSalesLayout_IN(OBJ3D.SALE), 500);
        }else if(MainModel.activeView === "PRODUCT"){
            $scope.transform(Scene3DApi.getSalesLayout_OUT1(OBJ3D.SALE), 500);
        }else if(MainModel.activeView === "ITEM"){
            $scope.transform(Scene3DApi.getSalesLayout_OUT2(OBJ3D.SALE), 500);
        }

    })


});

controllers.controller('ProductsCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, Scene3DApi, $stateParams, OBJ3D){
    $log.info('ProductsCtrl');


    $scope.MainModel = MainModel;
    MainModel.root = $stateParams.type;
    MainModel.productURI = $stateParams.uri;

    $scope.data = promiseData.data;
    $scope.products = promiseData.products;
    $scope.isSoldOut = (promiseData.products) ? false : true;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name );

    $scope.$on('$stateChangeSuccess', function(e, to, from){
        $log.info('$stateChangeSuccess', 'SALE');

        if(to.url === '/product/:uri'){
            $log.info('Product:ACTIVE');
            $scope.transform(Scene3DApi.getSalesLayout_OUT1(OBJ3D.SALE), 500);
            $scope.transform(Scene3DApi.getProductsLayout_IN(OBJ3D.PRODUCT), 500);
        }
    });

    $scope.isOut = function(){
        return (MainModel.activeView === 'PRODUCT')? false:true;
    }

    $scope.$on('Product:onEnter', function(){
        $log.info('Product:onEnter');
    });

    $scope.$on('Product:onExit', function(e,state,stateParams){
        $log.info('Product:onExit');
        MainModel.productCrumb = '';
        OBJ3D.PRODUCT = [];
    });

    $scope.$on('addObj3D', function(e,obj3D){
        //$log.info('addObj3D', 'PRODUCT')
        e.stopPropagation();
        OBJ3D.PRODUCT.push(obj3D);
    });

    $scope.$on('render3dComplete', function(e,obj3D){
        //$log.info('render3dComplete', 'PRODUCT')
        e.stopPropagation();
        $scope.setInitPosition(Scene3DApi.getFlyOutLayout(OBJ3D.PRODUCT));

        var z;
        if(MainModel.activeView === "PRODUCT"){
            $scope.transform(Scene3DApi.getProductsLayout_IN(OBJ3D.PRODUCT), 500);
        }else if(MainModel.activeView === "ITEM"){
            $scope.transform(Scene3DApi.getProductsLayout_OUT(OBJ3D.PRODUCT), 500);
        }


    })

});

controllers.controller('ProductCtrl', function ($scope, $log, $routeParams, GILT, $http, MainModel, promiseData, $timeout, Scene3DApi, $stateParams, OBJ3D){
    $log.info('ProductCtrl');



    $scope.MainModel = MainModel;
    MainModel.root = $stateParams.type;
    MainModel.productURI = $stateParams.uri;
    MainModel.productID = $stateParams.id;

    $scope.data = promiseData.data;
    $scope.item = promiseData.item;

    MainModel.breadcrumbs(MainModel.root + ' sales', promiseData.data.name, promiseData.item.name );



    $scope.$on('$stateChangeSuccess', function(e, to, from){
        $log.info('$stateChangeSuccess', 'PRODUCT');

        if(to.url === '/item/:id'){
            $log.info('Product:ACTIVE');
            $scope.transform(Scene3DApi.getSalesLayout_OUT2(OBJ3D.SALE), 500);
            $scope.transform(Scene3DApi.getProductsLayout_OUT(OBJ3D.PRODUCT), 500);
        }
    });

    $scope.$on('$routeChangeStart', function(){
        $scope.layoutFn = Scene3DApi.getFlyOutLayout;
    })

    $scope.$on('addObj3D', function(e,obj3D){
        //$log.info('addObj3D', 'ITEM')
        e.stopPropagation();
        OBJ3D.ITEM.push(obj3D);
    });

    $scope.$on('render3dComplete', function(e,obj3D){
        //$log.info('render3dComplete', 'ITEM')
        e.stopPropagation();
        $scope.setInitPosition(Scene3DApi.getFlyOutLayout(OBJ3D.ITEM));
        $scope.transform(Scene3DApi.getProductLayout(OBJ3D.ITEM,0), 500);
    })

    $scope.$on('Item:onEnter', function(){
        $log.info('Item:onEnter');
    });

    $scope.$on('Item:onExit', function(){
        $log.info('Item:onExit');
        MainModel.itemCrumb = '';
        OBJ3D.ITEM = [];
//        $scope.transform(Scene3DApi.setDepthPosition(OBJ3D.SALE, -500), 1000);
//        $scope.transform(Scene3DApi.setDepthPosition(OBJ3D.PRODUCT, 0), 1000);
    });

});

















