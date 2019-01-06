require('@babel/register')({
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties"
  ]
});
require('./server.js');