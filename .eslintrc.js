module.exports = {
	env: {
		es2021: true,
		node: true
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 12
	},
	overrides: [
		{
			files: ["*.ts"],
			parser: "@typescript-eslint/parser",
			extends: [
				// "@typescript-eslint/recommended",
				// "@typescript-eslint/recommended-requiring-type-checking"
			]
		}
	],
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
		],
		"require-await": "error"
	}
};
