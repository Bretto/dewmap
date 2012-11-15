/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.TrackYControls = function ( object, domElement ) {

    THREE.EventTarget.call( this );

    var _this = this;
    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API

    this.enabled = true;

    this.screen = { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 };
    this.radius = ( this.screen.width + this.screen.height ) / 4;

    this.rotateSpeed = 1.0;

    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.camRadian;
    this.theta = 0;


    // internals

    this.target = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();

    var _state = STATE.NONE,
        _prevState = STATE.NONE,

        _eye = new THREE.Vector3(),

        _rotateStart = new THREE.Vector3(),
        _rotateEnd = new THREE.Vector3(),

        _zoomStart = new THREE.Vector2(),
        _zoomEnd = new THREE.Vector2()


    // events

    var changeEvent = { type: 'change' };


    // methods

    this.handleResize = function () {

        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;

        this.screen.offsetLeft = 0;
        this.screen.offsetTop = 0;

        this.radius = ( this.screen.width + this.screen.height ) / 4;
    };

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] == 'function' ) {

            this[ event.type ]( event );

        }

    };

    this.getMouseOnScreen = function ( clientX, clientY ) {

        return new THREE.Vector2(
            ( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
            ( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
        );

    };



    this.rotateCamera = function () {

        _rotateStart.x += ( _rotateEnd.x - _rotateStart.x ) * this.dynamicDampingFactor;
        this.theta -=  (_rotateEnd.x - _rotateStart.x) * 100;

        _this.object.position.x = 1200 * Math.sin( this.theta * Math.PI / 360 );
        _this.object.position.y = 0;
        _this.object.position.z = 1200 * Math.cos( this.theta * Math.PI / 360 );

//        console.log('cam',_this.object.position);

//        _this.target = new THREE.Vector3(   1200 * Math.sin( this.theta * Math.PI / 360 ),
//                                            0,
//                                            1200 * Math.cos( this.theta * Math.PI / 360 ));

//        console.log('target', _this.target);

//        _this.object.position.x = _this.target.x;
//        _this.object.position.y = _this.target.y;
//        _this.object.position.z = _this.target.z;


        //_this.object.position.addSelf(this.target);

//        var ang = Math.atan2(this.object.position.z, this.object.position.x);
//        console.log(ang * ( 180/ Math.PI));

//        var ang2 = console.log(Math.atan(tan));



    };



    this.update = function () {

//        console.info(this.object.position.x, this.object.position.z);

        _eye.copy( _this.object.position ).subSelf( _this.target );

        _this.rotateCamera();

//        console.log(_this.object.position);

//       _this.object.position.add( _this.target, _eye );


        this.camRadian = Math.atan2( this.object.position.z, this.object.position.x);


        _this.object.lookAt( _this.target );

        if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {

            _this.dispatchEvent( changeEvent );

            lastPosition.copy( _this.object.position );
        }

    };



    function mousedown( event ) {


//        console.info('mousedown', _rotateStart);


        if ( ! _this.enabled ) return;

        event.preventDefault();
        event.stopPropagation();

        if ( _state === STATE.NONE ) {

            _state = event.button;

        }

        _rotateStart = _rotateEnd = _this.getMouseOnScreen( event.clientX, event.clientY );


        document.addEventListener( 'mousemove', mousemove, false );
        document.addEventListener( 'mouseup', mouseup, false );

    }

    function mousemove( event ) {

        if ( ! _this.enabled ) return;

        _rotateEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

    }

    function mouseup( event ) {

        if ( ! _this.enabled ) return;

        event.preventDefault();
        event.stopPropagation();

        _state = STATE.NONE;

        document.removeEventListener( 'mousemove', mousemove );
        document.removeEventListener( 'mouseup', mouseup );

    }


//    this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

    this.domElement.addEventListener( 'mousedown', mousedown, false );


    this.handleResize();

};
