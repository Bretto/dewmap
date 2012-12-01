'use strict';


var services = angular.module('PieMenu.services', []);



services.factory('PieMenuModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var PieMenuModel = {

        data1 :[{"label":"1", "value":1},
            {"label":"2", "value":1},
            {"label":"3", "value":1},
            {"label":"4", "value":1},
            {"label":"5", "value":1}

        ],

        data2 :[{"label":"1", "value":1},
            {"label":"2", "value":1},
            {"label":"3", "value":1}
        ],

        data3 :[{"label":"1", "value":1},
            {"label":"2", "value":1},
            {"label":"3", "value":1},
            {"label":"4", "value":1},
            {"label":"5", "value":1},
            {"label":"6", "value":1}
        ]

    };

    return PieMenuModel;
});


