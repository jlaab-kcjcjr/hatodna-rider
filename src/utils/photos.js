import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Opens the camera or the gallery and returns the photo's uri, or null if cancelled.
export async function pickPhoto(useCamera) {
  const permission = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Permission needed',
      useCamera
        ? 'Allow camera access in your phone Settings to take this photo.'
        : 'Allow photo access in your phone Settings to choose this photo.'
    );
    return null;
  }

  const options = { mediaTypes: ['images'], quality: 0.6, allowsEditing: true };
  const result = useCamera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return null;
  return result.assets[0].uri;
}

// Lets the rider choose between taking a photo and picking one from the gallery.
export function choosePhoto(title) {
  return new Promise((resolve) => {
    Alert.alert(title, 'Make sure the photo is clear and readable.', [
      { text: 'Take photo', onPress: async () => resolve(await pickPhoto(true)) },
      { text: 'Choose from gallery', onPress: async () => resolve(await pickPhoto(false)) },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}