const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Expo config plugin to add release signing configuration to Android build.gradle
 * This ensures the signing config survives `expo prebuild --clean`
 */
const withAndroidReleaseSigning = (config) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Add release signing config if not already present
    if (!buildGradle.includes("signingConfigs.release")) {
      // Add release signingConfig block
      const signingConfigsMatch = buildGradle.match(
        /signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}/
      );

      if (signingConfigsMatch) {
        const updatedSigningConfigs = signingConfigsMatch[0].replace(
          /debug\s*\{[\s\S]*?\}/,
          `debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(OPINDEX_RELEASE_STORE_FILE)
            storePassword OPINDEX_RELEASE_STORE_PASSWORD
            keyAlias OPINDEX_RELEASE_KEY_ALIAS
            keyPassword OPINDEX_RELEASE_KEY_PASSWORD
        }`
        );

        config.modResults.contents = buildGradle.replace(
          signingConfigsMatch[0],
          updatedSigningConfigs
        );
      }

      // Update release buildType to use signingConfigs.release
      config.modResults.contents = config.modResults.contents.replace(
        /release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug/,
        (match) => match.replace("signingConfigs.debug", "signingConfigs.release")
      );
    }

    return config;
  });
};

module.exports = withAndroidReleaseSigning;
