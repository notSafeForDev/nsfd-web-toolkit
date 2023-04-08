# nsfd-web-toolkit

## Building library
Run: npm run build

## Testing changes in a different project before update
To test changes, in this directory, run: npm link

Then in the other project, run: npm link nsfd-web-toolbox

Finally, run: npm run dev

You may need to remove the package installed from github, from both the package.json and package-lock.json files before doing this

## Troubleshooting

### Webpack: Failed to parse source map
Add the following to your webpack config, directly inside module: ignoreWarnings: [/Failed to parse source map/]