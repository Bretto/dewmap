'use strict';


var services = angular.module('GiltApp.services', []);

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

services.constant('LAYOUT', {
    GRID : 'grid',
    SPHERE : 'sphere',
    DISK : 'disk'

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


services.factory('Scene3DApi', function ($http, $log, $rootScope, $routeParams, $location, LAYOUT) {


    function getSalesLayout(showObjects, camera){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = ( col * 320 ) - 345;
            objTarget.position.y = ( row * 210 ) - 190;

            row = col === 2 ? ++row : row;
            col = col === 2 ? 0 : ++col;

            layout[objId] = {obj:obj, objTarget:objTarget};
        }

        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 630;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        return layout;
    }

    function getProductsLayout(showObjects, camera){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = ( col * 320 ) - 345;
            objTarget.position.y = ( row * 430 ) - 200;

            row = col === 2 ? ++row : row;
            col = col === 2 ? 0 : ++col;
            //console.log(row);

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        return layout;
    }

    function getProductLayout(showObjects, camera){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = 0;
            objTarget.position.y = 0;

            layout[objId] = {obj:obj, objTarget:objTarget};

        }


        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 620;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:camera, objTarget:cameraTarget};


        return layout;
    }

    function getFlyOutLayout(showObjects, camera){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {

            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = Math.random()*10000 - 5000;
            objTarget.position.y = 5000;
            objTarget.position.z = -5000;
            objTarget.rotation.x = (Math.random()*360 + 180) * (Math.PI/180);
            objTarget.rotation.y = (Math.random()*360 + 180) * (Math.PI/180);
            objTarget.rotation.z = (Math.random()*360 + 180) * (Math.PI/180);

            layout[objId] = {obj:obj, objTarget:objTarget};
        }

        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        return layout;
    }



    var Scene3DApi = {
        getSalesLayout:getSalesLayout,
        getProductsLayout:getProductsLayout,
        getProductLayout:getProductLayout,
        getFlyOutLayout:getFlyOutLayout
    };

    return Scene3DApi;
});
