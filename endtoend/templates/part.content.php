<input type="file" id="file"><br>
<button type="button" id="submitFile">Submit</button> <br>

<button id="downloadFile">Download</button>

<button id="refresh">Refresh</button>

<button id="deleteFile">Delete</button>
<button id="share">Share</button>
<button id="unshare">Unshare</button>
<button id="changeShare">Change Share</button>
<button id="newDirectory">New Directory</button>


<div class="container-fluid maindiv">
	<button type="button" id="refresh" class="btn btn-success"><span class="glyphicon glyphicon-refresh"></span> Refresh</button>
	<div class="row locationbar">
	  	<span role="button" class="glyphicon glyphicon-home link_simge root_simge"></span>
	  	<span class="glyphicon glyphicon-chevron-right link_simge"></span>
	  	
	  	<a href="#" class="link" role="button">Folder 1</a>
	  	<div class="dropdown locationbarmenu">
			
			<button class="btn btn-default dropdown-toggle menubutton" type="button" data-toggle="dropdown">
    			<span class="glyphicon glyphicon-plus link_simge"></span></button>
			<ul class="dropdown-menu">
				<li><input type="file" id="file"></li>
				<li><a type="button" id="submitFile" href="#" class="operation-link"><span class="glyphicon glyphicon-upload"></span> Upload File</a></li>
				
			</ul>
		</div> 
  	</div>

  	<div class="row files-list">
  			<div ng-app="calis" ng-controller="kontrol"> 
				
					<div class="file col-md-12" ng-repeat="x in treeNodes" data-id="1">
						<div class="row">
						<div class="col-md-1"><span style="color:green;" class="glyphicon glyphicon-text-background" aria-hidden="true"></span></div>
						<div ng-click="getId(x.id)" class="col-md-offset-1 col-md-1 dikeyorta">{{ x.text }}</div>
						<div class="col-md-offset-7 col-md-1 dikeyorta">{{ x.fileId }}</div>
						<div class="col-md-offset-8 col-md-1 dikeyorta"><button class="btn btn-default dropdown-toggle menubutton" type="button" data-toggle="dropdown">
    						<span class="glyphicon glyphicon-option-horizontal"></span></button></div>
					    <div class="col-md-offset-9 col-md-1 dikeyorta">{{ x.tags[0] }}</div>
  			 			<div class="col-md-offset-10 col-md-1 dikeyorta">7 days ago</div>
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