"use client";

import { useEffect, useState } from "react";
import { ChallengePreferences } from "@/lib/server/types";

type ChallengePreferencesCardProps = {
  preferences: ChallengePreferences;
  onUpdate?: (preferences: Partial<ChallengePreferences>) => Promise<void>;
};

export default function ChallengePreferencesCard({
  preferences,
  onUpdate,
}: ChallengePreferencesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(preferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate?.(formData);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(preferences);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Challenge Display Settings
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Edit Settings
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desktop Dimensions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-200 pb-2">
            Desktop Dimensions
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Width (px)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      width: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="1000"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300">
                  {preferences.width} px
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Height (px)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="800"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300">
                  {preferences.height} px
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dimensions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-200 pb-2">
            Mobile Dimensions
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Small Width (px)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.smallWidth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smallWidth: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="200"
                  max="500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300">
                  {preferences.smallWidth} px
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Small Height (px)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.smallHeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smallHeight: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="400"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300">
                  {preferences.smallHeight} px
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo URL - spans full width */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-medium text-gray-200 pb-2">Branding</h4>
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
              Short logo URL
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.logoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value || null })
                }
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300">
                {preferences.logoUrl || "No logo set"}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: URL to your logo image that will be displayed in the
              challenge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
