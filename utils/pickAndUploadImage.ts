// src/utils/pickAndUploadImage.ts
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgtbovcjg/image/upload';
const UPLOAD_PRESET = 'mma-upload';

interface UploadResult {
  imageUrl: string | null;
}

const pickAndUploadImage = async (
  setIsUploading: (uploading: boolean) => void
): Promise<UploadResult> => {
  setIsUploading(true);
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
      return { imageUrl: null };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) {
      return { imageUrl: null };
    }

    const uri = result.assets[0].uri;

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
      return { imageUrl };
    }
   
    throw new Error('Không nhận được URL ảnh');
  } catch (error: any) {
    Alert.alert('Lỗi', 'Tải ảnh thất bại: ' + (error.message || 'Không xác định'));
    console.error('Upload error:', error);
    return { imageUrl: null };
  } finally {
    setIsUploading(false);
  }
};

export { pickAndUploadImage };

