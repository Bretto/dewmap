'use strict';
/* App Controllers */

var controllers = angular.module('myApp.controllers', []);


controllers.controller('AppCtrl', function ($scope, $rootScope, $log, AppModel, $location, $routeParams, LAYOUT){

    $scope.appModel = AppModel;

    $scope.onGrid = function(){
        AppModel.layout = LAYOUT.GRID;
        AppModel.controls.constraintToAxis = "none";
    }

    $scope.onSphere = function(){
        AppModel.layout = LAYOUT.SPHERE;
        AppModel.controls.constraintToAxis = "XY";
    }

    $scope.onDisk = function(){
        AppModel.layout = LAYOUT.DISK;
        AppModel.controls.constraintToAxis = "X";
    }

    $scope.onBack = function(){
        $location.path('nav');
    }

    $scope.onNext = function(item){
        var idx = AppModel.items.indexOf(item);
        var url = AppModel.items[idx + 1].id;
        $log.info(url);
        $location.path('experiment/'+url);
    }

    $scope.onPrevious = function(item){
        var idx = AppModel.items.indexOf(item);
        var url = AppModel.items[idx - 1].id;
        $location.path('experiment/'+url);
    }

    $scope.hasPrevious = function(item){
        var idx = AppModel.items.indexOf(item);
        return (idx > 0)? 'hasPrevious' : 'hasNonePrevious';
    }

    $scope.hasNext = function(item){
        var value = 'hasNoneNext';
        var idx = AppModel.items.indexOf(item);
        if(idx !== -1 && AppModel.items[idx++] && AppModel.items[idx++].name !== '' ){
            value = 'hasNext';
        }

        return value;
    }



});

// changes the url path and load the selected experiment
controllers.controller('ExperimentCtrl', function($scope, $rootScope, $log, AppModel, $routeParams, $location, LAYOUT){

    if(getItemById($routeParams.id)){
        $scope.appModel.currentItem = getItemById($routeParams.id);
    }else{
        $location.path('nav');
    }

    function getItemById(id){
        var currentItem = null;
        angular.forEach(AppModel.items, function(obj,i){
            if(obj.id === id){
                currentItem = obj;
            }
        })

        return currentItem;
    }


    var interfaceImg = $('#interface-img');
    var viewLoader = $('#view-loader');
    window.addEventListener( 'resize', onWindowResize, false );


    function onWindowResize() {

        viewLoader.width(interfaceImg.width());
        viewLoader.height(interfaceImg.height());

    }

    onWindowResize();

});

controllers.controller('NavCtrl', function($scope, $rootScope, $timeout, AppModel, LAYOUT, $location, $log){

    $scope.appModel.currentItem = null;


    function getShowObjects(objects){
        var showObjects = [];

        for (var i = 0; i < objects.length; i++) {
            var object = objects[ i ];
//            var objectScope = $(object.element).scope();
//            if(objectScope.item['show'])
                showObjects.push(object);
        }

        return showObjects;
    }



    function init(){

        if($scope.getControls())
        {

            AppModel.controls = $scope.getControls();
            var constraintToAxis =      AppModel.layout === LAYOUT.GRID     ? 'none' :
                                        AppModel.layout === LAYOUT.SPHERE   ? 'XY' :
                                        AppModel.layout === LAYOUT.DISK     ? 'X' :
                                        'none';

            AppModel.controls.constraintToAxis = constraintToAxis;

        }

        updateLayout();

        $scope.$watch(function() { return AppModel.layout }, function(newValue, oldValue){
            updateLayout();
        },true);

//        $log.info('animate INIT');
        $scope.animate();


    }



    function updateLayout(){

        var showObjects     = getShowObjects($scope.getObjects3D());

        // making sure that the tile are always in the same order
        if(showObjects[0].element.name !== 0)showObjects.reverse();


        var camera          = $scope.getCamera();
        var objects3DWrap   = $scope.getObjects3DWrap();

        var layout =    AppModel.layout === LAYOUT.GRID     ? AppModel.getGridLayout(showObjects, camera, objects3DWrap) :
                        AppModel.layout === LAYOUT.SPHERE   ? AppModel.getSphereLayout(showObjects, camera, objects3DWrap) :
                        AppModel.layout === LAYOUT.DISK     ? AppModel.getDiskLayout(showObjects, camera, objects3DWrap) :
                        AppModel.getGridLayout(showObjects, camera, objects3DWrap);

        $scope.transform(layout, 500);
    }


    $scope.onExperimentClick = function(item){
        $scope.appModel.currentItem = item;
        $location.path('experiment/'+item.id);
        $scope.stopAnimate();
    }


    $scope.renderComplete = function() {

        $timeout(function(){
            init();
        },0);

    }

    $scope.isExpEnabled = function(item){
        return (item.name === '') ? 'tileDisabled' : 'titleEnable';
    }

    $scope.getTileImgSrc = function(item){
        return (item.name === '') ? '/assets/img/exp-tile-empty.png' : '/assets/img/exp-tile.png' ;
    }

//    $scope.myFilter = function(){
//        updateLayout();
//    }
//
//    $scope.$watch(function() { return AppModel.items }, function(newValue, oldValue){
//        $scope.myFilter();
//    },true);

// removes the Detector.webgl dialog box
    $('#oldie').remove();



});
















