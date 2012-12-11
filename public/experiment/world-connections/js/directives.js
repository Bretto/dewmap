'use strict';

var directives = angular.module('GeoConnections.directives', []);


directives.directive('geopointLabel', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'/experiment/world-connections/partial/geopoint-label.html',
        link:function (scope, elem, attr, ctrl) {

            scope.addGeoPointsElem(elem.parent()[0]);

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});


