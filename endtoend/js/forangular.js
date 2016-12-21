    var app = angular.module('calis', ['TreeWidget']);
app.controller('kontrol', function($scope, $http) {
    $http.get("http://188.166.77.15/index.php/apps/endtoend/getFileTree")
    .then(function(response) {
        $scope.treeNodes = response.data;
    });
});