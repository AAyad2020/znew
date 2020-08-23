sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/UploadCollectionParameter",
	"com/sap/jvPosting/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/message/Message",
	"sap/ui/core/library"
], function (BaseController, MessageBox, Utilities, History, JSONModel, UploadCollectionParameter, formatter, MessageToast, Message,
	library) {
	"use strict";
	var that;
	// shortcut for sap.ui.core.MessageType
	var MessageType = library.MessageType;
	return BaseController.extend("com.sap.jvPosting.controller.NewRequest", {
		formatter: formatter,
		handleRouteMatched: function (oEvent) {

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onPageNavButtonPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("NewRequest").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			that = this;
			//=======Json Model===========
			this._data = new JSONModel({
				Requestid: "X",
				Compcode: "",
				Reasonje: "",
				Doctype: "",
				Currency: "",
				JEREItemSet: []
			});
			this._data.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.getView().setModel(this._data, 'TableData');
			//=============<< Message Popover >>==================
			// set message model
			var oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");

			// or just do it for the whole view
			oMessageManager.registerObject(oView, true);
			//=====================
			oView.addEventDelegate({
				onBeforeShow: function () {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function () {
								this.oRouter.navTo("MasterPage1", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

		},
		// Upload Section Code
		onChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			var zmodel = this.getOwnerComponent().getModel();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: zmodel.getSecurityToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileSizeExceed: function (oEvent) {
			MessageToast.show("File Size Exceed.");
		},

		onTypeMissmatch: function (oEvent) {
			MessageToast.show("Type Miss match.");
		},

		onUploadComplete: function (oEvent) {
			// iteration = 0;
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		onVersion: function () {
			var oUploadCollection = this.getView().byId("UploadCollection1");
			this.bIsUploadVersion = true;
			this.oItemToUpdate = oUploadCollection.getSelectedItem();
			oUploadCollection.openFileDialog(this.oItemToUpdate);
		},
		// Search Help for Company Code
		onvaluehelpcompany: function (Oevent) {
			if (!this._addNewItemPage) {
				this._addNewItemPage = sap.ui.xmlfragment('compcode', "com.sap.jvPosting.view.fragments.compcode", this);
				this.getView().addDependent(this._addNewItemPage);
			} else {
				this.getView().removeDependent(this._addNewItemPage);
				this._addNewItemPage = sap.ui.xmlfragment('compcode', "com.sap.jvPosting.view.fragments.compcode", this);
				this.getView().addDependent(this._addNewItemPage);
			}
			this._addNewItemPage.setModel(this.getView().getModel());
			this._addNewItemPage.open();
			//this._addNewItemPage.bindElement("/");
		},
		onCloseDialogcompany: function (oEvent) {
			var value = oEvent.getParameter("selectedItems")[0].getTitle();
			var desc = oEvent.getParameter("selectedItems")[0].getDescription();
			this._data.setProperty("/Compcode", value);
			that.byId('comp_code_id').setDescription(desc);
			that.byId('comp_code_id').setValueState(sap.ui.core.ValueState.None);
		},
		//================================================================
		//======<< Handling Search Company Code Field >>==================
		//================================================================
		handleSearchCompany: function (oEvent) {
			var searchString = oEvent.getParameter("value");
			var filters = [];
			if (searchString && searchString.length > 0) {
				filters = new sap.ui.model.Filter("Companycode", sap.ui.model.FilterOperator.EQ, searchString);
				// new sap.ui.model.Filter([new sap.ui.model.Filter("Compcode", sap.ui.model.FilterOperator.Contains, searchString),
				// 	new sap.ui.model.Filter("Ccdesc", sap.ui.model.FilterOperator.Contains, searchString)
				// ], true);
			}
			oEvent.getSource().getBinding("items").filter(filters);
		},
		//================================================================
		//======<< Search Help for Doc Type  >>===========================
		//================================================================
		onvaluehelpdoctype: function (Oevent) {
			if (!this._addNewItemDoc) {
				this._addNewItemDoc = sap.ui.xmlfragment('doctype', "com.sap.jvPosting.view.fragments.doctype", this);
				this.getView().addDependent(this._addNewItemDoc);
			} else {
				this.getView().removeDependent(this._addNewItemDoc);
				this._addNewItemDoc = sap.ui.xmlfragment('doctype', "com.sap.jvPosting.view.fragments.doctype", this);
				this.getView().addDependent(this._addNewItemDoc);
			}
			this._addNewItemDoc.setModel(this.getView().getModel());
			this._addNewItemDoc.open();
			//this._addNewItemPage.bindElement("/");
		},
		onCloseDialogDoc: function (oEvent) {
			var value = oEvent.getParameter("selectedItems")[0].getTitle();
			var desc = oEvent.getParameter("selectedItems")[0].getDescription();
			this._data.setProperty("/Doctype", value);
			that.byId('doc_type_id').setDescription(desc);
			that.byId('doc_type_id').setValueState(sap.ui.core.ValueState.None);

		},
		handleSearchDoc: function (oEvent) {
			var searchString = oEvent.getParameter("value");
			var filters = [];
			if (searchString && searchString.length > 0) {
				filters = new sap.ui.model.Filter("Doctype", sap.ui.model.FilterOperator.EQ, searchString);
				// new sap.ui.model.Filter([new sap.ui.model.Filter("Doctype", sap.ui.model.FilterOperator.Contains, searchString),
				// 	new sap.ui.model.Filter("Doctypdesc", sap.ui.model.FilterOperator.Contains, searchString)
				// ], true);
			}
			oEvent.getSource().getBinding("items").filter(filters);
		},
		//================================================================
		//======<< Search Help for Currency >>===========================
		//================================================================
		onvaluehelpcurr: function (Oevent) {
			if (!this._addNewItemDoc) {
				this._addNewItemDoc = sap.ui.xmlfragment('currency', "com.sap.jvPosting.view.fragments.currency", this);
				this.getView().addDependent(this._addNewItemDoc);
			} else {
				this.getView().removeDependent(this._addNewItemDoc);
				this._addNewItemDoc = sap.ui.xmlfragment('currency', "com.sap.jvPosting.view.fragments.currency", this);
				this.getView().addDependent(this._addNewItemDoc);
			}
			this._addNewItemDoc.setModel(this.getView().getModel());
			this._addNewItemDoc.open();
			//this._addNewItemPage.bindElement("/");
		},
		onCloseDialogCurrency: function (oEvent) {
			var value = oEvent.getParameter("selectedItems")[0].getDescription();
			var desc = oEvent.getParameter("selectedItems")[0].getTitle();
			this._data.setProperty("/Currency", value);
			that.byId('curr_id').setDescription(desc);
			that.byId('curr_id').setValueState(sap.ui.core.ValueState.None);
			//.setValueState(sap.ui.core.ValueState.None);

		},
		handleSearchCurrency: function (oEvent) {
			var searchString = oEvent.getParameter("value");
			var filters = [];
			if (searchString && searchString.length > 0) {
				filters = new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.EQ, searchString);
				// new sap.ui.model.Filter([new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, searchString),
				// 	new sap.ui.model.Filter("Currdes", sap.ui.model.FilterOperator.Contains, searchString)
				// ], true);
			}
			oEvent.getSource().getBinding("items").filter(filters);
		},
		//================================================================
		//======<< Search Help for Request Type >>=========================
		//================================================================
		onvaluehelpreqtype: function (Oevent) {
			if (!this._addNewItemReqType) {
				this._addNewItemReqType = sap.ui.xmlfragment('reqtype', "com.sap.jvPosting.view.fragments.reqtype", this);
				this.getView().addDependent(this._addNewItemReqType);
			} else {
				this.getView().removeDependent(this._addNewItemReqType);
				this._addNewItemReqType = sap.ui.xmlfragment('reqtype', "com.sap.jvPosting.view.fragments.reqtype", this);
				this.getView().addDependent(this._addNewItemReqType);
			}
			this._addNewItemReqType.setModel(this.getView().getModel());
			this._addNewItemReqType.open();
		},
		onCloseDialogReqType: function (oEvent) {
			var desc = oEvent.getParameter("selectedItems")[0].getDescription();
			var value = oEvent.getParameter("selectedItems")[0].getTitle();
			this._data.setProperty("/Jereqtype", value);
			that.byId('req_type_id').setDescription(desc);
			that.byId('req_type_id').setValueState(sap.ui.core.ValueState.None);
		},
		handleSearchReqType: function (oEvent) {
			var searchString = oEvent.getParameter("value");
			var filters = [];
			if (searchString && searchString.length > 0) {
				filters = new sap.ui.model.Filter("Jereqtype", sap.ui.model.FilterOperator.EQ, searchString);
				// new sap.ui.model.Filter([new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, searchString),
				// 	new sap.ui.model.Filter("Currdes", sap.ui.model.FilterOperator.Contains, searchString)
				// ], true);
			}
			oEvent.getSource().getBinding("items").filter(filters);
		},
		//================================================================
		//======<< Search Help for GL Account >>===========================
		//================================================================
		onvaluehelpglaccount: function (Oevent) {
			if (!this._addNewItemGl) {
				this._addNewItemGl = sap.ui.xmlfragment('glaccount', "com.sap.jvPosting.view.fragments.glaccount", this);
				this.getView().addDependent(this._addNewItemGl);
			} else {
				this.getView().removeDependent(this._addNewItemGl);
				this._addNewItemGl = sap.ui.xmlfragment('glaccount', "com.sap.jvPosting.view.fragments.glaccount", this);
				this.getView().addDependent(this._addNewItemGl);
			}
			this._addNewItemGl.setModel(this.getView().getModel());

			if (this._data.getProperty('/Compcode')) {
				this._addNewItemGl.getBinding('items').filter(new sap.ui.model.Filter("IvCompcode", sap.ui.model.FilterOperator.EQ, this._data.getProperty(
					'/Compcode')));
				this._addNewItemGl.open();
			} else {
				MessageBox.error("Please Select Company code");
			}

			this._field = Oevent.getSource();
			//this._addNewItemPage.bindElement("/");
		},
		onCloseDialogGl: function (oEvent) {
			var value = oEvent.getParameter("selectedItems")[0].getDescription();
			var desc = oEvent.getParameter("selectedItems")[0].getTitle();
			this._field.setValue(desc);
			this._field.setValueState(sap.ui.core.ValueState.None);

		},
		handleSearchGl: function (oEvent) {
			var searchString = oEvent.getParameter("value");
			var filters = [];
			if (searchString && searchString.length > 0) {
				// filters = new sap.ui.model.Filter("Glaccdesc", sap.ui.model.FilterOperator.EQ, searchString);
				filters = new sap.ui.model.Filter([new sap.ui.model.Filter("Glacc", sap.ui.model.FilterOperator.EQ, searchString),
					new sap.ui.model.Filter("IvCompcode", sap.ui.model.FilterOperator.EQ, this._data.getProperty('/Compcode'))
				], true);
			} else {
				filters = [new sap.ui.model.Filter("IvCompcode", sap.ui.model.FilterOperator.EQ, this._data.getProperty('/Compcode'))];
			}
			oEvent.getSource().getBinding("items").filter(filters);
		},
		//================================================================
		//======<< On Save Request  >>====================================
		//================================================================
		onSave: function (Oevent) {
			var checker = 0,
				JE_Type_DE = 0,JE_Type_CR = 0
			var oMessage;
			// Remove All Messages Added.
			sap.ui.getCore().getMessageManager().removeAllMessages();
			// Company Code
			if (this.getView().byId('comp_code_id').getValue() !== '') {
				this.getView().byId('comp_code_id').setValueState(sap.ui.core.ValueState.None);
			} else {
				this.getView().byId('comp_code_id').setValueState(sap.ui.core.ValueState.Error);
				checker = 1;
			}
			// request Type
			if (this.getView().byId('req_type_id').getSelectedKey() !== '') {
				this.getView().byId('req_type_id').setValueState(sap.ui.core.ValueState.None);
			} else {
				this.getView().byId('req_type_id').setValueState(sap.ui.core.ValueState.Error);
				checker = 1;
			}
			// Reason Journal 
			if (this.getView().byId('reason_id').getValue() !== '') {
				this.getView().byId('reason_id').setValueState(sap.ui.core.ValueState.None);
			} else {
				this.getView().byId('reason_id').setValueState(sap.ui.core.ValueState.Error);
				checker = 1;
			}
			//Doc Type
			if (this.getView().byId('doc_type_id').getValue() !== '') {
				this.getView().byId('doc_type_id').setValueState(sap.ui.core.ValueState.None);
			} else {
				this.getView().byId('doc_type_id').setValueState(sap.ui.core.ValueState.Error);
				checker = 1;
			}
			// Currency
			if (this.getView().byId('curr_id').getValue() !== '') {
				this.getView().byId('curr_id').setValueState(sap.ui.core.ValueState.None);
			} else {
				this.getView().byId('curr_id').setValueState(sap.ui.core.ValueState.Error);
				checker = 1;
			}
			if (checker == 1) {
				oMessage = new Message({
					message: "Pls Fill the Mandatory Header Fields.",
					type: MessageType.Error,
					target: "/Dummy",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);
			}
			//=============<< Items Validation >>======================
			if (this._data.getData().JEREItemSet.length <= 0) {
				checker = 1;
				oMessage = new Message({
					message: "No Items Added",
					type: MessageType.Error,
					target: "/Dummy",
					processor: this.getView().getModel()
				});
				sap.ui.getCore().getMessageManager().addMessages(oMessage);
			} else {
				//=============<< JV Posting >>==========================
				if (this._data.getData().Reqtype == "JE") {
					// Atleast Two items and one Credit & one Debit.
					if (this._data.getData().JEREItemSet.length < 2) {
						checker = 1;
						oMessage = new Message({
							message: "Pls Add Atleast Two Items for JE RequestType ,One Credit & One Debit.",
							type: MessageType.Error,
							target: "/Dummy",
							processor: this.getView().getModel()
						});
						sap.ui.getCore().getMessageManager().addMessages(oMessage);
					} else {
						for (var z = 0; z < this._data.getData().JEREItemSet.length; z++) {
							if (!this._data.getData().JEREItemSet[z].Glaccount1 || this._data.getData().JEREItemSet[z].Glaccount1 == "") {
								checker = 1;
								break;
							} else if (!this._data.getData().JEREItemSet[z].Dcind || this._data.getData().JEREItemSet[z].Dcind == "") {
								checker = 1;
								break;
							} else if (!this._data.getData().JEREItemSet[z].Amount || this._data.getData().JEREItemSet[z].Amount == "") {
								checker = 1;
								break;
							}
							if(this._data.getData().JEREItemSet[z].Dcind == 'DR')
							{
								JE_Type_DE = 1;
							}
							if(this._data.getData().JEREItemSet[z].Dcind == 'CR')
							{
								JE_Type_CR = 1;
							}
						}
						if (checker == 1) {
							oMessage = new Message({
								message: "Pls Fill the Mandatory Items Fields.",
								type: MessageType.Error,
								target: "/Dummy",
								processor: this.getView().getModel()
							});
							sap.ui.getCore().getMessageManager().addMessages(oMessage);
						}
						if(JE_Type_DE == 0 || JE_Type_CR == 0){
							checker = 1;
							oMessage = new Message({
							message: "Pls Add Atleast Two Items for JE RequestType ,One Credit & One Debit.",
							type: MessageType.Error,
							target: "/Dummy",
							processor: this.getView().getModel()
						});
						sap.ui.getCore().getMessageManager().addMessages(oMessage);
						}
					}
					// =====<< Reclassification Area >>============================	
				} else if (this._data.getData().Reqtype == "RE") {
					for (var i = 0; i < this._data.getData().JEREItemSet.length; i++) {
						if (!this._data.getData().JEREItemSet[i].Glaccount1 || this._data.getData().JEREItemSet[i].Glaccount1 == "") {
							checker = 1;
							break;
						} else if (!this._data.getData().JEREItemSet[i].Glaccount2 || this._data.getData().JEREItemSet[i].Glaccount2 == "") {
							checker = 1;
							break;
						}
						if (!this._data.getData().JEREItemSet[i].Accassignmnt1 || this._data.getData().JEREItemSet[i].Accassignmnt1 == "") {
							checker = 1;
							break;
						} else if (!this._data.getData().JEREItemSet[i].Accassignmnt2 || this._data.getData().JEREItemSet[i].Accassignmnt2 == "") {
							checker = 1;
							break;
						} else if (!this._data.getData().JEREItemSet[i].Amount || this._data.getData().JEREItemSet[i].Amount == "") {
							checker = 1;
							break;
						}
					}
					if (checker == 1) {
						oMessage = new Message({
							message: "Pls Fill the Mandatory Items Fields.",
							type: MessageType.Error,
							target: "/Dummy",
							processor: this.getView().getModel()
						});
						sap.ui.getCore().getMessageManager().addMessages(oMessage);
					}
				}
			}

			// Posting
			if (checker === 0) {
				var oUploadCollection = that.byId("UploadCollection");
				this.getView().getModel().create('/JEREHeaderSet', this._data.getData(), {
					success: function (oData, oResponse) {
						if (oData.Requestid) {
							that._data.setProperty("/Requestid", oData.Requestid);
							that.byId("UploadCollection").setUploadUrl(
								"/sap/opu/odata/sap/ZGW_FI_JEREPOSTFI_SRV/JEREHeaderSet('" + oData.Requestid + "')/AttachFileJERESet"
							);
							that.byId("UploadCollection").upload();
							that.onReset();
							MessageBox.success("Request" + " " + oData.Requestid + " " + "created successfully");
							that.oRouter.navTo("DetailPage1", {
								ObjectId: oData.Requestid
							}, true);
						}

					},
					error: function (oData, oResponse) {
						oData.responseText = JSON.parse(oData.responseText);
						if (oData.responseText.error.innererror.errordetails[0].message) {
							sap.m.MessageBox.error(oData.responseText.error.innererror.errordetails[0].message);
						}
					}
				});
			} else {
				MessageBox.error("Pls Check The Error Log.");
				// if (this._data.getData().JEREItemSet.length > 0) {

				// } else {
				// 	MessageBox.error("Fill Mandatory Fields & Add Items");
				// }

			}
		},
		onReset: function (oEvent) {
			var oUploadCollection = that.byId("UploadCollection");
			oUploadCollection.removeHeaderParameter();
			oUploadCollection.removeAllItems();
			oUploadCollection.removeAllParameters();
			this.getView().byId('comp_code_id').setDescription('');
			this.getView().byId('doc_type_id').setDescription('');
			this.getView().byId('curr_id').setDescription('');
			// this.getView().byId('req_type_id').setDescription('');
			this._data.setData({});
		},
		onChangeReqType: function (oEvent) {
			if (oEvent.getSource().getSelectedKey() == 'RE') {
				this.getView().byId('JvitemsTable').setVisible(false);
				this.getView().byId('ReitemsTable').setVisible(true);
				this._data.getData().JEREItemSet = [];

			} else {
				this.getView().byId('JvitemsTable').setVisible(true);
				this.getView().byId('ReitemsTable').setVisible(false);
				this._data.getData().JEREItemSet = [];
			}
			oEvent.getSource().setValueState('None');
		},
		addrowitem: function (oEvent) {
			if (this._data.getData().JEREItemSet) {
				this._data.getData().JEREItemSet.push({});
			} else {
				this._data.getData().JEREItemSet = [];
			}

			this._data.refresh();
		},
		onDeleteRow: function (oEvent) {
			if (oEvent.getParameter('listItem')) {
				this._data.getData().JEREItemSet.splice(oEvent.getSource().indexOfItem(oEvent.getParameter('listItem')), 1);
				this._data.refresh();
			}

		},
		getchangeamount: function (oEvent) {
			var value = oEvent.getSource().getValue();
			if (value) {
				oEvent.getSource().setValue(value.toFixed(2));
			}
		},
		onChangeInput: function (oEvent) {
			var oInput = oEvent.getSource();
			this._validateInput(oInput);
		},
		_validateInput: function (oInput) {
			var oBinding = oInput.getBinding("value");
			var sValueState = "None";
			var sValueStateText = "";
			var bValidationError = false;
			if (oBinding.getValue().length === 0) {
				sValueState = "Error";
				sValueStateText = "Empty Value";
			}

			oInput.setValueState(sValueState);
			if (sValueState === "Error") {
				oInput.setValueStateText(sValueStateText);
			}

			return bValidationError;
		},
		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},
		_getMessagePopover: function () {
			// create popover lazily (singleton)
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment('MessagePopover',
					"com.sap.jvPosting.view.fragments.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		}
	});
}, /* bExport= */ true);