## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Mon Aug 28 2023 08:47:08 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.10.5|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>simple|
|**Service Type**<br>None|
|**Service URL**<br>N/A
|**Module Name**<br>mcconedashboard|
|**Application Title**<br>MCC One Dashboard|
|**Namespace**<br>com.sap.mcconedashboard|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.117.1|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## mcconedashboard

This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite. 

#### Pre-requisites:

- Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)
- Cloud Foundry CLI ([cf](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)) (by default available in BAS)
- Access to Cloud Foundry Space

#### IDE
- We recommend to use Business Application Studio or another IDE such as Visual Code/IntelliJ for development
- Access to BAS via https://sapit-customersupport-dev-mallard.eu10cf.applicationstudio.cloud.sap/index.html

Contact Verena Schober, if you do not have access to either BAS or the Cloud Foundry space. 

### Running the generated app locally

- In order to run the generated app locally, initally simply run the following from the generated app root folder:

```
    npm run setup
    npm run setup <passcode>
    npm run start-local-router
```
Afterwards, it suffices to run to restart the app:
```
    npm run start-local-router
```

Open the app on port 5000 to view it locally.


#### Solving Problem: Ports are blocked
If you are running into the problem, that the ports are blocked, because you reran the app after terminating it, terminate existing processes on ports 5000 or 8080 through:
```
lsof -t -i:<port>
kill <process>
```
[Visit Developer Onboarding](https://sap.sharepoint.com/sites/202065/SitePages/MCC-Tool-Suite---Development-Guidelines-and-Best-Practices.aspx)
