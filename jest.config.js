module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-async-storage|react-native-gesture-handler|@react-navigation|@react-navigation/.*|react-native-image-picker|@react-native-documents)/)',
  ],
};

