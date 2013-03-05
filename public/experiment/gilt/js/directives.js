'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('GiltApp.directives', []);


directives.directive('imgFadeIn', function ($log, $parse, $timeout) {

    function getRandom(max, min) {
        return Math.floor(Math.random() * (1 + max - min) + min);
    }


    function link(scope, element, attr, ctrl) {

        // hack to determine if an obj is visible or not
        scope.$watch(function(){return element.prop('offsetHeight')}, function(value) {

            if(element){
                // reset Matrix
                $(element).css('transform', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');

                TweenMax.fromTo(element, 1, { opacity:0, rotationY:getRandom(360, -360), rotationX:getRandom(360, -360), z: -1000, ease:Power2.easeOut},
                    {opacity:1, rotationY:0, rotationX:0, z:0, ease:Power2.easeOut})
            }

        });
    }

    return {
        restrict:'A',
        link:link
    }
});


directives.directive('viewer', function ($http, $templateCache, $route, $anchorScroll, $compile, $controller, $log, $timeout) {

    return {
        restrict:'ECA',
        terminal:true,
        link:function (scope, element, attr) {
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

                TweenMax.fromTo(element, 1, {opacity:0, left:"+=70px", width:980, ease:Power2.easeOut},
                    {opacity:1, ease:Power2.easeOut, left:0, onComplete:fadeInComplete});

            }

            function fadeInComplete() {
                $log.info('fade-in content complete');
            }

            function fadeOut() {

                if (element.html() !== '') {
                    state = 'fading-out-template';
                    TweenMax.fromTo(element, 1, {opacity:1, ease:Power2.easeOut},
                        {opacity:0, left:"+=70px", ease:Power2.easeOut, onComplete:fadeOutComplete});
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
        replace:true,
        scope:{data:"="},
        restrict:'E',
        templateUrl:'partial/product-hero-shot.html'
    }
});

directives.directive('saleHeroShot', function ($log, $parse) {
    return {
        replace:true,
        scope:{
            data:"=",
            model:"="
        },
        restrict:'E',
        templateUrl:'partial/sale-hero-shot.html'
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

        restrict:'A',
        link:link
    }
});

directives.directive('loader', function ($log, $rootScope) {

    return {
        replace:false,
        restrict:'A',
        link:function (scope, elem, attr, ctrl) {
            $rootScope.$on("$routeChangeSuccess",function(){
                scope.isVisible = false;
            })
            $rootScope.$on("$routeChangeStart",function(){
                scope.isVisible = true;
            })
        }
    }
});

