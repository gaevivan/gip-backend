const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const api = require('./src/api');
const jwt = require("./src/jwt");
const credential = require("./credential.json");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert(credential),
  databaseURL: "https://jsondb-d8a6a.firebaseio.com"
});
const db = admin.firestore();

app.use(cors({ origin: true }));

app.post('/auth', (req, res) => api.auth(req, res, db));
app.post('/refresh-token', (req, res) => api.updateRefreshToken(req, res, db));
app.post('/select', jwt.jwtMiddleware, (req, res) => api.select(req, res, db));
app.post('/update', jwt.jwtMiddleware, (req, res) => api.update(req, res, db));
app.post('/remove', jwt.jwtMiddleware, (req, res) => api.remove(req, res, db));
app.post('/create', jwt.jwtMiddleware, (req, res) => api.create(req, res, db));

exports.app = functions.https.onRequest(app);