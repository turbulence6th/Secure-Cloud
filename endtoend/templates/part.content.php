<div class="col-md-12" id="cryptopanel">
	<input type="file" style="display:none;" id="uploadFile"><br>
	<button id="uploadFileButton"><i class="fa fa-plus"></i>Add File</button><br>
	<input id="folderName"/>
	<button id="uploadFolderButton"><i class="fa fa-plus"></i>Add Folder</button>
	
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


