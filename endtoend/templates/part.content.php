<div class="col-md-12" id="cryptopanel">
	<div style="margin-top:6px;" id="check-application" class="alert alert-danger hidden"><center>Secure Cloud Application Could Not Found, Please Open</center></div>
	<div style="margin-top:6px;" id="check-key" class="alert alert-danger hidden"><center>Please choose a keypair in secure cloud application, refresh the page If you will open the application interface</center></div>
	<div id="new-item-buttons" style="margin-top: 6px;">
		<input type="file" style="display:none;" id="uploadFile">
		<button id="uploadFileButton"><i class="fa fa-file"></i> New File</button>
		<button id="new-folder"><i class="fa fa-folder"></i> New Folder</button>
		<button id="new-crypto"><i class="fa fa-group"></i> New Crypto Group</button>
		<button id="add-member"><i class="fa fa-plus"></i> Add Member To Crypto Group</button>
	</div>
	<div class="panel panel-info hidden" id="new-folder-panel" style="margin-top:6px;">
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<label for="folderName">Folder Name</label>
					<input id="folderName"/>
				</div>
				<div class="form-group">
					<button type="button" id="uploadFolderButton">Add Folder</button>
				</div>
			</form>
		</div>
	</div>
	<div class="panel panel-info hidden" id="new-crypto-group-panel" style="margin-top:6px;">
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<label for="cryptoGroup">Group Name</label>
					<input id="cryptoGroup"/>
				</div>
				<div class="form-group">
					<button type="button" id="createCryptoGroup">Create Crypto Group</button><br>
				</div>
			</form>
		</div>
	</div>
	<div class="panel panel-info hidden" id="new-add-member-panel" style="margin-top:6px;">
		<div class="panel-body">
			<form class="form form-inline">
				<div class="form-group">
					<label for="addMemberMember">Username</label>
					<input id="addMemberMember"/>
				</div>
				<div class="form-group">
					<label for="addMemberGroup">Groupname</label>
					<input id="addMemberGroup"/>
				</div>
				<div class="form-group">
					<button type="button" id="addMemberCryptoGroup">Add Member</button><br>
				</div>
			</form>
		</div>
	</div>
	<!--
	<input type="file" style="display:none;" id="uploadFile"><br>
	<button id="uploadFileButton"><i class="fa fa-plus"></i>Add File</button><br>
	<input id="folderName"/>
	<button id="uploadFolderButton"><i class="fa fa-plus"></i>Add Folder</button><br>
	<input id="cryptoGroup"/>
	
	
	<input id="addMemberGroup"/> <input id="addMemberMember"/>
	<button id="addMemberCryptoGroup"><i class="fa fa-plus"></i>Add Member</button>
	-->
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
				<li class="cryptoTabs" data-tab-id="3"><span>Version</span></li>
			</ul>
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="0">
			Activities
		</div>
		<div class="row hidden cryptosidebaritem" data-crypto-tab="1">
			Comments
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


