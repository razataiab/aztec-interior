import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Aztec Interiors",
  version: packageJson.version,
  copyright: `© ${currentYear}, Aztec Interiors.`,
  meta: {
    title: "Aztec Interiors",
    description:
      "Aztec Interiors",
  },
};
