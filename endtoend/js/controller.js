var treeApp = angular.module('treeApp', ['TreeWidget']);
treeApp.controller('FilterTreeController', ['$scope', function ($scope,$httpp) {
    function init() {
        $scope.treeNodes=$httpp.get("http://188.166.31.77/index.php/apps/endtoend/getFileTreeInterface")
        .then(function(response) {
        $scope.treeNodes = response.data;
        });
        
        $scope.options = {
            multipleSelect: 'ctrlKey',
            showIcon: true,
            onSelectNode : function (node) {
                $scope.selectedNodes = node;
            },
            onExpandNode : function (node) {
                $scope.expandedNode = node;
            },
            filter : {}
        };

    }
    init();
}]);

