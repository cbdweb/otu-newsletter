var newsletterAdmin = angular.module('newsletterAdmin', ['ngDialog']);

newsletterAdmin.controller('newsletterAdminCtrl', ['$scope', '$timeout', 'ngDialog',
    function( $scope, $timeout, ngDialog ) {
        
        $ = jQuery;
        
//        $scope.data = _data;
        $scope.ngdata = _ngdata;
        $scope.main = _main;
        $scope.showLoading = false;
        
        $scope.ajaxparams = function() {
            var sendmembertype = $.merge( [], $scope.ngdata.membertypes );
               if(sendmembertype.length === $('.membertype').length ) sendmembertype=[]; // prevents query needing to check this
               var sendstate = $.merge( [], $scope.ngdata.states );
               if(sendstate.length === $('.state').length ) sendstate = [];
               return { 'state':sendstate, 'membertype':sendmembertype, 'clss':$scope.ngdata.clsses };
        };
        
        $scope.isClss = function ( clss ) {
            return $.inArray( clss, $scope.ngdata.clsses)>-1;
        }
        $scope.allclss = function ( set ) { // set is boolean, set all or clear all
            if ( set ) {
                $scope.ngdata.clsses = [$scope.main.all_classes];
            } else {
                $scope.ngdata.clsses = [];
            }
        }
        $scope.toggleclss = function ( clss ) {
            if ( $.inArray ( clss, $scope.ngdata.clsses ) > -1 ) {
                var index = $.inArray ( clss, $scope.ngdata.clsses );
                if ( index != -1 ) {
                    $scope.ngdata.clsses.splice ( index, 1 );
                }
            } else {
                if ( $scope.ngdata.clsses[0] == $scope.main.all_classes ) $scope.ngdata.clsses = []; // remove "all" 
                $scope.ngdata.clsses.push ( clss );
            }
        }
        $scope.togglemembertype = function(membertype) {
            if($.inArray(membertype, $scope.ngdata.membertypes ) > -1 ) {
                var index = $.inArray(membertype, $scope.ngdata.membertypes);
                if(index != -1)
                {
                  $scope.ngdata.membertypes.splice(index, 1);
                }
            } else {
                $scope.ngdata.membertypes.push(membertype);
            }
        };
        $scope.isMemberType = function(membertype) {
            return $.inArray(membertype, $scope.ngdata.membertypes)>-1;
        };
        $scope.togglestate = function(state) {
            if($.inArray(state, $scope.ngdata.states ) > -1 ) {
                var index = $.inArray(state, $scope.ngdata.states );
                if(index != -1) {
                    $scope.ngdata.states.splice(index, 1 );
                }
            } else {
                $scope.ngdata.states.push(state);
            }
        }
        $scope.isState = function(state) {
            return $.inArray(state, $scope.ngdata.states ) > -1;
        }


        $scope.sendNewsletter = function() {
            var data = $('#post').serializeArray(),
                    errors = [];
            $.each( $scope.ngdata.clsses, function( index, elem ) {
                data.push( { name: 'cbdweb_newsletter_class[]', value: elem } );
            });
            if ( $scope.ngdata.clsses.length === 0 ) errors.push('You must choose classes, or click on "all classes"');
            $.each ( $scope.ngdata.states, function ( index, elem ) {
                data.push( { name: 'cbdweb_newsletter_state[]', value: elem } );
            });
            if ( $scope.ngdata.states.length === 0 ) errors.push('You must choose at least one button in States');
            $.each ( $scope.ngdata.membertypes, function ( index, elem ) {
                data.push( { name: 'cbdweb_newsletter_membertype[]', value: elem } );
            });
            if ( $scope.ngdata.membertypes.length === 0 ) errors.push ( 'You must choose at least one Member Type' );
            if ( errors.length > 0 ) {
                var htmldialog = "<b>Please attend to these errors:<ul class='errors'>";
                $.each(errors, function(index, elem) {
                    htmldialog += "<li>" + elem + "</li>";
                })
                htmldialog += "</ul>"
                ngDialog.open({template:htmldialog, plain:true})
                return;
            }
            if ( $('#post input[name=cbdweb_newsletter_test_addresses]').val() === "" ) {
                if ( ! confirm( 'Are you sure?  This will send to all recipients!' ) ) return;
            }
            $('#post input[name=cbdweb_newsletter_send_newsletter]').val('1');
            $scope.sending = true;
            $scope.showLoading = true;
            $.post( $scope.main.post_url, data, function( response ) {
                $scope.showLoading = false;
                var ajaxdata = $.parseJSON( response );
                $timeout.cancel ( $scope.progress );
                $scope.sending = false;
                $scope.showProgressMessage = true;
                $scope.email = $scope.email || {};
                $scope.showProgressNumber = false;
                $scope.email.message = ajaxdata.success;
                $scope.$apply();
                $('#post input[name=cbdweb_newsletter_send_newsletter]').val('0');
            });
            /* progress */
            $scope.progress = $timeout ( $scope.displayProgress, 1000 );
        };
        
        $scope.displayProgress = function() {
            data = {'action':'cbdweb_newsletter_progress', 'post_id':$('#post input[name=ajax_id]').val() };
            $.post ( $scope.main.ajax_url, data, function ( response ) {
                $scope.showLoading = false;
                $scope.$apply();
                $scope.email = $.parseJSON ( response );
                if($scope.sending) {
                    $scope.showProgressNumber = true;
                    $scope.$apply();
                    $scope.progress = $timeout ( $scope.displayProgress, 1000 );
                }
            });
        };
        
    }
]);