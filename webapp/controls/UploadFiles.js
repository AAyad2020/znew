//******New Control AYAD*********
sap.ui.define(
	['sap/m/UploadCollection'],
	function(UploadCollection) {
		return UploadCollection.extend("controls.UploadFiles", {
			renderer: function(oRm, oControl) {
				sap.m.UploadCollectionRenderer.render(oRm, oControl); //use supercass renderer routine
			},
			
			// onAfterRendering: function() {
			// 	if (sap.m.UploadCollection.onAfterRendering) {
			// 		sap.m.UploadCollection.onAfterRendering.apply(this, arguments);
			// 	}
			// },
			setUploadUrl: function(value) {
				this.setProperty("instantUpload", true, true); // disables the default check
				if (sap.m.UploadCollection.prototype.setUploadUrl) {
					sap.m.UploadCollection.prototype.setUploadUrl.apply(this, arguments); 
					for(var i in this._aFileUploadersForPendingUpload)
					{
						this._aFileUploadersForPendingUpload[i].setUploadUrl(value);
					}
				}
				this.setProperty("instantUpload", false, true); 
			}
		});
	}
);