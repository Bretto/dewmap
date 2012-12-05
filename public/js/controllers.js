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
        $scope.appModel.currentItem = null;
    }

    $scope.onNext = function(){
        $scope.appModel.currentItem = $scope.appModel.items[1];
        //$location.path('nav');
    }



});

// changes the url path and load the selected experiment
controllers.controller('ExperimentCtrl', function($scope, $rootScope, $log, AppModel, $routeParams, $location, LAYOUT){

    if(getItemById($routeParams.idx)){
        $scope.appModel.currentItem = getItemById($routeParams.idx);
    }else{
        $location.path('nav');
    }

    function getItemById(idx){
        var currentItem = null;
        angular.forEach(AppModel.items, function(obj,i){
            if(obj.idx === parseInt(idx)){
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
//        $('body').css('backgroundColor', '#ff0000');
        $scope.appModel.currentItem = item;
        $location.path('experiment/'+item.idx);
        $scope.stopAnimate();
    }


//    $scope.addItem = function(item) {
//        addObject3D(item);
//    }

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
















