import next from "eslint-config-next";

export default [
  ...next,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Relax rules that are noisy in this project
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];
