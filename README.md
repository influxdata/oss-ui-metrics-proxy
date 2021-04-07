# OSS Metrics Proxy
A simple proxy server that mimics the service Influx uses to write Cloud UI metrics to an internal instance of InfluxDB

## Set up
The influx daemon needs to be started with the proper flag turned on. When starting your `influxd` process, add the flag `--feature-flags=appMetrics=true`

```sh
influxd --feature-flags=appMetrics=true [--assets-path=../ui/build]
```

We need to set up the local InfluxDB UI to proxy requests to our metrics service. To do that, we'll modify the [`webpack.dev.ts`](https://github.com/influxdata/ui/blob/3263d9fb0836e0f169a3a316f3b7dd46f3bddbba/webpack.dev.ts#L28) file's `proxy` block by adding the following entry to the *top* of the proxy object:

```ts
proxy: {
  '/api/v2/app-metrics': 'http://localhost:3030',
```

from here, run `yarn start` from the `ui` directory, and you should be ready to setup and run the server:

## Running (simple node method)
```sh
npm install

INFLUX_URL=http://localhost:8080 INFLUX_TOKEN=your_influx_token ORG=influx BUCKET=defbuck node index.js
```

## Running (Docker method)

1. Edit .env file with your proper values
  1. for `INFLUX_URL` see [this StackOverflow post](https://stackoverflow.com/a/31328031/92446)
1. Build the server:
   ```sh
   docker build -t oss_metrics_proxy .
   ```
1. Run the server:
   ```sh
   docker run -p 3030:3030 --env-file=.env -d oss_metrics_proxy
   ```

## Testing
Hit your local homepage at http://localhost:8080/. Open your network tab. You should see a `201` from `app-metrics`
