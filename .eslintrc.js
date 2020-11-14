module.exports = {
	env: {
		es2021: true,
		node: true
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 12
	},
	ignorePatterns: ["*.d.ts"],
	rules: {
		"indent": [
			"error",
			"tab"
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
