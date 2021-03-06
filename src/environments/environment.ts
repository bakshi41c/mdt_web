// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // REST API server address
  restServerAddress: "http://localhost:51234",

  // Meeting WebSocket Server address
  meetingServerAddress: "http://localhost:51235",

  // DeeID Server 
  deeIdServerAddress: "ws://deeid.uksouth.azurecontainer.io:5678",

  // Server Ethereum Address - Hardcoded
  serverPublicEthAddress: '0x1c0b2f7a73ecbf7ce694887020dbcbaaa2e126f7'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
