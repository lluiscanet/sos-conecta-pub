## Webiste for disaster Relief assitance

* Made to deploy in Google App Engine.
* Requires a MongoDB instance running.
* Add the following environment variables to a .env file and to the server.yaml:
** MONGODB_URI: "YOUR_MONGO_DB_CONNECTION_KEY"
** JWT_SECRET: "RANDOM_SECRET"
** VITE_MAPBOX_TOKEN: "YOUR_MAPBOX_KEY"

To run locally:
* Start the server with `npm run start`
* Start the app with `npm run vite`

To deploy to app engine:
* Compile the app with `npm run build`
* Deploy to Google Cloud App Engine with `gcloud app deploy app.yaml server.yaml`
