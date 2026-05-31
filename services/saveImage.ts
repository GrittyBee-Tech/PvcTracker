'use server';

import connectDB from '@/lib/db';
import Volunteer from '@/models/volunteerApplication';

export async function saveImageToDatabase(
  userId: string,
  imageUrl: string
) {
  if (!imageUrl) {
    return {
      success: false,
      error: 'No image URL provided',
    };
  }

  try {

    await connectDB();
    await Volunteer.findOneAndUpdate(
      { userId },
      { PhotoUrl: imageUrl }
    );

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to save image reference',
    };
  }
}