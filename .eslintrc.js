module.exports = {
    "extends": "airbnb-base",
    "env": {
        "browser": true,
        "mocha": true,
    },
    "plugins": [
        "import"
    ],
    "rules": {
        "indent": ["error", 4]
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "settings": {
        "import/resolver": "webpack"
    }
};
