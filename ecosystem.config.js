module.exports = {
  apps: [
    {
      name: 'smart-school-socket',
      script: 'node',
      args: 'index.js',
      env: {
        NODE_ENV: 'production',
        BASE_URL: 'http://sas.qelopak.com',
        WS_URL: 'http://localhost:5000'
      }
    }
  ]
};
