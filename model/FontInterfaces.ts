// src/model/FontInterfaces.ts
export interface FontStyles {
  Regular: string;
  Medium: string;
  SemiBold: string;
  Bold: string;
  ExtraBold?: string; // Chỉ có trong Baloo2
  Light?: string; // Chỉ có trong Comfortaa
}

export interface FontFamily {
  Baloo2: FontStyles;
  Comfortaa: FontStyles;
}