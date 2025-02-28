import React from "react";

interface AboutCardProps {
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export function AboutCard({ bio, createdAt, updatedAt }: AboutCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
      <h2 className="text-xl font-bold text-white mb-4">About</h2>
      <p className="text-gray-300">{bio || "No bio provided yet"}</p>
      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400">Member since</h3>
          <p className="text-white">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Last active</h3>
          <p className="text-white">
            {new Date(updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
