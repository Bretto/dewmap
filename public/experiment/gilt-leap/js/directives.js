'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('GiltApp.directives', []);

directives.directive('imgFadeIn', function ($log, $parse, $timeout) {

    function getRandom(max, min) {
        return Math.floor(Math.random() * (1 + max - min) + min);
    }


    function link(scope, element, attr, ctrl) {

        // hack to determine if an obj is visible or not
        scope.$watch(function () {
            return element.prop('offsetHeight')
        }, function (value) {

            if (element) {
                // reset Matrix
                $(element).css('transform', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');

                TweenMax.fromTo(element, 1, { opacity: 0, rotationY: getRandom(360, -360), rotationX: getRandom(360, -360), z: -1000, ease: Power2.easeOut},
                    {opacity: 1, rotationY: 0, rotationX: 0, z: 0, ease: Power2.easeOut})
            }

        });
    }

    return {
        restrict: 'A',
        link: link
    }
});

directives.directive('viewer', function ($http, $templateCache, $route, $anchorScroll, $compile, $controller, $log, $timeout) {

    return {
        restrict: 'ECA',
        terminal: true,
        link: function (scope, element, attr) {
            var lastScope, locals, template, state, templateLoaded,
                time = 1000,
                onloadExp = attr.onload || '';

            scope.$on('$routeChangeStart', fadeOut);

            scope.$on('$routeChangeSuccess', update);
            update();


            function destroyLastScope() {
                if (lastScope) {
                    lastScope.$destroy();
                    lastScope = null;
                }
            }

            function clearContent() {
                element.html('');
                destroyLastScope();
            }

            function compileTemplate() {
                element.html(template);
                destroyLastScope();

                var link = $compile(element.contents()),
                    current = $route.current,
                    controller;

                lastScope = current.scope = scope.$new();
                if (current.controller) {
                    locals.$scope = lastScope;
                    controller = $controller(current.controller, locals);
                    element.contents().data('$ngControllerController', controller);
                }

                link(lastScope);
                lastScope.$emit('$viewContentLoaded');
                lastScope.$eval(onloadExp);

                $timeout(function () {
                    lastScope.$digest();
                }, 0);

                // $anchorScroll might listen on event...
                $anchorScroll();
            }

            function fadeIn() {
                compileTemplate();
                templateLoaded = false;

                TweenMax.fromTo(element, 1, {opacity: 0, left: "+=70px", width: 980, ease: Power2.easeOut},
                    {opacity: 1, ease: Power2.easeOut, left: 0, onComplete: fadeInComplete});

            }

            function fadeInComplete() {
                $log.info('fade-in content complete');
            }

            function fadeOut() {

                if (element.html() !== '') {
                    state = 'fading-out-template';
                    TweenMax.fromTo(element, 1, {opacity: 1, ease: Power2.easeOut},
                        {opacity: 0, left: "+=70px", ease: Power2.easeOut, onComplete: fadeOutComplete});
                } else {
                    state = 'waiting-for-template';
                }
            }

            function fadeOutComplete() {
                clearContent();
                state = 'waiting-for-template';
                if (templateLoaded) {
                    fadeIn();
                }
            }

            function update() {

                templateLoaded = true;
                locals = $route.current && $route.current.locals;
                template = locals && locals.$template;

                if (template && template !== '') {

                    $log.info('Content Loaded');

                    if (state === 'fading-out-template') return;

                    fadeIn();
                }
            }
        }
    };
});

directives.directive('productHeroShot', function ($log, $parse) {
    return {
        replace: true,
        scope: {data: "="},
        restrict: 'E',
        templateUrl: 'partial/product-hero-shot.html'
    }
});

directives.directive('saleHeroShot', function ($log, $parse) {
    return {
        replace: true,
        scope: {
            data: "=",
            model: "="
        },
        restrict: 'E',
        templateUrl: 'partial/sale-hero-shot.html'
    }
});

directives.directive('isMouseOver', function ($log, $parse) {

    function link(scope, elem, attr, ctrl) {

        var target = $(attr.isMouseOver)[0];

        $(target).mouseover(function (event) {
            elem.addClass('edge-over');
        });

        $(target).mouseleave(function (event) {
            elem.removeClass('edge-over');
        });
    }

    return {

        restrict: 'A',
        link: link
    }
});

directives.directive('loader', function ($log, $rootScope) {

    return {
        replace: false,
        restrict: 'A',
        link: function (scope, elem, attr, ctrl) {
            $rootScope.$on("$routeChangeSuccess", function () {
                scope.isVisible = false;
            })
            $rootScope.$on("$routeChangeStart", function () {
                scope.isVisible = true;
            })
        }
    }
});

directives.directive('leapClick', function ($log, $parse, $rootScope, $timeout, LeapZones) {

    function link(scope, elem, attr) {

        var locator = new directives.utils.Locator();
        var isHot = false;
        var hasTrigger = false;
        var css = attr.leapClick;
        var uid = directives.utils.guid();
        var cnt = 0;
        var isOpen = false;

        LeapZones.zones[uid] = { elem: elem };
        scope.$on('$destroy', function (e) {
            delete LeapZones.zones[uid];
        });

        $rootScope.$on("$routeChangeSuccess", function () {
            $log.info('$routeChangeSuccess');
            $timeout(function(){
                isOpen = true;
            },1000);
        })

        $rootScope.$on("$routeChangeStart", function () {
            isOpen = false;
        })

        $timeout(function(){
            isOpen = true;
        },1000);

        scope.$on('leapData', function (e, leapData) {

            if (leapData.pointables && leapData.pointables.length === 1 && isOpen) {

                cnt++;

                if (cnt === 3) {
                    cnt = 0;

                    var elemPos = directives.utils.getPos(elem);
                    LeapZones.zones[uid].elemPos = elemPos;

                    var leapX = leapData.pointables[0].tipPosition[0];
                    var leapY = leapData.pointables[0].tipPosition[1];

                    var pointerPos = directives.utils.getPointerPos(leapX, leapY);
                    var hypot = directives.utils.getHypot(pointerPos, elemPos);
                    LeapZones.zones[uid].pointerPos = pointerPos;
                    LeapZones.zones[uid].hypot = hypot;

                    isHot = (locator.getIsHot(leapData, css, scope, elem, elemPos, pointerPos, hypot) && hasTrigger == false );

                    if (isHot) {
                        if (leapData.pointables && leapData.pointables.length > 0) {
                            var pointable = leapData.pointables[0];

                            var v = Math.abs(pointable.tipVelocity[1]);

                            if (v > 200 && hasTrigger === false) {
                                $(elem).trigger("click");
                                hasTrigger = true;
                                $timeout(function () {
                                    hasTrigger = false;
                                }, 250);
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        restrict: 'A',
        link: link
    }
});


directives.directive('leapSwipe', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var direction;
        var locator = new directives.utils.Locator();
        var isHot = false;
        var hasTrigger = false;
        var css = attr.leapSwipe;

        $rootScope.$broadcast('leapRegion', elem);

        scope.$on('$destroy', function (e) {
            $rootScope.$broadcast('leapRegionDestroy', e.currentScope.$id);
        });

        $rootScope.$on('leapData', function (e, leapData) {

            if (leapData.pointables && leapData.pointables.length > 0) {

                isHot = (locator.getIsHot(leapData, css, scope, elem) && hasTrigger == false );

                if (isHot) {

                    var pointable = leapData.pointables[0];

                    var v = pointable.tipVelocity[0];
                    direction = (v > 0) ? 'right' : 'left';

                    if (Math.abs(v) > 700 && hasTrigger === false) {
                        var event = jQuery.Event("click");
                        event.direction = direction;

                        $(elem).trigger(event);
                        hasTrigger = true;
                        $timeout(function () {
                            hasTrigger = false;
                        }, 300);
                    }

                }
            }

        });
    }

    return {
        restrict: 'A',
        link: link
    }
});

directives.directive('leapScroll', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var o = 0;

        scope.$on('leapData', function (e, leapData) {

            if (leapData.pointables && leapData.pointables.length >= 3) {
                var yAverage = 0;
                angular.forEach(leapData.pointables, function (pointable) {
                    yAverage += pointable.tipPosition[1] / leapData.pointables.length + 1;
                });

                o = o || yAverage;
                var delta = o - yAverage;
                var s = $(elem).scrollTop() + delta / 5;
                $(elem).scrollTop(s);
            }else{
                o = undefined;
            }
        });
    }

    return {
        restrict: 'A',
        link: link
    }
});

directives.directive('leapOverlay', function ($log, $parse, $rootScope, $timeout, LeapZones) {


    function link(scope, elem, attr, ctrl) {
        var layer1 = elem.find("#layer1")[0];
        var context1 = layer1.getContext("2d");

        var layer2 = elem.find("#layer2")[0];
        var context2 = layer2.getContext("2d");

        scope.isHelpVisible = true;


        function onWindowResize() {
            $('#layer1').attr({'width': $(window).width(), 'height': $(window).height()});
            $('#layer2').attr({'width': $(window).width(), 'height': $(window).height()});
        }

        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();

        var isOpen = true;

        $rootScope.$on("$routeChangeSuccess", function () {
            $timeout(function(){
                isOpen = true;
            },1000);
        })

        $rootScope.$on("$routeChangeStart", function () {
            isOpen = false;
        })


        scope.$on('leapData', function (e, leapData) {

            layer1.width = layer1.width;
            layer2.width = layer2.width;

            if (leapData.pointables && leapData.pointables.length === 1 && isOpen) {

                if (scope.isHelpVisible) {

                    for (var key in LeapZones.zones) {

                        var elemPos = LeapZones.zones[key].elemPos;
                        var pointerPos = LeapZones.zones[key].pointerPos;
                        var hypot = LeapZones.zones[key].hypot;

                        if (hypot < 300) {

                            context1.beginPath();
                            context1.rect(elemPos.x, elemPos.y, elemPos.w, elemPos.h);
                            context1.lineWidth = 5;
                            context1.strokeStyle = '#FF0220';
                            context1.stroke();

                            var lw = Math.min(200000 / (hypot * hypot), 100);

                            context2.beginPath();
                            context2.moveTo(elemPos.centerX, elemPos.centerY);
                            context2.lineTo(pointerPos.x, pointerPos.y);
                            context2.lineWidth = lw;
                            context2.strokeStyle = '#FF0220';
                            context2.lineCap = 'round';
                            context2.stroke();
                        }
                    }
                }

            }

            if (leapData.pointables && leapData.pointables.length > 0) {
                angular.forEach(leapData.pointables, function (pointable) {

                    var pointablePos = directives.utils.getPointerPos(pointable.tipPosition[0], pointable.tipPosition[1]);

                    context2.beginPath();
                    context2.arc(pointablePos.x, pointablePos.y, 20, 0, 2 * Math.PI, false);
                    context2.fillStyle = 'blue';
                    context2.fill();
                });
            }
        });

    }

    return {
        scope: {},
        replace: true,
        templateUrl: 'partial/leap-overlay.html',
        restrict: 'E',
        link: link
    }
});


directives.utils = {};
directives.utils.Locator = function () {

    var timeBegan;

    var inPerimeter = function (pointerPos, elemPos) {
        var v = false;

        if ((pointerPos.x > elemPos.x && pointerPos.x < elemPos.x + elemPos.w) &&
            (pointerPos.y > elemPos.y && pointerPos.y < elemPos.y + elemPos.h)) {
            v = true;
        }

        return v
    }

    this.getIsHot = function (leapData, css, scope, elem, elemPos, pointerPos, hypot) {

        timeBegan = (timeBegan) ? timeBegan : leapData.timestamp;

        var isHot = false;

        if (hypot < 50 || inPerimeter(pointerPos, elemPos)) {

            if (leapData.timestamp - timeBegan > 200000) {
                isHot = true;
                elem.addClass(css);
                scope.$digest();
            }

        } else {
            timeBegan = undefined;
            elem.removeClass(css);
            isHot = false;
            scope.$digest();
        }

        return isHot;
    }
}
;

directives.utils.getPos = function (elem) {

    var cumulativeOffset = function (element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            if (element.offsetParent) {
                if (element.offsetParent.scrollTop && element.offsetParent.scrollTop > 0) top -= element.offsetParent.scrollTop;
                if (element.offsetParent.scrollLeft && element.offsetParent.scrollLeft > 0) left -= element.offsetParent.scrollLeft;
            }

            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left
        };
    };


    var h = elem.innerHeight();
    var w = elem.innerWidth();
    var pos = cumulativeOffset(elem[0]);

    var x = pos.left;
    var y = pos.top;

    return {
        centerX: x + w / 2,
        centerY: y + h / 2,
        x: x,
        y: y,
        w: w,
        h: h
    };
}

directives.utils.getHypot = function (pointerPos, elemPos) {
    var x = pointerPos.x - elemPos.centerX;
    var y = pointerPos.y - elemPos.centerY;
    return  Math.sqrt(x * x + y * y);
}

directives.utils.getPointerPos = function (leapX, leapY) {
    return {x: (leapX * 5) + window.innerWidth / 2, y: window.innerHeight - ((leapY * 5) - window.innerHeight / 2) };
}


directives.utils.guid = function () {

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

