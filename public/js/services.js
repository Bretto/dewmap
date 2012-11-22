'use strict';


var services = angular.module('myApp.services', []);


services.constant('LAYOUT', {

    GRID : 'grid',
    SPHERE : 'sphere',
    DISK : 'disk'

});

services.factory('AppModel', function ($http, $log, $rootScope, $routeParams, $location, LAYOUT) {


    function getGridLayout(showObjects, camera, objects3DWrap ){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {


            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = ( col * 220 ) - 330;
            objTarget.position.y = -( row * 200 ) + 300;

            row = col === 3 ? ++row : row;
            col = col === 3 ? 0 : ++col;
            //console.log(row);

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        var itemsTarget = new THREE.Object3D();
        layout['itemsObj3D'] = {obj:objects3DWrap, objTarget:itemsTarget};


        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        itemsTarget = null;
        cameraTarget = null;

        return layout;
    }

    function getSphereLayout(showObjects, camera, objects3DWrap ){

        var layout = {};
        var vector = new THREE.Vector3();

        for (var i = 0, l = showObjects.length; i < l; i++) {

            var object = showObjects[ i ];

            var phi = Math.acos(-1 + ( 2 * i ) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            var ray = 350;

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();


            objTarget.position.x = ray * Math.cos(theta) * Math.sin(phi);
            objTarget.position.y = ray * Math.sin(theta) * Math.sin(phi);
            objTarget.position.z = ray * Math.cos(phi);

            vector.copy(objTarget.position).multiplyScalar(2);

            objTarget.lookAt(vector);

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        var itemsTarget = new THREE.Object3D();
        itemsTarget.rotation.y = Math.PI;
        layout['itemsObj3D'] = {obj:objects3DWrap, objTarget:itemsTarget};

        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;
        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        return layout;
    }

    function getDiskLayout(showObjects, camera, objects3DWrap ){

        var layout = {};
        var vector = new THREE.Vector3();
        var angleIncrement = 360 / showObjects.length;
        var circleRadius = 650;
        for (var i = 0; i < showObjects.length; i++) {

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = (circleRadius * Math.cos((angleIncrement * i) * (Math.PI / 180)));
            objTarget.position.y = (circleRadius * Math.sin((angleIncrement * i) * (Math.PI / 180)));
            objTarget.rotation.x = Math.PI/2;
            objTarget.rotation.y = Math.atan2(objTarget.position.y, objTarget.position.x) + Math.PI/2;

            layout[objId] = {obj:obj, objTarget:objTarget};
        }

        var itemsTarget = new THREE.Object3D();
        itemsTarget.rotation.x = Math.PI/2;
        layout['itemsObj3D'] = {obj:objects3DWrap, objTarget:itemsTarget};


        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 1100;
        cameraTarget.rotation.z = 0;
        layout['camera'] = {obj:camera, objTarget:cameraTarget};

        return layout;
    }








    var items = [];

    for(var i=0; i<1; i++)
    {
        var idx = (i+1);
        items.push({name:'Dynamic filter system Angularjs ' + idx, url:'comp'+ idx, idx:idx})
    }


    var AppModel = {
        items : items,
        layout: LAYOUT.GRID,
        currentItem: null,
        controls: null,
        getGridLayout:getGridLayout,
        getSphereLayout:getSphereLayout,
        getDiskLayout:getDiskLayout
    };



    return AppModel;
});
