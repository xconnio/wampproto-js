export default {
    transform: {
        "^.+\\.[tj]s$": "babel-jest",
    },
    transformIgnorePatterns: ["node_modules/(?!(?:@noble/ed25519|@noble/hashes)/)",],
    extensionsToTreatAsEsm: [".ts"],
    testEnvironment: "node",
};
