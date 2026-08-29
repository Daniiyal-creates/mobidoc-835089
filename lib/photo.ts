/**
 * Damage photo capture for the diagnose flow.
 *
 * A photo is resized and re-compressed before it leaves this module: the
 * diagnose automation sends it inline to Gemini, and a 4 MB camera original
 * would be slow to upload while telling the model nothing a 1024 px JPEG
 * doesn't already show.
 */

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { DamagePhoto } from '@/lib/types';

/** Long edge in pixels — enough to read a cracked panel or a bulging back. */
const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.6;

export type PhotoSource = 'camera' | 'library';

/**
 * `denied` = the OS permission was refused, `cancelled` = the user backed out
 * of the picker. Both are normal outcomes, not errors.
 */
export type PhotoOutcome =
  | { status: 'ok'; photo: DamagePhoto }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'failed' };

async function shrink(asset: ImagePicker.ImagePickerAsset): Promise<DamagePhoto> {
  const width = asset.width || 0;
  const height = asset.height || 0;
  const context = ImageManipulator.manipulate(asset.uri);

  // Only ever downscale: enlarging a small photo adds bytes without detail.
  if (Math.max(width, height) > MAX_EDGE) {
    context.resize(width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    base64: true,
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  if (!saved.base64) {
    throw new Error('image manipulator returned no base64 data');
  }

  return {
    uri: saved.uri,
    base64: saved.base64,
    mimeType: 'image/jpeg',
    width: saved.width,
    height: saved.height,
  };
}

/** Opens the camera or the gallery, then hands back a send-ready photo. */
export async function capturePhoto(source: PhotoSource): Promise<PhotoOutcome> {
  try {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return { status: 'denied' };
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.9,
      exif: false,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) {
      return { status: 'cancelled' };
    }

    const asset = result.assets[0];
    if (!asset) {
      return { status: 'failed' };
    }

    return { status: 'ok', photo: await shrink(asset) };
  } catch (error) {
    console.error('damage photo capture failed', error);
    return { status: 'failed' };
  }
}
