<input type="file" id="file"><br>
<button type="button" id="submitFile">Submit</button> <br>

<button id="downloadFile">Download</button>

<button id="refresh">Refresh</button>

<button id="deleteFile">Delete</button>
<button id="share">Share</button>
<button id="unshare">Unshare</button>
<button id="changeShare">Change Share</button>
<button id="newDirectory">New Directory</button>





<div class="container page" ng-app="treeApp"> 
<div class="row definition">
            <div ng-controller="FilterTreeController">
                <h3>
                    Files
                </h3>
                
                <div class="col-sm-6">
                    <div class="form-group">
                        Name: <input type="text" class="form-control" ng-model="options.filter.name">
                        Image: <input type="text" class="form-control" ng-model="options.filter.image">
                    </div>
                    <div class="tree-container" style="min-height:180px;">
                        <tree nodes="treeNodes" options="options"></tree>
                    </div>
                </div>
            </div>
            
        </div>
    </div>





<nav id="context-menu" class="context-menu">
    <ul class="context-menu__items">
      <li class="context-menu__item">
        <a id="downloadFile" href="#" class="context-menu__link" data-action="Download"><i class="fa fa-eye"></i> Download</a>
      </li>
      <li class="context-menu__item">
        <a id="deleteFile" href="#" class="context-menu__link" data-action="Edit"><i class="fa fa-edit"></i> Delete</a>
      </li>
      <li class="context-menu__item">
        <a id="share" href="#" class="context-menu__link" data-action="Delete"><i class="fa fa-times"></i> Share</a>
      </li>
      <li class="context-menu__item">
        <a id="unshare" href="#" class="context-menu__link" data-action="Delete"><i class="fa fa-times"></i> UnShare</a>
      </li>
    </ul>
  </nav>

<div id="tree"></div>

<?php p($_['users']) ?>