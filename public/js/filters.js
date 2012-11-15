'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$filter */

var filters = angular.module('myApp.filters', []);


filters.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]);


filters.filter('testFilter', function () {

    return function (array, searchText) {
        for ( var j = 0; j < array.length; j++) {
            var value = array[j];

            if(searchText && searchText.toLowerCase()){

                if (value.details.toLowerCase().indexOf(searchText) > -1) {
                    value.show = true;
                }else{
                    value.show = false;
                }
            }else{
                value.show = true;
            }

        }
        return array;
    }



});
