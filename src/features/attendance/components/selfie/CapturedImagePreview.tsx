import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTheme } from '../../../../providers/ThemeProvider';

interface CapturedImagePreviewProps {
  imageUri?: string;
}

export const CapturedImagePreview: React.FC<CapturedImagePreviewProps> = ({ imageUri }) => {
  const { borderRadius } = useTheme();

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: imageUri || 'https://i.pravatar.cc/300?img=11' }} 
        style={[styles.image, { borderRadius: borderRadius.full }]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginVertical: 32,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
