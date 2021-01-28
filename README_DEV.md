# Socialbakers API Tableau Web Data Connector v3.0

[https://socialbakers.github.io/public-api-tableau-wdc/socialbakers_api_wdc](https://socialbakers.github.io/public-api-tableau-wdc/socialbakers_api_wdc)

Tableau Web Data Connectors are static web pages that use JS to connect to data-source.

The Tableau WDC SDK provides a way to securely store the credentials and configuration so connectors can be reused
without providing credentials on each execution.

## Run

`npm i -g light-server`

`light-server -p 8000 -s src`

Open http://0.0.0.0:8000/socialbakers_api_wdc.html

Official [Tableau WDC Simulator](https://tableau.github.io/webdataconnector/Simulator) can be used for testing instead 
of Tableau Desktop application.

## Deployment

The deployment of Tableau WDC can be done on any HTTP server, making the contents of `src` directory publicly available.

To submit the connector to [Tableau WDC Community Portal](https://tableau.github.io/webdataconnector/community),
the source code repository needs to be hosted on a public repository (github.com, gitlab.com, ...).

The `.gitlab.ci.yml` is already included that configures and automatically deploys `master` to gitlab pages
 - https://api-connectors.git.ccl/tableau-connector/socialbakers_api_wdc.html
