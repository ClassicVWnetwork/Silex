const fs = require('fs');
const express = require('express');
const https = require('https');

export default function(sslOptions, app) {
  const router = express.Router();

  // SSL
  // force ssl if the env var SILEX_FORCE_HTTPS is set
  if (sslOptions.forceHttps) {
    console.log('> Force SSL option is enabled');
    const forceSSL = require('express-force-ssl');
    app.set('forceSSLOptions', {
      trustXFPHeader: !!sslOptions.trustXFPHeader,
    });
    router.use(forceSSL);
  } else {
    console.log('> Force SSL option is disabled, env var SILEX_FORCE_HTTPS not set');
  }

  // SSL certificate
  if (sslOptions.privateKey && sslOptions.certificate) {
    console.log('> SSL certificate is enabled, found certificate:', sslOptions.certificate);
    try {
      let privateKey = fs.readFileSync(sslOptions.privateKey).toString();
      let certificate = fs.readFileSync(sslOptions.certificate).toString();

      let options = {
        key: privateKey,
        cert: certificate,
        requestCert: true,
        rejectUnauthorized: false,
      };

      https.createServer(options, this).listen(sslOptions.sslPort, function() {
        console.log('SSL: listening on port ', sslOptions.sslPort);
      });
    } catch (e) {
      console.error('SSL: load certificate failed.', e);
    }
  } else {
    console.log('> SSL certificate disabled, env vars SILEX_SSL_CERTIFICATE and SILEX_SSL_PRIVATE_KEY not set');
  }
  return router;
}
