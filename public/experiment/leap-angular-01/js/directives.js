'use strict';

var directives = angular.module('LeapApp.directives', []);

directives.directive('dpHot', function ($log, $parse, $rootScope, $timeout, MainModel) {

    function link(scope, elem, attr, ctrl) {

        scope.MainModel = MainModel;
        scope.hasTrigger = false;
        var css = attr.dpHot;
        var timeBegan;
        var elemPos = getPos(elem);
        $log.info(elemPos);

        $rootScope.$on('leapData', function (e, leapData) {

            if (leapData.pointables && leapData.pointables.length === 1) {


                var leapX = leapData.pointables[0].tipPosition[0];
                var leapY = leapData.pointables[0].tipPosition[1];

                var pointerPos = {x:(leapX * 5) + window.innerWidth / 2 , y:window.innerHeight - ((leapY * 5) - 700) };


                var x = pointerPos.x - elemPos.centerX;
                var y = pointerPos.y - elemPos.centerY;

                var hypot = Math.sqrt(x * x + y * y);
                //$log.info(hypot);

                if ((hypot < 50 || inPerimeter(pointerPos, elemPos)&& scope.hasTrigger == false)) {

                    timeBegan = (timeBegan) ? timeBegan : leapData.timestamp;

                    if (leapData.timestamp - timeBegan > 400000) {
                        scope.isHot = true;
                        elem.addClass(css);
                        scope.$digest();
                    }

                } else {
                    timeBegan = undefined;
                    elem.removeClass(css);
                    scope.isHot = false;
                    scope.$digest();
                }
            }
        });

        function inPerimeter(pointerPos, elemPos) {
            var v = false;

            if((pointerPos.x > elemPos.x && pointerPos.x < elemPos.x + elemPos.w) &&
            (pointerPos.y > elemPos.y && pointerPos.y < elemPos.y + elemPos.h)){
                v = true;
            }

            return v
        }

        function getPos(elem) {

            var h = elem.innerHeight();
            var w = elem.innerWidth();
            var x = elem.prop('offsetLeft');
            var y = elem.prop('offsetTop');


            return {
                centerX:x + w/2,
                centerY:y + h/2,
                x:x,
                y:y,
                w:w,
                h:h

            };
        }
    }

    return {
        scope:{},
        restrict:'A',
        link:link
    }
});

directives.directive('dpShot', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {



        $rootScope.$on('leapData', function (e, leapData) {

            if (scope.isHot) {
                if (leapData.pointables && leapData.pointables.length === 1) {
                    var pointable = leapData.pointables[0];

                    var v = Math.abs(pointable.tipVelocity[1]);

                    if (v > 200 && scope.hasTrigger === false) {
                        //$log.info('tap');
                        $(elem).trigger("click");
                        scope.hasTrigger = true;
                        $timeout(function () {
                            scope.hasTrigger = false;
                        }, 250);
                    }
                }
            }

        });


    }

    return {

        restrict:'A',
        link:link
    }
});


directives.directive('dpSlap', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var direction;

        $rootScope.$on('leapData', function (e, leapData) {

            if (scope.isHot) {
                if (leapData.pointables && leapData.pointables.length === 1) {
                    var pointable = leapData.pointables[0];

                    var v = pointable.tipVelocity[0];
                    direction = (v > 0)? 'right' : 'left';


                    if (Math.abs(v) > 700 && scope.hasTrigger === false) {
                        //$log.info('tap');
                        var event = jQuery.Event("click");
                        event.direction = direction;

                        $(elem).trigger(event);
                        scope.hasTrigger = true;
                        $timeout(function () {
                            scope.hasTrigger = false;
                        }, 300);
                    }
                }
            }

        });


    }

    return {

        restrict:'A',
        link:link
    }
});

directives.directive('pointer', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        function move(pointer, posX, posY) {
            pointer.style.webkitTransform = "translateX(" + posX + "px) translateY(" + posY + "px)";
            pointer.style.transform = "translateX(" + posX + "px) translateY(" + posY + "px)";
        }


        $rootScope.$on('leapData', function (e, leapData) {


            if (leapData.pointables && leapData.pointables.length === 1) {
                var x = leapData.pointables[0].tipPosition[0];
                var y = leapData.pointables[0].tipPosition[1];

                var posX = (x * 5) + window.innerWidth / 2;
                var posY = window.innerHeight - ((y * 5) - 700);

                move(elem[0], posX, posY);
            }

        });


    }

    return {

        restrict:'A',
        link:link
    }
});


directives.directive('leapPlanar', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        $log.info('est');

        var canvasPlanar = elem[0];// elem.find("canvas:first")[0];
        var ctxPlanar = canvasPlanar.getContext("2d");


        var x = d3.scale.linear().range([0, canvasPlanar.width]).domain([-200, 200]);
        var y = d3.scale.linear().range([canvasPlanar.height, 0]).domain([0, 400]);


        function renderPointablesPlanar(obj) {

            ctxPlanar.fillStyle = "rgba(0,0,0,.3)";
            ctxPlanar.fillRect(0, 0, canvasPlanar.width, canvasPlanar.height);
            ctxPlanar.fillStyle = 'rgba(255, 0, 0, 1)';

            if ("pointables" in obj) {
                obj.pointables.forEach(function (p) {
                    var pos = p.tipPosition;
                    ctxPlanar.fillRect(x(pos[0]), y(pos[1]), 4, 4);
                });
            }
        };

        $rootScope.$on('leapData', function (e, leapData) {
            renderPointablesPlanar(leapData);
        });

    }

    return {
        replace:true,
        templateUrl:'templates/leap-planar.html',
        scope:{},
        restrict:'E',
        link:link
    }
});

directives.directive('leapGraph', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var canvasPlanar = elem[0];// elem.find("canvas:first")[0];
        var ctxPlanar = canvasPlanar.getContext("2d");
        ctxPlanar.fillStyle = "rgba(0,0,0,1)";
        ctxPlanar.fillRect(0, 0, canvasPlanar.width, canvasPlanar.height);

        var y = d3.scale.linear().range([canvasPlanar.height / 2, -canvasPlanar.height / 2]).domain([1000, -1000]);

        function shift_canvas(ctx, w, h, dx, dy) {
            var imageData = ctx.getImageData(0, 0, w, h);
            ctx.clearRect(0, 0, w, h);
            ctx.putImageData(imageData, dx, dy);
        }

        function renderPointablesPlanar(leapData) {

            var r = (attr.color === 'r') ? 255 : 0;
            var g = (attr.color === 'g') ? 255 : 0;
            var b = (attr.color === 'b') ? 255 : 0;

            var grd = ctxPlanar.createLinearGradient(0, 0, 0, canvasPlanar.height);

            grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')');
            grd.addColorStop(.5, 'rgba(' + r + ',' + g + ',' + b + ',' + .3 + ')');
            grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')');

            ctxPlanar.fillStyle = grd;


            //ctxPlanar.fillStyle = 'rgba(255, 0, 0, .5)';
            shift_canvas(ctxPlanar, canvasPlanar.width, canvasPlanar.height, -1, 0);

            if (leapData.pointables && leapData.pointables.length === 1) {
                var pointable = leapData.pointables[0];
                var pos = pointable.tipVelocity[ attr.prop ];
                ctxPlanar.fillRect(canvasPlanar.width - 1, canvasPlanar.height / 2, 1, 1);
                ctxPlanar.fillRect(canvasPlanar.width - 1, canvasPlanar.height / 2, 1, -y(pos));
            }

        };

        $rootScope.$on('leapData', function (e, leapData) {
            renderPointablesPlanar(leapData);
        });

    }

    return {
        replace:true,
        templateUrl:'templates/leap-graph.html',
        scope:{},
        restrict:'E',
        link:link
    }
});