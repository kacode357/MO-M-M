import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
// This file handles image upload to Cloudinary using Expo's ImagePicker and axios for HTTP requests.
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgtbovcjg/image/upload';
const UPLOAD_PRESET = 'mma-upload';

interface UploadResult {
  imageUri: string | null;
  imageUrl: string | null;
}

const uploadImage = async (
  setImageUri: (uri: string | null) => void,
  setImageUrl: (url: string | null) => void,
  setIsUploading: (uploading: boolean) => void
): Promise<UploadResult> => {
  setIsUploading(true);
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
      return { imageUri: null, imageUrl: null };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) {
      return { imageUri: null, imageUrl: null };
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const imageUrl = response.data.secure_url;
    if (imageUrl) {
      setImageUrl(imageUrl);
    
      return { imageUri: uri, imageUrl };
    }

    throw new Error('Không nhận được URL ảnh');
  } catch (error: any) {
    Alert.alert('Lỗi', 'Tải ảnh thất bại: ' + (error.message || 'Không xác định'));
    console.error('Upload error:', error);
    return { imageUri: null, imageUrl: null };
  } finally {
    setIsUploading(false);
  }
};

export { uploadImage };

