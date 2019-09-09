/*
 * jQuery File Upload Plugin Angular JS Example 1.2.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, regexp: true */
/*global window, angular */

(function () {
    'use strict';


    var isOnGitHub = window.location.hostname === 'blueimp.github.io',
        url = '/upload/musicUpload/',
        urlview = '/upload/view/';

    angular.module('demo', [
        'blueimp.fileupload'
    ])
        .config([
            '$httpProvider', 'fileUploadProvider',
            function ($httpProvider, fileUploadProvider) {
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                fileUploadProvider.defaults.redirect = window.location.href.replace(
                    /\/[^\/]*$/,
                    '/cors/result.html?%s'
                );
                $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

                if (!isOnGitHub) {
                    // Demo settings:
                    angular.extend(fileUploadProvider.defaults, {
                        // Enable image resizing, except for Android and Opera,
                        // which actually support image resizing, but fail to
                        // send Blob objects via XHR requests:
                        disableImageResize: /Android(?!.*Chrome)|Opera/
                            .test(window.navigator.userAgent),
                        maxFileSize: 20000000,
                        acceptFileTypes: /(\.|\/)(mp4|flv|mp3|wav|au)$/i
                    });
                }
            }
        ])

        .controller('DemoFileUploadController', [
            '$scope', '$http', '$filter', '$window',
            function ($scope, $http) {
                $scope.options = {
                    url: url
                };


                if (isOnGitHub) {
                    $scope.loadingFiles = true;
                    $http.get(urlview)
                        .then(
                            function (response) {
                                $scope.loadingFiles = false;
                                $scope.queue = response.data.files || [];
                            },
                            function () {
                                $scope.loadingFiles = false;
                            }
                        );
                }

            }

        ])

        .controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };

                    file.$svm = function () {
                        state = 'pending';
                        return $http({
                            url: '/upload/svm/' ,
                            method: 'POST',
                            data: {'file': file.url, 'delete' : file.deleteId},
                            xsrfHeaderName: 'X-CSRFToken',
                            xsrfCookieName: 'csrftoken',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                    },
                        }).then(
                            function (response) {
                                state = 'resolved';
                                $scope.resp = response.data;
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };

                      file.$multisvm = function () {
                        state = 'pending';
                        return $http({
                            url: '/upload/multisvm/' ,
                            method: 'POST',
                            data: {'file': file.url,  'delete' : file.deleteId},
                            xsrfHeaderName: 'X-CSRFToken',
                            xsrfCookieName: 'csrftoken',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                    },
                        }).then(
                            function (response) {
                                state = 'resolved';
                                $scope.resp = response.data;
                                //$scope.resp = JSON.parse(response.data);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );


                    };
                  



                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType,
                            xsrfHeaderName: 'X-CSRFToken',
                            xsrfCookieName: 'csrftoken'
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };                    
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
                        $scope.clear(file);
                    };
                }
            }
        ]);

}());
