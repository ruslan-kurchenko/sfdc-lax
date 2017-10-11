module.exports = {
    "extends": "airbnb-base",
    "globals": {
        "$A": true,
    },
    "rules": {
        // override default options for rules from base configurations
        "indent": ["error", 2],
        "no-unused-expressions": "off",

        // disable rules from base configurations
        "no-console": "off",
        "object-shorthand": "off",
        "prefer-template": "off"
    }
};