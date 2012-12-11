'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('Box2dDom.directives', []);


directives.directive('box2dObj', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'/experiment/3/partial/box2d-obj.html',
        link:function (scope, elem, attr, ctrl) {

            scope.addBox2dElem(elem.parent()[0]);

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});


