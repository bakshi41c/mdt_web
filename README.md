# C-meet frontend

## Quick Start
To set everything up including the backend, follow the quick setup section on [C-meet Backend repo](https://github.com/bakshi41c/mdt_server)

## Manual setup
To only setup the frontend: <br>
1. Make sure you have Node 10.15+ and NPM 6.4+ installed
2. Run `npm install -g @angular/cli@7.3.0`
3. Run `npm install`
4. Copy `bootstrap_theme/bootstrap.css` to  `node_modules/bootstrap/dist/css/bootstrap.css`
5. Check the config at `src/environment/environment.ts` and make sure all the fields are correct (for backend connection).
6. Follow 'Depelopment server' section


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## DeeID
The system utilises [DeeID Websocket server](https://github.com/deeid/websocket_server).
The default configuration uses the publicaly available server at: [ws://deeid.uksouth.azurecontainer.io:5678]()

The DeeID mobile app (which is required to sign in) can be obtained from: <br>
[https://github.com/sirvan3tr/OmneeMobileApp](https://github.com/sirvan3tr/OmneeMobileApp)

