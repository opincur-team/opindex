import React from "react";
import {Image, StyleSheet, View} from "react-native";
const logoImage = require('../../../assets/images/opindex-logo.png');

export const LogoImage: React.FC = () => {
  return (
    <Image
      style={styles.logoStyle}
      source={logoImage}
    />
  );
};

const styles = StyleSheet.create({
  logoStyle: {
    width: '100%',
    height: undefined,
    aspectRatio: 2.07,         // width:height ratio (adjust to your logo)
    alignSelf: 'center',
    resizeMode: 'contain',
  }

});
