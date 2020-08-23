sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */

		getstatus: function (sStatus) {
			if (sStatus === "Approved") {
				return "Success";
			} else if (sStatus === "Submitted") {
				return "Warning";
			} else if (sStatus === "Rejected") {
				return "Error";
			} else {
				return "None";
			}
		},
		getfilelink: function (req, file) {
			return "/sap/opu/odata/sap/ZGW_FI_JEREPOSTFI_SRV/JEREHeaderSet('" + req + "')/AttachFileJERESet(Requestid='" + req + "',Filename='" +
				file + "')/$value";
		},
		getvisiability1: function (type) {
			if (type == 'JE') {
				return true;
			} else {
				return false;
			}
		},
		getvisiability: function (type) {
			if (type == 'RE') {
				return true;
			} else {
				return false;
			}
		},
		getdecimal: function (value) {
			if (value) {
				return value.toFixed(2);
			}
		},
		gettypetext: function (type) {
			if (type == 'DR') {
				return 'Debit';
			} else if (type == 'CR') {
				return 'Credit'
			}
		},
		validationvalue:function(value)
		{
			if(!value || value == '')
			{
				return 'Error';
			}else {
				return 'None';
			}
		}

	};

});