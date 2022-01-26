module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "plugins": ["@typescript-eslint"],
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
      "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
