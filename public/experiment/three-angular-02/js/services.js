'use strict';


var services = angular.module('App.services', []);


services.constant('GILT', {
    ACTIVE : '/active.json',
    UPCOMING : '/upcoming.json',
    API : 'https://api.gilt.com/v1/',
    PRODUCT : 'https://api.gilt.com/v1/products/',
    SALE: 'https://api.gilt.com/v1/sales/',
    APIKEY: '?apikey=88658e0b728c695d6145ffde625f01f6',
    CALLBACK: '&callback=JSON_CALLBACK',
    METHOD: 'JSONP'
});

services.constant('OBJ3D', {
    SALE:[],
    PRODUCT:[],
    ITEM:[]
});

services.factory('MainModel', function ($http, $log, $rootScope, $routeParams, $location) {

    function capitaliseFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var mainModel = {
        root: ''
        ,productURI: ''
        ,productID: ''
        ,rootCrumb: ''
        ,productCrumb: ''
        ,itemCrumb: ''
        ,activeView:''
    };

    mainModel.breadcrumbs = function (rootCrumb, productCrumb,itemCrumb ){
        mainModel.rootCrumb = capitaliseFirstLetter(rootCrumb) + ' /';
        mainModel.productCrumb = (productCrumb)?  productCrumb + ' /' : '';
        mainModel.itemCrumb = itemCrumb;
    }

    mainModel.isNavActive = function (value){
        return (value === mainModel.root)? 'nav-active' : '';
    }

    return mainModel;
});


services.factory('Scene3DApi', function ($http, $log, $rootScope, $routeParams, $location) {


    function getHomeLayout(showObjects){

        var layout = [];


        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 100;
            objTarget.position.z = 200;



            layout[objId] = {obj:obj, objTarget:objTarget};
        }



        return layout;
    }

    function getSalesLayout_IN(showObjects){

        var layout = [];


        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 0;
            objTarget.position.z = 300;



            layout[objId] = {obj:obj, objTarget:objTarget};
        }



        return layout;
    }

    function getSalesLayout_OUT1(showObjects){

        var layout = [];


        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 800;
            objTarget.position.z = -800;



            layout[objId] = {obj:obj, objTarget:objTarget};
        }



        return layout;
    }

    function getSalesLayout_OUT2(showObjects){

        var layout = [];


        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 2300;
            objTarget.position.z = -3000;



            layout[objId] = {obj:obj, objTarget:objTarget};
        }



        return layout;
    }

    function getProductsLayout_IN(showObjects){

        var layout = [];

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 0;
            objTarget.position.z = 0;

            layout[objId] = {obj:obj, objTarget:objTarget};

        }
        return layout;
    }

    function getProductsLayout_OUT(showObjects){

        var layout = [];

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 1000;
            objTarget.position.z = -1500;

            layout[objId] = {obj:obj, objTarget:objTarget};

        }
        return layout;
    }

    function getProductLayout(showObjects, z){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = -120;
            objTarget.position.z = z;

            layout[objId] = {obj:obj, objTarget:objTarget};

        }



        return layout;
    }

    function getFlyOutLayout(showObjects){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 0;
            objTarget.position.z = -5000;
            objTarget.rotation.x = (Math.random()*180 + 90) * (Math.PI/180);
            objTarget.rotation.y = (Math.random()*180 - 90) * (Math.PI/180);
            objTarget.rotation.z = (Math.random()*180 + 90) * (Math.PI/180);

            layout[objId] = {obj:obj, objTarget:objTarget};
        }



        return layout;
    }



    var Scene3DApi = {
        getSalesLayout_IN:getSalesLayout_IN,
        getSalesLayout_OUT1:getSalesLayout_OUT1,
        getSalesLayout_OUT2:getSalesLayout_OUT2,
        getProductsLayout_IN:getProductsLayout_IN,
        getProductsLayout_OUT:getProductsLayout_OUT,
        getProductLayout:getProductLayout,
        getHomeLayout:getHomeLayout,
        getFlyOutLayout:getFlyOutLayout
    };

    return Scene3DApi;
});
