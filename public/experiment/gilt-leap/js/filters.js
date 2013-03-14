'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$filter */

var filters = angular.module('GiltApp.filters', []);

filters.filter('cleanURL', function() {
    return function(input) {

        if(!input)return;

        var output = input.replace(/https:\/\/api.gilt.com\/v1/, '').replace(/\//g, '_');
        return output;
    }
});