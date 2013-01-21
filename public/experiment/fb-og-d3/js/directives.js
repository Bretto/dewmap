'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('fb-og-d3.directives', []);


directives.directive('node', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'/experiment/fb-og-d3/partial/node.html',
        link:function (scope, elem, attr, ctrl) {

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});



