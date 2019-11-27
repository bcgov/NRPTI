# shared-assets

This contains common static assets (images, fonts, etc) and common styles (scss).


# angular.json

This is a stripped down version of angular.json.

All irrelevant parts have been removed, leaving only the pieces that pertain to shared-assets in some way.

Explanations of the important parts are in the next sections.

```
  "projects": {
    "admin-nrpti": {
      ...
      "architect": {
        "build": {
          ...
          "options": {
            ...
            "stylePreprocessorOptions": {
              "includePaths": [
                "projects/shared-assets/src"
              ]
            },
            "assets": [
              {
                "glob": "**/*",
                "ignore": [
                  "styles"
                ],
                "input": "projects/admin-nrpti/src/assets",
                "output": "assets"
              },
              {
                "glob": "**/*",
                "ignore": [
                  "styles"
                ],
                "input": "projects/shared-assets/src/assets",
                "output": "assets"
              }
            ],
            "styles": [
              ...
              "projects/admin-nrpti/src/styles.scss"
            ],
            "scripts": [
              ...
            ]
          },
          ...
        },
        "serve": {
          ...
        },
        "extract-i18n": {
          ...
        },
        "test": {
          ...
          "options": {
            ...
            "styles": [
              ...
              "projects/admin-nrpti/src/styles.scss"
            ],
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/admin-nrpti/src/assets",
                "output": "/assets/"
              },
              {
                "glob": "**/*",
                "input": "projects/shared-assets/src/assets",
                "output": "/assets/"
              }
            ]
          }
        },
        "test-ci": {
          ...
          "options": {
            ...
            "styles": [
              ...
              "projects/admin-nrpti/src/styles.scss"
            ],
            "assets": [
              {
                "glob": "**/*",
                "input": "projects/admin-nrpti/src/assets",
                "output": "/assets/"
              },
              {
                "glob": "**/*",
                "input": "projects/shared-assets/src/assets",
                "output": "/assets/"
              }
            ]
          }
        },
        "lint": {
          ...
        }
      }
    },
    ...
  }
}
```

## angular.json > stylePreprocessorOptions

This puts the specified path into scope, meaning that all sub-items can be accessed without specifying the previous part of the path.

This allows the code to import shared-assets and local assets seamlessly.

```
"stylePreprocessorOptions": {
  "includePaths": [
    "projects/shared-assets/src"
  ]
},
```

### Example

```
@import "assets/styles/base/base.scss";
```
If `base.scss` is in the local `assets` folder, it will be imported.

If `base.scss` is not in the local folder, but does exist in the `shared-assets` folder, it will be imported from there instead.

## angular.json > assets

This specifies the static assets that should be imported into the built dist folder.

In this case, the assets in the local folder are imported first and will take precedence over the shared-assets assets, which are imported second.

A sub-folder named 'styles' is excluded, as all styles should be imported in the styles section.

```
"assets": [
  {
    "glob": "**/*",
    "ignore": [
      "styles"
    ],
    "input": "projects/admin-nrpti/src/assets",
    "output": "assets"
  },
  {
    "glob": "**/*",
    "ignore": [
      "styles"
    ],
    "input": "projects/shared-assets/src/assets",
    "output": "assets"
  }
],
```

### Example

Local assets: `admin-nrpti/src/assets/images = [A, B]`

Shared assets: `shared-assets/src/assets/images = [A, E]`

Dist assets: `dist/admin-nrpti/assets/images = [A, B, C, E]`
- where A is the version from the local assets, and not the shared-assets.

## angular.json > styles

This should only import the local `styles.scss`.

If the project requires styles from the shared-assets folder, it should import them in the local `styles.scss`.

This gives the local `styles.scss` control over exactly which shared styles to include, if any.

```
"styles": [
  ...
  "projects/admin-nrpti/src/styles.scss"
],
```