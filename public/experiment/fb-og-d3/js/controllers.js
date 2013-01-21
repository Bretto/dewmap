'use strict';
/* App Controllers */

var controllers = angular.module('fb-og-d3.controllers', []);

controllers.controller('MainCtrl', function ($scope, $http, $timeout, $compile, $log, AppModel, FBUser){

    $log.info('MainCtrl');

    $('#preloader').css('display','none');
    // register the listener for self destruction
    $timeout(function() {
        $( window.location ).one(
            "change",
            function( objEvent, objData ){
                $rootScope.$broadcast(':destroy-experiment');
            }
        );
    }, 0, false);

    $scope.appModel = AppModel;
    $scope.user = FBUser;

    var graph;

    d3.json("/experiment/fb-og-d3/assets/friends.json", function(res) {
        graph = res;
        AppModel.friends = graph.nodes;
        $scope.$digest();
    });


    $scope.$watch(function() { return FBUser.authorized }, function(newValue, oldValue){
        if(newValue){
            getMe();
        }
    },true);


    function loginSuccess(){
        $log.info('Success');
        getMe()
    }

    function loginFail(){
        $log.info('Fail');
    }

    function getLinks(nodeId){
        var links = $('line[link-id=' + nodeId + ']');

        return links
    }

    function showMFriendsNames(mFriends, v){
        if(mFriends){
            for (var i = 0; i < mFriends.length; i++) {
                var node = $('[node-id = ' + mFriends[i].id + ']');
                $(node).appendTo($("#nodes"));
                var nodeScope = node.scope();
                if(nodeScope)nodeScope.showName = v;
            }
        }
    }

    // add or remove the hover-link class
    function hoverLinks(links, v){
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            d3.select(link).classed('hover-link', v);
        }
    }

    $scope.onMouseEnter = function(e){
        this.showName = true;
        var node = $(e.target).parent()[0];
        //reorder the elem on top of the stack
        $(node).appendTo($("#nodes"));
        hoverLinks(getLinks(this.friend.id), true);
        showMFriendsNames(this.friend.mutualfriends, true);
    }

    $scope.onMouseLeave = function(e){
        this.showName = false;
        hoverLinks(getLinks(this.friend.id), false);
        showMFriendsNames(this.friend.mutualfriends, false);
    }

    $scope.onLogin = function(){
        FBUser.login(loginSuccess, loginFail)
    }

    $scope.onLogout = function(){
        FBUser.logout();
        $log.info('Logged Out');
    }


    function getMe(){
        FB.api('me', function(response) {
            $log.info(response);
            AppModel.me = response;
        });
    }

    function getMutualFriends(friend,cb){
        FB.api(AppModel.me.id + '?fields=mutualfriends.user('+ friend.id +')', function(response) {
            //$log.info(response);
            if(response.mutualfriends){
                friend.mutualfriends = response.mutualfriends.data;
            }
            cb();

        });
    }

    $scope.getFriends = function(){

        var done = 0;

        FB.api(AppModel.me.id + '?fields=friends', function(response) {
            $log.info(response);
            var friends = response.friends.data;
            for (var i = 0; i < friends.length; i++) {
                (function(i){
                    var friend = friends[i];
//                    $log.info(friend);
                    getMutualFriends(friend, function(){
                        //$log.info(done, friends.length);

                        // limit the friends count
                        var cnt = 100;
                        if(done === cnt-1){
                            friends.length = cnt;
                        }

                        if( ++done === friends.length){
                            $log.info(friends);


                            AppModel.friends = friends;
                            $scope.$digest();
                        }
                    });
                }(i));
            }
        });


    }




    $scope.getFriendsJSON = function(){
        d3.json("/experiment/fb-og-d3/assets/friends.json", function(res) {
            graph = res;
            AppModel.friends = graph.nodes;
            $scope.$digest();
        });
    }

    $scope.renderComplete = function () {

        graph =
        {
            "nodes": AppModel.friends,
            "links": makeLinks(AppModel.friends)
        };


        var width = 960,
            height = 600;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-100)
            .linkDistance(100)
            .size([width, height]);

        var svg = d3.select("svg");


        force
            .nodes( graph.nodes )
            .links( graph.links )
            .start();

        var link = svg.selectAll("line.link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll("svg.node-svg")
            .data(AppModel.friends)
            .call(force.drag);

        force.on("tick", function() {
            link.attr("link-id", function(d) { return d.sourceId; })
                .attr("x1", function(d) { return d.source.x + 6; })
                .attr("y1", function(d) { return d.source.y + 6; })
                .attr("x2", function(d) { return d.target.x + 6; })
                .attr("y2", function(d) { return d.target.y + 6; });

//            node.attr("cx", function(d) { return d.x; })
//                .attr("cy", function(d) { return d.y; });


            node.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });

            //node.attr("style", function(d) { return "left:" + d.x + "px;" + "top:" + d.y + "px;"})

//            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

        });



    }


    function makeLinks(friends){

        var links = [];

        for (var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            var mFriends = friend.mutualfriends;
            if(mFriends){
                for (var j = 0; j < mFriends.length; j++) {
                    var mFriend = mFriends[j];
                    var found = $.grep( friends, function(e){ return e.id == mFriend.id; });

                    if(found.length == 1){
                        links.push({"source":friends.indexOf(friend), "target":friends.indexOf(found[0]),"value":1, sourceId:friend.id});
                    }
                }
            }
        }

        return links;
    }

});























