'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Upload, X } from "lucide-react"
import toast from 'react-hot-toast'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AvatarUploadProps {
  userId: string
  username: string
  currentAvatarUrl: string | null
  onAvatarUpdate: (url: string) => void
}

export function AvatarUpload({ userId, username, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClientComponentClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}-${Math.random()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      onAvatarUpdate(publicUrl)
      toast.success('Avatar updated successfully')

      // Delete old avatar if it exists
      if (currentAvatarUrl) {
        const oldFilePath = currentAvatarUrl.split('/').pop()
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([oldFilePath])
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to update avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true)

      if (currentAvatarUrl) {
        const filePath = currentAvatarUrl.split('/').pop()
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([filePath])
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) throw updateError

      onAvatarUpdate('')
      toast.success('Avatar removed successfully')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={currentAvatarUrl || undefined} alt={username} />
          <AvatarFallback className="text-2xl">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Icons.spinner className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            accept="image/*"
            disabled={isUploading}
          />
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}