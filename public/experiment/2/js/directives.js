'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('GeoConnections.directives', []);


directives.directive('geopointLabel', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'/experiment/1/partial/geopoint-label.html',
        link:function (scope, elem, attr, ctrl) {

            scope.addGeoPointsElem(elem.parent()[0]);

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});


