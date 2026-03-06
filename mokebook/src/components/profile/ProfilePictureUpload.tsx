"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { useStorage, useUser } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploadProps {
  currentPhotoURL?: string | null;
  displayName?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onUploadSuccess?: (url: string) => void;
}

export function ProfilePictureUpload({
  currentPhotoURL,
  displayName,
  email,
  size = "lg",
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const { user } = useUser();
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
    xl: "h-28 w-28",
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !storage) return;

    setUploading(true);
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${selectedFile.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, selectedFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update the user's profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

      onUploadSuccess?.(downloadURL);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentPhotoURL;
  const fallbackInitial = displayName?.charAt(0) || email?.charAt(0) || "U";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} ring-4 ring-white shadow-md transition-all`}>
          {displayUrl && <AvatarImage src={displayUrl} />}
          <AvatarFallback className="bg-primary text-white text-xl font-bold">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay button for changing photo */}
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          <Camera className="h-6 w-6 text-white" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-primary"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={triggerFileInput}
          className="text-xs"
        >
          <Camera className="h-3.5 w-3.5 mr-1" />
          Change Photo
        </Button>
      )}
    </div>
  );
}
