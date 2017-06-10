<div class="col-md-12" id="cryptopanel">
	<div style="margin-top:6px;" id="check-application" class="alert alert-danger hidden"><center>Secure Cloud Application Could Not Found, Please Open</center></div>
	<div style="margin-top:6px;" id="check-key" class="alert alert-danger hidden"><center>Please choose a keypair in secure cloud application, refresh the page If you will open the application interface</center></div>
	<div id="new-item-buttons" style="margin-top: 6px;">
		<input type="file" style="display:none;" id="uploadFile">
		<button id="uploadFileButton"><i class="fa fa-file"></i> New File</button>
		<button id="new-folder"><i class="fa fa-folder"></i> New Folder</button>
		<button id="crypto-group-menu"><i class="fa fa-group"></i>Crypto Group Options</button>

	</div>
	<div class="panel panel-info hidden" id="new-folder-panel" style="margin-top:6px;">
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<label for="folderName">Folder Name</label>
					<input id="folderName" class="form-control"/>
				</div>
				<div class="form-group">
					<button type="button" id="uploadFolderButton">Add Folder</button>
				</div>
			</form>
		</div>
	</div>
	
	
	<div id="jsGrid" style="margin-top: 10px;"></div>
</div>
<div class="col-md-4 hidden" id="cryptosidebar">
		<div class="row">
			<button id="closecryptosidebar"><i class="fa fa-close fa-2x"></i></button>
		</div>
		<div class="row" id="cryptofileinfo">
			<div id="cryptofileicon" style="margin-right:4px;">
				
			</div>
			<div>
				<h5 id="filename">Filename</h5>
				<p id="filesizeanddate">date</p>
			</div>
		</div>
		<div class="row" style="margin-bottom: 12px;">
			<ul class="cryptoTabHeader">
				<li class="cryptoTabs" data-tab-id="0"><span>Activities</span></li>
				<li class="cryptoTabs" data-tab-id="1"><span>Comments</span></li>
				<li class="cryptoTabs" data-tab-id="2"><span>Sharing</span></li>
			</ul>
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="0">
			Activities
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="1">
			<div class="col-md-12"
				<form class="form" id="comment-form">
					<div class="form-group">
						<textarea class="form-control" rows="3" placeholder="Type in a new comment ..." id="inputComment">
						</textarea>
					</div>
					<div class="form-group">
						<button type="button" id="commentPost">Post</button>
					</div>
					
					<div id="comments" style="max-height: 300px; overflow: scroll;">
						
					</div>
				</form>
			</div>
			
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="2">
			<div class="col-md-12">
				<div class="row" style="margin-bottom:5px;">
					<div class="col-md-12" id="sharesBy">
					</div>
				</div>
				<div class="row" id="sharewith" style="margin-bottom: 5px;">
					<div class="col-md-12">
						<input class="form-control" id="inputShare" placeholder="Share with users or groups"/>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12" id="shared-users">
					</div>
				</div>
			</div> 
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="3">
			Version
		</div>
</div>
<div id="groupsidebar" class="col-md-4 hidden">
	<div class="row">
		<button style="float:right;" id="closegroupsidebar"><i class="fa fa-close fa-2x"></i></button>
	</div>
	<div class="panel panel-info" id="new-crypto-group-panel" style="margin-top:6px;">
		<div class="panel-heading">
			New Crypto Group
		</div>
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<input id="cryptoGroup" class="form-control" placeholder="Group Name"/>
				</div>
				<div class="form-group">
					<button type="button" id="createCryptoGroup">Create</button><br>
				</div>
			</form>
		</div>
	</div>
	<div class="panel panel-info" id="new-add-member-panel" style="margin-top:6px;">
		<div class="panel-heading">
			Add User To Crypto Group
		</div>
		<div class="panel-body">
			<form class="form">
				<div class="form-group">
					<input class="form-control" id="addMemberGroup" placeholder="Groupname"/>
				</div>
				<div class="form-group">
					<input class="form-control" id="addMemberMember" placeholder="Username"/>
				</div>
				<div class="form-group">
					<button type="button" id="addMemberCryptoGroup">Add Member</button><br>
				</div>
			</form>
		</div>
	</div>
	
	<div class="panel panel-info" id="new-add-member-panel" style="margin-top:6px;">
		<div class="panel-heading">
			Leave Group
		</div>
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<input id="cryptoGroupLeave" class="form-control" placeholder="Group Name"/>
				</div>
				<div class="form-group">
					<button type="button" id="leaveCryptoGroup">Leave</button><br>
				</div>
			</form>
		</div>
	</div>
	
</div>


