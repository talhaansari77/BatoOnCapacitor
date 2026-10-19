import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Upload, X, Camera, Info } from "lucide-react";
import { toast } from "sonner";

export default function PhotosStep({ userEmail, onNext, onBack, onSkip }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setPhotos([...photos, ...uploadedUrls]);
    setUploading(false);
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onNext(photos);
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="w-6 h-6 text-orange-600" />
          Upload Initial Photos (Optional)
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Adding before photos helps track your progress throughout the treatment.
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Photo Tips for Best Results:</p>
                <ul className="text-blue-700 space-y-1 ml-4 list-disc">
                  <li>Take photos in good lighting</li>
                  <li>Capture front, sides, and top views</li>
                  <li>Keep hair dry and styled normally</li>
                  <li>Use a plain background if possible</li>
                  <li>You can also add photos later from your profile</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors">
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG up to 10MB each
              </p>
            </label>
          </div>

          {photos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Photos ({photos.length})
              </p>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 py-6 text-lg"
              disabled={uploading}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="flex-1 py-6 text-lg"
              disabled={uploading}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-6 text-lg"
              disabled={uploading}
            >
              {photos.length > 0 ? `Continue with ${photos.length} photo(s)` : "Continue"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}