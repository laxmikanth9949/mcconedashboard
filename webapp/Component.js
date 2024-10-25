sap.ui.getCore().loadLibrary("sapit", {
	url: sap.ui.require.toUrl("com/sap/mcconedashboard") + "/resources/sapit", async:
		true
});
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/mcconedashboard/model/models",
	"com/sap/mcconedashboard/controller/ErrorHandler",
	"sapit/util/UsageTracking",
	"sap/ui/model/json/JSONModel",
	"sapit/util/cFLPAdapter",
	"com/sap/mcconedashboard/connector/FeatureFlagConnector"

], function (UIComponent, Device, models, ErrorHandler, UsageTracking, JSONModel, cFLPAdapter, FeatureFlagConnector) {
	"use strict";

	var useMobileView;
	var bIsFirstRun = true; // Flag-Variable für den ersten Aufruf

	return UIComponent.extend("com.sap.mcconedashboard.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			//**********************************
			//******* internal version to release mapping *********
			//* Honeycomb version 1.0.52		RD08.20 Q3 Release 2020	initial Release -->  2008
			//* Honeycomb version 1.0.145		RD10.20 Q4 Release 2020	--> 2010
			//* Honeycomb version 1.0.168		RD11.20 Q4 Release 2020	--> 2011
			//* Honeycomb version 1.0.206		RD01.21 Q1 Release 2021	--> 2101
			//* Honeycomb version 1.0.255		RD02.21 Q1 Release 2021	--> 2102
			//* Honeycomb version 1.0.272		2104 - Q1 Release 2021	-->  IT independent release
			//* Honeycomb version 1.0.303		RD05.21	Q2 Release 2021
			//* Honeycomb version 1.0.334		2106 - Q2 Release 2021	-->  IT independent release
			//* Honeycomb version 1.0.350		RD07.21 - Q3 Release 2021 2107
			//* Honeycomb version 1.0.366		RD09.21 - Q3 Release 2021  2109
			//* Honeycomb version 1.0.395		RD10.21 - Q4 Release 2021  2110 -->  Version before bugfix after RD10 GO live --> 21.10 new Versionnumbering see below
			// Version numbering change <JJ>.<MM>.<sequential number>
			//* Honeycomb version 21.10.2		RD10.21 - Q4 Release 2021  2110
			//* Honeycomb version 21.11.10 		RD11.21 - Q4 Release 2021  2111
			//* Honeycomb version 22.02.116		no RELEASE RD02.22 - Q1 Release 2022  2202 -->  working/development Version with structure rework and MCS Dashboard integration for RD05.22/2105. Will be deployed as Version 2205, starting with UAT Phase -->  see below
			//* Honeycomb version 22.04.3		FD17+ - Q2 Release 2022  2204 Remove of BDM, when BDM goes live in ServiceNow, based on 2111 Release
			//* Honeycomb version 22.05.20		RD05.22 Q2 Release 2022  2205 Structue rework, UI re-design; Event Calendar, MCS Dashboard integration 
			//* Honeycomb version 22.07.49		RD07.22 Q3 Release 2022  2207 Pre- Release: Anonymization Flag
			//*																	Main Release: MCC Tags, Bug Fix for incident component from Service Now	
			//* Honeycomb version 22.10.41		RD10.22 Q4 Release 2022  2210
			//* Honeycomb version 22.11.19		RD11.22 Q4 Release 2022  2211
			//* Honeycomb version 23.03.44		SolutionHub Service Updates etc
			//* Honeycomb version 23.06.54		RD06.23	Q2 Release 2023  2306
			//* Honeycomb version 23.09.89		RD09.23	Q3 Release 2023  2309
			//* Honeycomb version 24.8.53	    RD11.23	Q4 Release 2023  2311 | Migration does not allow leading zeros in Versioning
			//*

			// !!!!!    also change in manifest.json 
			// Change in HelpPopover.fragment not longer needed, because automatically read from manifest.json via "versionInfo" model
			//
			//**********************************
			//**********************************
			//**********************************
			// BWP oData info - Mapping to functions
			//
			// MCASE_COST_ODA_001N_SRV  	Top Escalations - for ODA service; restricted by Country
			// MCASE_COST_ODA_002N_SRV 		Total Escalation Costs - for ODA service; restricted by Cou
			// MCASE_COST_ODA_003N_SRV		Single Escalation Costs - for ODA service; restricted by Cou
			// MCASE_COST_ODA_004N_SRV		Total Actual Escalation Costs - for ODA service
			// MCASE_COST_ODA_005N_SRV		Average Closed Escalation Costs - for ODA service
			// MCASE_COST_ODA_006N_SRV		Cost Overview
			// MCASE_COST_ODA_007N_SRV		Escalation Costs per Delivery Unit
			// MCASE_COST_ODA_008N_SRV		TOP 5 product lines with high escalation cost
			// MCASE_COST_ODA_009N_SRV		Escalation Costs of Top 5 Strategic Product Lines
			// MCASE_COST_ODA_010N_SRV		Escalation by Support Model

			// MCATS0003_CRA_01_OD2_SRV  	CATS Daten / CATS BU Controller Activities Demand View

			//**********************************
			//**********************************
			//**********************************
			//Diverse examples for Customer Visit checks
			// showColumnVisibilityMenu="{=!${settings>/isAnonymizedMode}}"
			// visible="{= ${settings>/isAnonymizedMode}}" 
			// visible="{= !${settings>/isAnonymizedMode}}" 
			// visible="{= ${settings>/isAnonymizedMode} === true ? false : true}" 
			// visible="{= (${settings>/ShowGlobalEscalations} || ${settings>/ShowRegionalGlobalEscalations} || ${settings>/ShowGlobalAggregation} ) &amp;&amp; !${settings>/isAnonymizedMode} }"
			// visible="{= ${settings>/showProductEscalations} &amp;&amp; !${settings>/isAnonymizedMode}}"
			// visible="{= (${crossIssue>/CreatedBy} !== '')&amp;&amp; !${settings>/isAnonymizedMode}}"
			//
			// objectImageURI="/int_ic/sap/ZS_APP_DEP_SRV/CustomerSet('{= ${settings>/isAnonymizedMode} === true ? '' :${case>/CustomerCrmNo}}')/$value"
			// text="{= ${settings>/isAnonymizedMode} === true ? ${i18n>anonymizedText}: ${case>/CustomerText}}" 
			//
			// <m:FormattedText htmlText="{path:'crossIssue>/engagementReason',formatter:'.formatter.formatString'}" visible="{= !${settings>/isAnonymizedMode}}"/>
			// <m:FormattedText htmlText="{i18n>anonymizedText}" visible="{= ${settings>/isAnonymizedMode}}"/>
			//
			// formatter:  formatCustomerName   getTopIssueChangedText
			// 	xmlns:tnt="sap.tnt"
			// 	<tnt:InfoLabel text="{i18n>anonymizedInfo}" visible="{= ${settings>/isAnonymizedMode}}" colorScheme="3" width="250px" class="sapUiMediumMarginBegin sapUiTinyMarginTop"/>
			//
			//			// in case of anonymized mode, no GEM should be retunrned
			//if (this.getOwnerComponent().getModel("settings").getProperty("/isAnonymizedMode") === false) {
			//**********************************
			//**********************************
			//**********************************
			//
			// ===============================================
			// init mobile usage reporting
			// ===============================================
			//this._initMobileUsageReporting();
			// end of init mobile usage reporting ============

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// enable routing
			this.getRouter().initialize();
			var oRouter = this.getRouter();
			oRouter.attachRouteMatched(this.onRouteMatched, this);

			cFLPAdapter.init();

			//check if user is authorized
			var oModel = this.getModel();

			//set local app settings model
			//set maximium visibility security by disabling all tiles by default
			//only if the user has the right to call the service, the tiles/content should be shown
			var bShowCrmData = false;
			var bShowCostData = false;
			var settingsModel = models.createAppSettingModel(bShowCrmData, bShowCostData);
			this.setModel(settingsModel, "settings");

			this.authorityPromise = new Promise(function (resolve) {
				oModel.read("/AuthoritySet", {
					success: function (data) {
						this._setUserAccessProperty(data.results[0], resolve);
					}.bind(this),
					error: function (data) { }
				});
			}.bind(this));

			var oFilterModel = models.createFilterModel();
			this.setModel(oFilterModel, "filterModel");

			//define 
			var oFavoriteModel = new sap.ui.model.json.JSONModel({
				tiles: [],
				loadingFavorites: true,
				reload: true
			});
			this.setModel(oFavoriteModel, "favoriteModel");

			var oCustomerModel = new sap.ui.model.json.JSONModel({
				reloadCustomer: true
			});
			this.setModel(oCustomerModel, "customerModel");

			var oCaseModel = new sap.ui.model.json.JSONModel({
				reload: true
			});
			this.setModel(oCaseModel, "case");

			var oDataModel = new sap.ui.model.json.JSONModel({
				reloadCriticalPeriodCoverage: true,
				reloadCustomerVisits: true,
				reloadProjectsOnWatch: true,
				reloadMissionRadar: true,
				reloadCrossIssues: true,
				reloadTopCriticalCustomers: true,
				reloadCriticalCustomerManagement: true,
				reloadEngagementTaskForces: true,
				reloadOutages: true,
				reloadTaskForces: true,
				reloadCriticalEventCoverage: true,
				criticalCustomerManagementCaseState: "open",
				criticalCustomerManagementFilter: "none",
				reloadCreEngagements: true,
				globalEscalationsCaseState: "open",
				executiveGEMCaseState: "open",
				customerVisitsState: "ongoing",
				projectsOnWatchState: "ongoing",
				criticalEventCoverageState: "ongoing",
				executiveGEMCaseSelectedTabBarKey: "All",
				executiveGEMClosedDate: "",
				outagesState: "open",
				taskForcesState: "open",
				taskForcesFilter: "none",
				tagName: "",
				businessDownSituationsCaseFilter: "none",
				globalEscalationsCaseFilter: "none"
			});
			this.setModel(oDataModel, "data");

			//load user api
			this.getCurrentUser();

			//Model for main tiles showing in Global view
			var oTileNumbers = {
				cimState: "Loading",
				mccCasesState: "Loading",
				businessDownState: "Loading",
				globalEscalationsState: "Loading",
				globalEscRequestsState: "Loading",
				outagesState: "Loading",
				ongoingGEMStatisticState: "Loading"
			};
			var oTileModel = new sap.ui.model.json.JSONModel(oTileNumbers);
			this.setModel(oTileModel, "tileModel");

			//Used for counting the tiles / listItems
			var oTaskForcesModel = new sap.ui.model.json.JSONModel({
				count: 0
			});
			this.setModel(oTaskForcesModel, "taskForcesModel");

			var oVersionModel = new sap.ui.model.json.JSONModel({
				version: this.getManifestEntry("/sap.app/applicationVersion/version")
			});
			this.setModel(oVersionModel, "versionInfo");
			// ===============================================
			// init mobile usage reporting
			// ===============================================
			UsageTracking.startUsageTracking(this);

			//====================================================

			// BW Filter Model
			var filtersModel = models.createBWFiltersModel(settingsModel);
			this.setModel(filtersModel, "bwFilterModel");

			// Set the global filters model for pdf/excel report generation
			var mimeFiltersModel = models.createExtReportFiltersModel();
			this.setModel(mimeFiltersModel, "extReportFilters");

			// Set the dashboard model
			//has been set implizitly in the manifest file. therefore read it from the context
			var dashboardModel = this.getModel("mcsModel");

			//has been set implizitly in the manifest file. therefore read it from the context
			// var bwp001HighCostBWModel = this.getModel("bwp001HighCostBWModel"),
			// 	bwp002TotalCostBWModel = this.getModel("bwp002TotalCostBWModel");

			// ODATA_COUNT call oData in order to get counter for tiles back
			// this.setModel(models.createTileCounterModel(oModel,dashboardModel, bwp001HighCostBWModel, bwp002TotalCostBWModel, filtersModel,
			// 		settingsModel,
			// 		this.getModel("i18n").getResourceBundle()),
			// 	"tiles");

			//check if user has global sales org auth - MCS Dashboard specific handling --> better to keep it separate, because of confidential data shown in the MCS Dashboard part of the app
			models.checkSalesOrgAuth(dashboardModel, settingsModel, this.getModel("i18n").getResourceBundle());

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			//====================================================

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			//Get Device Model
			var oDeviceModel = this.getModel("device");

			//Get the Device Data
			var oDeviceData = oDeviceModel.getData();

			//Check the device type
			var bIsDesktop = oDeviceData.system.desktop;
			var bIsPhone = oDeviceData.system.phone;
			var bIsTablet = oDeviceData.system.tablet;

			if (bIsDesktop && !bIsPhone && !bIsTablet) { // Desktop
				useMobileView = false;

			} else if (!bIsPhone && bIsTablet && bIsDesktop) { // Desktop and Tablet
				useMobileView = false;

			} else if (bIsPhone && bIsTablet && !bIsDesktop) { // Phone and Tablet
				useMobileView = true;

			} else if (bIsPhone && !bIsTablet && !bIsDesktop) { // Phone
				useMobileView = true;

			} else if (!bIsPhone && bIsTablet && !bIsDesktop) { //Tablet
				useMobileView = true;
			}

			sap.ui.core.IconPool.registerFont({
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			});

			var oSubModel = this.getModel("subModel");
			var oCountryModel = new JSONModel();
			models.createCountryRegionModel(oCountryModel, oSubModel);
			this.setModel(oCountryModel,
				"countryRegionModel");

			this.setTimeoutInterval("mcconedashboard");

			var featureFlags = ["mcc-onedashboard.showaisummary", "mcc-onedashboard.showtestfeature", "mcc-onedashboard.ccspreview"];
			FeatureFlagConnector.loadFeatureFlags(featureFlags).then((result) => {
				this.setModel(new JSONModel(result), "featureFlags")
			});

		},

		getCurrentUser: function () {
			jQuery.ajax({
				url: sap.ui.require.toUrl("com/sap/mcconedashboard") + "/user-api/currentUser",
				async: false,
				method: "GET",
				dataType: 'json',
				success: function (oUserData) {
					this.setModel(new JSONModel(oUserData), "userapi");
				}.bind(this),
				error: function (err) {
					this.setModel(new JSONModel({}), "userapi");
				}.bind(this)
			});
		},

		onRouteMatched: function (oEvent) {
			// Get Router, Viewname and optional Arguments
			var oRouter = this.getRouter();
			var oRoute = oEvent.getParameter("config");
			var sCurrentView = oEvent.getParameter("name");
			var oArguments = oEvent.getParameter("arguments");

			// Extract query parameters from arguments
			var oQueryParams = {};
			for (var sParamName in oArguments) {
				if (sParamName.startsWith("?")) {
					oQueryParams[sParamName.slice(1)] = oArguments[sParamName];
				}
			}

			// Remove query parameter object from arguments
			delete oArguments["?"];

			// Merge query parameters back into arguments as query parameters
			var sQueryParams = "";
			for (sParamName in oQueryParams) {
				sQueryParams += sParamName + "=" + oQueryParams[sParamName] + "&";
			}

			// Remove trailing "&" if there are query parameters
			if (sQueryParams) {
				sQueryParams = "?" + sQueryParams.slice(0, -1);
			}

			// Remove Args without value
			Object.keys(oArguments).forEach(function (key) {
				if (oArguments[key] === undefined || oArguments[key] === null || oArguments[key] === "") {
					delete oArguments[key];
				}
			});

			//Remove Args without value in queryParams
			Object.keys(oQueryParams).forEach(function (key) {
				if (oQueryParams[key] === undefined || oQueryParams[key] === null || oQueryParams[key] === "") {
					delete oQueryParams[key];
				}
			});

			if (bIsFirstRun) {
				// Adjust the URL to fit the device
				if ((sCurrentView.includes("Mobile") && useMobileView) || (!sCurrentView.includes("Mobile") && !useMobileView)) {
					// Do normal routing
				} else if (sCurrentView.includes("Mobile") && !useMobileView) {
					// Check if there is a non-Mobile Version of the view
					if (this.doesViewExist(sCurrentView.replace("Mobile", ""))) {
						// Remove "Mobile" and route

						sCurrentView = sCurrentView.replace("Mobile", "");
						//oRouter.navTo(sCurrentView, oArguments, {replace: true});
						oRouter.navTo(sCurrentView, oArguments);
					} else {
						oRouter.navTo(sCurrentView, oArguments);
					}
				} else if (!sCurrentView.includes("Mobile") && useMobileView) {
					//Check if there is a Mobile Version of the view
					if (this.doesViewExist(sCurrentView + "Mobile")) {
						// Add "Mobile" and route
						//oRouter.navTo(sCurrentView + "Mobile", oArguments);
						sCurrentView = sCurrentView + "Mobile";
						oRouter.navTo(sCurrentView, oArguments);
					} else {
						oRouter.navTo(sCurrentView, oArguments);
					}
				}
				this.getModel("settings").setProperty("/isMobileMode", useMobileView);
				bIsFirstRun = false;

			} else if (!bIsFirstRun) {
				var bForcedMobileViaSwitch = this.getModel("settings").getProperty("/isMobileMode");
				// Adjust the URL to fit the mode
				if ((sCurrentView.includes("Mobile") && bForcedMobileViaSwitch) || (!sCurrentView.includes("Mobile") && !bForcedMobileViaSwitch)) {
					// Do normal routing
					return;
					/*	var oCurrentRoute = oRouter.getRoute(sCurrentView);
						var oTargetRoute = oRouter.getRoute(oRoute.name);
						if (oCurrentRoute.getName() === oTargetRoute.getName()) {
							// The target view is the same as the current view, do nothing
							return;
						}*/
					//	oRouter.navTo(sCurrentView, oArguments);
				} else if (sCurrentView.includes("Mobile") && !bForcedMobileViaSwitch) {
					// Check if there is a non-Mobile Version of the view
					if (this.doesViewExist(sCurrentView.replace("Mobile", ""))) {
						// Remove "Mobile" and route

						sCurrentView = sCurrentView.replace("Mobile", "");
						oRouter.navTo(sCurrentView, oArguments);
					} else {
						oRouter.navTo(sCurrentView, oArguments);
					}
				} else if (!sCurrentView.includes("Mobile") && bForcedMobileViaSwitch) {
					//Check if there is a Mobile Version of the view
					if (this.doesViewExist(sCurrentView + "Mobile")) {
						// Add "Mobile" and route
						//oRouter.navTo(sCurrentView + "Mobile", oArguments);
						sCurrentView = sCurrentView + "Mobile";
						oRouter.navTo(sCurrentView, oArguments);
					} else {
						oRouter.navTo(sCurrentView, oArguments);
					}
				}

			}
		},

		fireMyRouteMatched: function () {
			var oRouter = this.getRouter();
			var sHash = oRouter.getHashChanger().getHash();
			var oRoute = oRouter.getRouteByHash(sHash);
			var oConfig = oRoute._oConfig;
			var sRouteName = oConfig.name;
			var oArguments = {};

			// Extract argument names from the pattern
			var argumentNames = [];
			var patternParts = oConfig.pattern.split('/');
			for (var i = 0; i < patternParts.length; i++) {
				var part = patternParts[i];
				if (part.startsWith('{') && part.endsWith('}')) {
					argumentNames.push(part.substring(1, part.length - 1));
				}
			}

			// Extract argument values from the hash
			var hashParts = sHash.split('/');
			for (var i = 0; i < argumentNames.length; i++) {
				var argumentName = argumentNames[i];
				if (hashParts[i + 1]) { // Skip the first part since it's the route name
					oArguments[argumentName] = hashParts[i + 1];
				}
			}

			oRouter.fireRouteMatched({
				name: sRouteName,
				arguments: oArguments,
				config: oConfig
			});

		},

		doesViewExist: function (sViewName) {
			var oManifest = this.getManifest();
			//var oTarget = oManifest["sap.ui5"]["routing"]["targets"][sViewName];
			if (oManifest["sap.ui5"]["routing"]["targets"].hasOwnProperty(sViewName)) {
				// Target "sViewName" does exist
				return true;
			} else {
				// Target "sViewName" doesn't exist
				return false;
			}
		},

		setTimeoutInterval: function (app) {
			var url = "https://" + "fiorilaunchpad.sap.com/sap/fiori/" + app + "/Component-preload.js"; //Prod
			var currentUrl = window.location.href;
			if (currentUrl.includes("sapitcloudt") || currentUrl.includes("test-kinkajou")) {
				url = "https://" + "fiorilaunchpad-sapitcloudt.dispatcher.hana.ondemand.com/sap/fiori/" + app + "/Component-preload.js"; //Test
			} else if (currentUrl.includes("br339jmc4c") || currentUrl.includes("dev-mallard")) {
				url = "https://" + "flpsandbox-br339jmc4c.dispatcher.int.sap.eu2.hana.ondemand.com/sap/fiori/" + app + "/Component-preload.js"; //Dev
			}
			setInterval(function () {
				jQuery.ajax({
					type: "HEAD",
					cache: false,
					url: url
				}).done(
					function (result) {
						jQuery.sap.log.debug("pingServer", "Successfully pinged the server to extend the session");
					}
				).fail(
					function () {
						jQuery.sap.log.error("pingServer", "failed to ping the server to extend the session");
					}
				);
			}, 900000); //15 minutes 
		},

		/**
		 *	Update settings model to show only ui sections which the user is authorized for
		 **/
		_setUserAccessProperty: function (oData, resolve) {
			var oSettingsModel = this.getModel("settings");
			var oResourceModel = this.getModel("i18n");
			oSettingsModel.setProperty("/dataLoaded", true);

			var bLayer2 = oData.ShowGlobalAggregation === "X";
			var bLayer3 = oData.ShowGlobalEscalations === "X";

			oSettingsModel.setProperty("/ShowGlobalAggregation", bLayer2); //Layer 2
			oSettingsModel.setProperty("/ShowGlobalEscalations", bLayer3); //Layer 3

			//init bw models only for layer 3 authorization
			/*if (oData.ShowGlobalAggregation === "X" && oData.ShowGlobalEscalations === "X") {
				this._initBWModels();
			}*/

			//not needed because of duplicate see below	oSettingsModel.setProperty("/ShowSalesOrgSpecific", oData.ShowRegionalGlobalEscalations === "X");
			oSettingsModel.setProperty("/ShowRegionalGlobalEscalations", oData.ShowRegionalGlobalEscalations === "X");
			//AUTH Testing
			// oSettingsModel.setProperty("/ShowGlobalAggregation", false);
			// oSettingsModel.setProperty("/ShowGlobalEscalations", false);
			// oSettingsModel.setProperty("/ShowRegionalGlobalEscalations", true);
			//End for Testing
			//Enable not authorized messages
			oSettingsModel.setProperty("/CustomerNotAuthorizedMsgVisible", false);
			oSettingsModel.setProperty("/CustomerNotAuthorizedMsgNumOfCusVisible", false);
			oSettingsModel.setProperty("/globalEscalationNotAuthorizedMsgVisible", false);
			if (oData.ShowRegionalGlobalEscalations === "" && oData.ShowGlobalEscalations === "" && oData.ShowGlobalAggregation === "") {
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgNumOfCusVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsg", oResourceModel.getProperty("notAuthorizedGlobalEscalations"));
			} else if (oData.ShowRegionalGlobalEscalations === "X" && oData.ShowGlobalAggregation === "X" && oData.ShowGlobalEscalations ===
				"") {
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgNumOfCusVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsg", oResourceModel.getProperty("notAuthorizedSalesOrg"));
			} else if (oData.ShowRegionalGlobalEscalations === "X" && oData.ShowGlobalEscalations === "" && oData.ShowGlobalAggregation ===
				"") {
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgNumOfCusVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsg", oResourceModel.getProperty("notAuthorizedSalesOrg"));
			} else if (oData.ShowGlobalAggregation === "X" && oData.ShowRegionalGlobalEscalations === "" && oData.ShowGlobalEscalations ===
				"") {
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgVisible", true);
				oSettingsModel.setProperty("/globalEscalationNotAuthorizedMsgVisible", true);
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsgNumOfCusVisible", false);
				oSettingsModel.setProperty("/globalEscalationNotAuthorizedMsg", oResourceModel.getProperty("restrictedlobalEscalations"));
				oSettingsModel.setProperty("/CustomerNotAuthorizedMsg", oResourceModel.getProperty("restrictedlobalEscalations"));
			}

			if (oSettingsModel.getProperty("/defaultModel_metadataLoaded")) {
				oSettingsModel.setProperty("/showFavoriteTab", true);
			}

			resolve({
				layer2: bLayer2,
				layer3: bLayer3
			});

		},

		_initBWModels: function () {
			/*var bwp001HighCostBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_001N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp001HighCostBWModel, "bwp001HighCostBWModel");*/

			/*var bwp002TotalCostBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_002N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp002TotalCostBWModel, "bwp002TotalCostBWModel");*/

			/*var bwp003DetailCostBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_003N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp003DetailCostBWModel, "bwp003DetailCostBWModel");*/

			/*var bwp004TotalEscaCost13BWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_004N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp004TotalEscaCost13BWModel, "bwp004TotalEscaCost13BWModel");*/

			/*var bwp005AverageEscaCost13BWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_005N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp005AverageEscaCost13BWModel, "bwp005AverageEscaCost13BWModel");*/

			/*var bwp006CostOverviewBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_006N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp006CostOverviewBWModel, "bwp006CostOverviewBWModel");*/

			/*var bwp007EscCostPerProductCategoryBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_007N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp007EscCostPerProductCategoryBWModel, "bwp007EscCostPerProductCategoryBWModel");*/

			/*var bwp008TopProductsWithHighEscCostsBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_008N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp008TopProductsWithHighEscCostsBWModel, "bwp008TopProductsWithHighEscCostsBWModel");*/

			/*var bwp009EscCostsOfStrategicProductsBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_009N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp009EscCostsOfStrategicProductsBWModel, "bwp009EscCostsOfStrategicProductsBWModel");*/

			/*var bwp010EscalationBySupportModelTotalCostBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCASE_COST_ODA_010N_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwp010EscalationBySupportModelTotalCostBWModel, "bwp010EscalationBySupportModelTotalCostBWModel");*/

			/*var bwpCatsActivityOnsiteRemoteBWModel = new sap.ui.model.odata.v2.ODataModel(
				sap.ui.require.toUrl("com/sap/mcconedashboard") + "/apim/bw/sap/opu/odata/sap/MCATS0003_CRA_01_OD2_SRV", {
				"metadataUrlParams": {
					"sap-documentation": "heading"
				},
				"defaultCountMode": true,
				"useBatch": false,
				"headers": {
					"AppIdentifier": "vFkzmhgGIsokhbTq20b492pFxGMABxLU"
				}
			});
			this.setModel(bwpCatsActivityOnsiteRemoteBWModel, "bwpCatsActivityOnsiteRemoteBWModel");

			this._bwModelErrorHandling(bwp001HighCostBWModel);*/
		},

		_bwModelErrorHandling: function (bwp001HighCostBWModel) {
			//================================================
			// MCS Dashboard Models - BW*
			//================================================
			//BW Model - we can use one of the many oData Models form BW" side, because they all rely on the same oData/Cost Authorization
			bwp001HighCostBWModel.attachMetadataFailed(function (oEvent) {
				this.getModel("settings").setProperty("/show_cost_data", Boolean(false));
			}, this);

			bwp001HighCostBWModel.attachMetadataLoaded(function (oEvent) {
				this.getModel("settings").setProperty("/show_cost_data", Boolean(true));
			}, this);
		},

		destroy: function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		//never used
		TBD_getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		stringToBoolean: function (string) {
			switch (string.toLowerCase().trim()) {
				case "true":
				case "yes":
				case "1":
					return true;
				case "false":
				case "no":
				case "0":
				case null:
					return false;
				default:
					return Boolean(string);
			}
		},

		_initMobileUsageReporting: function () {
			sap.git = sap.git || {};
			sap.git.usage = sap.git.usage || {};
			sap.git.usage.Reporting = {
				_lp: null,
				_load: function (a) {
					this._lp = this._lp || sap.ui.getCore().loadLibrary("sap.git.usage", {
						url: "https://" + "trackingshallwe.hana.ondemand.com/web-client/v3",
						async: !0
					});
					this._lp.then(function () {
						a(sap.git.usage.MobileUsageReporting);
					}, this._loadFailed);
				},
				_loadFailed: function (a) {
					jQuery.sap.log.warning("[sap.git.usage.MobileUsageReporting]", "Loading failed: " + a);
				},
				setup: function (a) {
					this._load(function (b) {
						b.setup(a);
					});
				},
				addEvent: function (a, b) {
					this._load(function (c) {
						c.addEvent(a, b);
					});
				},
				setUser: function (a, b) {
					this._load(function (c) {
						c.setUser(a, b);
					});
				}
			};
			sap.git.usage.Reporting.setup(this);
		}


	});
});