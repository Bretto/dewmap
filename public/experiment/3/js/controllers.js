'use strict';
/* App Controllers */

var controllers = angular.module('Box2dDom.controllers', []);



// inspired by: http://paal.org/blog/2012/07/06/running-box2d-on-server-with-node-js-via-socket-io/
controllers.controller('Box2dDomCtrl', function ($scope, $rootScope, $location, $browser, $log, Box2dDomModel){



    var divs = [];

// Keep a reference to the Box2D World
    var world;

// The scale between Box2D units and pixels
    var SCALE = 30;

//Create the ground
    var size = 50;
    var w = 500;
    var h = 500;

    var fps = 60;

// Multiply to convert degrees to radians.
    var D2R = Math.PI / 180;

// Multiply to convert radians to degrees.
    var R2D = 180 / Math.PI;

// 360 degrees in radians.
    var PI2 = Math.PI * 2;
    var interval;

//Cache the canvas DOM reference
    var canvas;

//Are we debug drawing
    var debug = false;

// Shorthand "imports"
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2AABB = Box2D.Collision.b2AABB,
        b2Body = Box2D.Dynamics.b2Body,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2Fixture = Box2D.Dynamics.b2Fixture,
        b2World = Box2D.Dynamics.b2World,
        b2MassData = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
        b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;



    world = new b2World(
        new b2Vec2(0, 10) //gravity
        , true //allow sleep
    );


    //setup debug draw
    var debugDraw = new b2DebugDraw();
    canvas = $("#canvas");
    debugDraw.SetSprite(canvas[0].getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);


    resizeHandler();
    $(window).bind('resize', resizeHandler);


    $scope.box2dDomModel = Box2dDomModel;


    $scope.addBox2dElem = function(elem){
        createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
        divs.push($(elem));
    }


    $scope.renderComplete = function(){
        init();
    }



    function init(){

        //bounding box
        createBox(0, 0 , w, 5, true);
        createBox(0, h , w, 5, true);
        createBox(0,0,5,h, true);
        createBox(w,0,5,h, true);

        animate();
    }




    function createDOMObjects(x, y, size, circle) {
        var domObj = {id:'foo'};
        var domPos = {left:x, top:y};
        var width = size / 2;
        var height = size / 2;

        var x = (domPos.left) + width;
        var y = (domPos.top) + height;
        var body = createBox(x,y,width,height, false, circle);
        body.m_userData = {domObj:domObj, width:width, height:height, circle: circle ? true : false, setup: true};
    }

    function createBox(x,y,width,height, isStatic, circle) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = isStatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
        bodyDef.position.x = x / SCALE;
        bodyDef.position.y = y / SCALE

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.5;
        fixDef.friction = 0.01;
        fixDef.restitution = .8;

        if (circle) {
            var circleShape = new b2CircleShape;
            circleShape.m_radius = width / SCALE;

            fixDef.shape = circleShape;
        } else {
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
        }
        return world.CreateBody(bodyDef).CreateFixture(fixDef);
    }

//Animate DOM objects
    function drawDOMObjects() {
        var ret = [];
        var i = 0;
        for (var b = world.m_bodyList; b; b = b.m_next) {
            for (var f = b.m_fixtureList; f; f = f.m_next) {
                if (f.m_userData) {
                    //Retrieve positions and rotations from the Box2d world
                    var x = Math.floor((f.m_body.m_xf.position.x * SCALE) -  f.m_userData.width);
                    var y = Math.floor((f.m_body.m_xf.position.y * SCALE) - f.m_userData.height);

                    //CSS3 transform does not like negative values or infitate decimals
                    var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
                    var css = {	'-webkit-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)',
                        '-moz-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)',
                        '-ms-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'  ,
                        '-o-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)',
                        'transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'};
                    // console.log(f.m_userData);
                    //if (f.m_userData.setup) {
                    if (f.m_userData.circle) {
                        css['-webkit-border-radius'] = css['-moz-border-radius'] = css['border-radius'] = f.m_userData.width  + 'px';
                    }
                    css['width'] = (f.m_userData.width * 2) + 'px';
                    css['height'] = (f.m_userData.height * 2) + 'px';
                    f.m_userData.setup = false;
                    //}
                    ret.push(css);
                }
            }
        }
        return ret;
    };




    function animate() {

        requestAnimationFrame(animate);

        render();
    }



    function render() {

        var data = drawDOMObjects();

        $log.info('data.length', data.length);

        for (var i = 0; i < data.length; i ++) {
            var css = data[i];
            var div = divs[i];
            div.css(css);
        }

        if (debug) {
            world.DrawDebugData();
        }


        updateMouseDrag();


        world.Step(
            1 / fps //frame-rate
            ,10 //velocity iterations
            ,10 //position iterations
        );

        world.ClearForces();
    }

    //Keep the canvas size correct for debug drawing
    function resizeHandler() {
        canvas.attr('width', 500);
        canvas.attr('height', 500);
    }


    //----------------------------------------------------

    var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
    var canvasPosition = getElementPosition(document.getElementById("canvas"));

    var mouse = MouseAndTouch(document, downHandler, upHandler, moveHandler);

    function downHandler(x,y) {
        isMouseDown = true;
        moveHandler(x,y);
    }

    function upHandler(x,y) {
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;
    }

    function moveHandler(x,y) {
        mouseX = (x - canvasPosition.x) / 30;
        mouseY = (y - canvasPosition.y) / 30;
    }

    function getBodyAtMouse() {
        mousePVec = new b2Vec2(mouseX, mouseY);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
        aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

        // Query the world for overlapping shapes.

        selectedBody = null;
        world.QueryAABB(getBodyCB, aabb);
        return selectedBody;
    }

    function getBodyCB(fixture) {
        if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                selectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    }

    function getElementPosition(element) {
        var elem=element, tagname="", x=0, y=0;

        while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
            y += elem.offsetTop;
            x += elem.offsetLeft;
            tagname = elem.tagName.toUpperCase();

            if(tagname == "BODY")
                elem=0;

            if(typeof(elem) == "object") {
                if(typeof(elem.offsetParent) == "object")
                    elem = elem.offsetParent;
            }
        }

        return {x: x, y: y};
    }


    function updateMouseDrag() {
        if(isMouseDown && (!mouseJoint)) {
            var body = getBodyAtMouse();
            if(body) {
                var md = new b2MouseJointDef();
                md.bodyA = world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(mouseX, mouseY);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
            }
        }

        if(mouseJoint) {
            if(isMouseDown) {
                mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
            } else {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }
    }


});























