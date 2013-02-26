/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */



THREE.CSS3DRenderer = function (domElement, cameraElement, projector) {

    console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

    var _width, _height;
    var _widthHalf, _heightHalf;
    var _projector = projector;

    this.domElement = domElement;

    this.cameraElement = cameraElement;


    this.setSize = function ( width, height ) {

        _width = width;
        _height = height;

        _widthHalf = _width / 2;
        _heightHalf = _height / 2;

        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';

        this.cameraElement.style.width = width + 'px';
        this.cameraElement.style.height = height + 'px';

    };

    var epsilon = function ( value ) {

        return Math.abs( value ) < 0.000001 ? 0 : value;

    };

    var getCameraCSSMatrix = function ( matrix ) {

        var elements = matrix.elements;

        return 'matrix3d(' +
            epsilon( elements[ 0 ] ) + ',' +
            epsilon( - elements[ 1 ] ) + ',' +
            epsilon( elements[ 2 ] ) + ',' +
            epsilon( elements[ 3 ] ) + ',' +
            epsilon( elements[ 4 ] ) + ',' +
            epsilon( - elements[ 5 ] ) + ',' +
            epsilon( elements[ 6 ] ) + ',' +
            epsilon( elements[ 7 ] ) + ',' +
            epsilon( elements[ 8 ] ) + ',' +
            epsilon( - elements[ 9 ] ) + ',' +
            epsilon( elements[ 10 ] ) + ',' +
            epsilon( elements[ 11 ] ) + ',' +
            epsilon( elements[ 12 ] ) + ',' +
            epsilon( - elements[ 13 ] ) + ',' +
            epsilon( elements[ 14 ] ) + ',' +
            epsilon( elements[ 15 ] ) +
            ')';

    }

    this.getObjectCSSMatrix = function ( matrix ) {

        var elements = matrix.elements;

        return 'translate3d(-50%,-50%,0) matrix3d(' +
            epsilon( elements[ 0 ] ) + ',' +
            epsilon( elements[ 1 ] ) + ',' +
            epsilon( elements[ 2 ] ) + ',' +
            epsilon( elements[ 3 ] ) + ',' +
            epsilon( elements[ 4 ] ) + ',' +
            epsilon( elements[ 5 ] ) + ',' +
            epsilon( elements[ 6 ] ) + ',' +
            epsilon( elements[ 7 ] ) + ',' +
            epsilon( elements[ 8 ] ) + ',' +
            epsilon( elements[ 9 ] ) + ',' +
            epsilon( elements[ 10 ] ) + ',' +
            epsilon( elements[ 11 ] ) + ',' +
            epsilon( elements[ 12 ] ) + ',' +
            epsilon( elements[ 13 ] ) + ',' +
            epsilon( elements[ 14 ] ) + ',' +
            epsilon( elements[ 15 ] ) +
            ') scale3d(1,-1,1)';

    }

    this.render = function ( scene, camera ) {

        var fov = 0.5 / Math.tan( camera.fov * Math.PI / 360 ) * _height;

        this.domElement.style.WebkitPerspective = fov + "px";
        this.domElement.style.MozPerspective = fov + "px";
        this.domElement.style.oPerspective = fov + "px";
        this.domElement.style.perspective = fov + "px";

        var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

        this.cameraElement.style.WebkitTransform = style;
        this.cameraElement.style.MozTransform = style;
        this.cameraElement.style.oTransform = style;
        this.cameraElement.style.transform = style;

        var objects = _projector.projectScene( scene, camera, false ).objects;

        for ( var i = 0, il = objects.length; i < il; i ++ ) {

            var object = objects[ i ].object;

                var element = object.element;

                style = this.getObjectCSSMatrix( object.matrixWorld );

                if(element){
                    element.style.WebkitTransform = style;
                    element.style.MozTransform = style;
                    element.style.oTransform = style;
                    element.style.transform = style;
                }

        }

    };

};











