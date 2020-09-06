const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const api = require('./src/api');
const credential = require("./credential.json");

const app = express();
admin.initializeApp({
  credential: admin.credential.cert(credential),
  databaseURL: "https://jsondb-d8a6a.firebaseio.com"
});
const db = admin.firestore();

app.use(cors({ origin: true }));

app.post('/auth', (req, res) => api.auth(req, res, db));
app.post('/select', (req, res) => api.select(req, res, db));
app.post('/update', (req, res) => api.update(req, res, db));
app.post('/remove', (req, res) => api.remove(req, res, db));
app.post('/create', (req, res) => api.create(req, res, db));

exports.app = functions.https.onRequest(app);