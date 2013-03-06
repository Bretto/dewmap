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
        ,isGrid: true
    };

    mainModel.breadcrumbs = function (rootCrumb, productCrumb,itemCrumb ){

        mainModel.rootCrumb = capitaliseFirstLetter(rootCrumb) + ' /';
        mainModel.productCrumb = (productCrumb)?  productCrumb + ' /' : '';
        mainModel.itemCrumb = itemCrumb;

    }

    mainModel.listLayout = function (){
        return (mainModel.isGrid)? 'thumbnails' : 'rows';
    }

    mainModel.isNavActive = function (value){
        return (value === mainModel.root)? 'nav-active' : '';
    }

    mainModel.isEdgeActive = function (value){
        return (value === mainModel.root)? 'edge-active' : '';
    }

    mainModel.extruderAccent = function(){
        return 'extruder-' + mainModel.root;
    }

    mainModel.thumbnailAccent = function(){
        return 'thumbnail-' + mainModel.root;
    }

    return mainModel;
});



