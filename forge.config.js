const path = require("path");
const fs = require("fs");
const packageJson = require("./package.json");

const { version } = packageJson;
const iconDir = path.resolve(__dirname, "assets", "icons");

if (process.env["WINDOWS_CODESIGN_FILE"]) {
  const certPath = path.join(__dirname, "win-certificate.pfx");
  const certExists = fs.existsSync(certPath);

  if (certExists) {
    process.env["WINDOWS_CODESIGN_FILE"] = certPath;
  }
}

// Code signing help: https://github.com/electron/electron/issues/7476

const config = {
  //   hooks: {
  //     generateAssets: require("./tools/generateAssets"),
  //   },
  packagerConfig: {
    // name: 'Blerp',
    // executableName: 'electron-fiddle',
    // asar: true,
    // icon: path.resolve(__dirname, 'assets', 'icons', 'fiddle'),
    // appBundleId: 'com.electron.fiddle',
    // usageDescription: {
    //   Camera:
    //     'Access is needed by certain built-in fiddles in addition to any custom fiddles that use the Camera',
    //   Microphone:
    //     'Access is needed by certain built-in fiddles in addition to any custom fiddles that use the Microphone',
    // },
    // appCategoryType: 'public.app-category.developer-tools',
    // protocols: [
    //   {
    //     name: 'Electron Fiddle Launch Protocol',
    //     schemes: ['electron-fiddle'],
    //   },
    // ],
    // win32metadata: {
    //   CompanyName: 'Electron Community',
    //   OriginalFilename: 'Electron Fiddle',
    // },
    osxSign: {
      identity: "Developer ID Application: Blerp Inc (L34HQJYV8U)",
      hardenedRuntime: true,
      "gatekeeper-assess": false,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library",
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      //   config: (arch) => {
      //     const certificateFile = process.env.CI
      //       ? path.join(__dirname, 'cert.p12')
      //       : process.env.WINDOWS_CERTIFICATE_FILE;

      //     if (!certificateFile || !fs.existsSync(certificateFile)) {
      //       console.warn(
      //         `Warning: Could not find certificate file at ${certificateFile}`,
      //       );
      //     }

      //     return {
      //       name: 'electron-fiddle',
      //       authors: 'Electron Community',
      //       exe: 'electron-fiddle.exe',
      //       iconUrl:
      //         'https://raw.githubusercontent.com/electron/fiddle/0119f0ce697f5ff7dec4fe51f17620c78cfd488b/assets/icons/fiddle.ico',
      //       loadingGif: './assets/loading.gif',
      //       noMsi: true,
      //       setupExe: `electron-fiddle-${version}-win32-${arch}-setup.exe`,
      //       setupIcon: path.resolve(iconDir, 'fiddle.ico'),
      //       certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
      //       certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD'],
      //     };
      //   },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./assets/blerp.jpg",
        format: "ULFO",
      },
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
            },
          ],
        },
      },
    ],
  ],
  publishers: [{
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'blerp',
        name: 'blerp-desktop'
      },
      prerelease: true
    }
  }]
};

function notarizeMaybe() {
  if (process.platform !== "darwin") {
    return;
  }

  if (!process.env.CI) {
    console.log(`Not in CI, skipping notarization`);
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn(
      "Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!"
    );
    return;
  }

  config.packagerConfig.osxNotarize = {
    appBundleId: "com.blerp.desktop",
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: "L34HQJYV8U",
    appPath: `./out/BlerpDesktop-darwin-x64/BlerpDesktop.app`,
  };
}

// "packagerConfig": {
//     "icon": "./assets/blerp.jpg",
//     "osxSign": {
//       "identity": "Developer ID Application: Felix Rieseberg (LT94ZKYDCJ)",
//       "hardened-runtime": true,
//       "entitlements": "entitlements.plist",
//       "entitlements-inherit": "entitlements.plist",
//       "signature-flags": "library"
//     },
//     "osxNotarize": {
//       "appleId": "jordan@blerp.com",
//       "appleIdPassword": "my-apple-id-password"
//     }
//   },
//   "makers": [
//     {
//       "name": "@electron-forge/maker-squirrel",
//       "config": {
//         "name": "my_new_app"
//       }
//     },
//     {
//       "name": "@electron-forge/maker-dmg",
//       "config": {
//         "background": "./assets/blerp.jpg",
//         "format": "ULFO"
//       }
//     },
//     {
//       "name": "@electron-forge/maker-zip",
//       "platforms": [
//         "linux"
//       ],
//       "config": {}
//     }
//   ],
//   "plugins": [
//     [
//       "@electron-forge/plugin-webpack",
//       {
//         "mainConfig": "./webpack.main.config.js",
//         "renderer": {
//           "config": "./webpack.renderer.config.js",
//           "entryPoints": [
//             {
//               "html": "./src/index.html",
//               "js": "./src/renderer.js",
//               "name": "main_window"
//             }
//           ]
//         }
//       }
//     ]
//   ]
// }

notarizeMaybe();

// Finally, export it
module.exports = config;
