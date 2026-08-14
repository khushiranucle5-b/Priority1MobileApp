import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button } from '../../../components/Button';
import { useAuthStore } from '../../../store/useAuthStore';

export const LogoutSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            
            // Simulate a brief network/processing delay to show the loader
            setTimeout(async () => {
              await logout();
              
              // Note: The alert is shown right before unmount, but Alert.alert persists 
              // across React Navigation unmounts at the native level on both iOS and Android.
              Alert.alert("Success", "You have been logged out successfully.");
              
              // The `isLoading` state doesn't strictly need to be reset since the 
              // component unmounts instantly due to conditional rendering in RootNavigator,
              // but it's good practice.
              setIsLoading(false);
            }, 800);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Logout" 
        variant="danger" 
        size="large" 
        fullWidth 
        isLoading={isLoading}
        onPress={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 32, // Extra padding at the bottom of the screen
  },
});

