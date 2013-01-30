'use strict';


var services = angular.module('pie-menu-d3.services', []);



services.factory('PieMenuModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var PieMenuModel = {

        data1 :[{"label":"Root Scope", "value":1},
            {"label":"Parent Scope", "value":1},
            {"label":"Child Scope", "value":1}
        ],

        data2 :[{"label":"Root Scope", "value":1},
            {"label":"Parent Scope", "value":1},
            {"label":"Child Scope", "value":1},
            {"label":"Child Scope 1", "value":1},
            {"label":"Child Scope 2", "value":1},
            {"label":"Child Scope 3", "value":1}
        ],

        data3 :[{"label":"Root Scope", "value":1},
            {"label":"Parent Scope", "value":1},
            {"label":"Child Scope", "value":1},
            {"label":"Child Scope 1", "value":1}

        ]

    };

    return PieMenuModel;
});


