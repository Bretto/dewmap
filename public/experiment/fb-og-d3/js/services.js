'use strict';


var services = angular.module('fb-og-d3.services', []);



services.factory('AppModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var appModel = {
        me: null,
        friends: []
    };

    return appModel;
});


services.service('facebook', ['$rootScope', '$window', function ($rootScope, $window) {

    this.askFacebookForAuthentication = function (fail, success) {
        FB.login(function (response) {
            $rootScope.$apply(function () {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            });
        });
    };

    this.getLoginStatus = function () {
        FB.getLoginStatus(function (response) {
            return response;
        });
    };

    this.FB = $window.FB;

}]);

/* --------------- FB API MODELS ------------------ */
services.service('FBUser', ['$log', '$rootScope', 'facebook', function ($log, $rootScope, facebook) {
    var that = this;

    this.authorized = false;

    if(!facebook.FB)return;

    facebook.FB.Event.subscribe('auth.authResponseChange', function (response) {
        $log.info("Event: auth.authResponseChange");
        if (response.authResponse) {
            if (response.status === 'connected') {
                // User logged in and authorized
                $log.info('User logged in and authorized');
                $rootScope.$apply(function () {
                    that.authorized = true;
                });
                // DO WORK
            } else if (response.status === 'not_authorized') {
                // User logged in but has not authorized app
                $log.info('User logged in');
                $rootScope.$apply(function () {
                    that.authorized = false;
                });
            } else {
                // User logged out
                $log.info('User logged out');
                $rootScope.$apply(function () {
                    that.authorized = false;
                });
            }
        } else {
            $log.info('No valid authResponse found, user logged out');
            $rootScope.$apply(function () {
                that.authorized = false;
            });
        }
    });

    this.login = function (success, fail) {
        facebook.FB.login(function (response) {
            $rootScope.$apply(function () {
                if (response.authResponse) {
                    success(response);
                } else {
                    fail('Login unsuccessful');
                }
            });
        });
    };

    this.logout = function () {
        facebook.FB.logout(function () {
            $rootScope.$apply(function () {
                that.authorized = false;
            });
        });
    };
}]);