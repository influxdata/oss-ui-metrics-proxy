#!/usr/bin/env node
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

import {InfluxDB, Point} from '@influxdata/influxdb-client';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.raw());
const port = 3030;

const baseURL = process.env.INFLUX_URL;
const influxToken = process.env.INFLUX_TOKEN;
const org = process.env.ORG;
const bucket = process.env.BUCKET;

const influx = new InfluxDB({url: baseURL, token: influxToken});
const influxWriteProxy = influx.getWriteApi(org, bucket, 'ns');


app.post('/api/v2/app-metrics', (req, res) => {
  const {points} = req.body;
  const lines = [];
  points.forEach(point => {
    const parnt = new Point(point.measurement);
    for (const tag in point.tags) {
      parnt.tag(tag, point.tags[tag]);
    }

    for (const field in point.fields) {
      if (typeof point.fields[field] === 'string') {
        parnt.stringField(field, point.fields[field]);
      } else if (typeof point.fields[field] === 'number') {
        parnt.floatField(field, point.fields[field]);
      } else {
        console.error(`dropped measurement ${field}`, point.fields[field]);
      }
    }
    influxWriteProxy.writePoint(parnt);
  })

  influxWriteProxy.flush()
    .then(response => res.sendStatus(201))
    .catch(error => res.status(500).send(error));
});

app.listen(port, () => {
  console.log(`listening on port :${port}`);
});
