"use client";

import { useState, useEffect } from "react";
import {
  getCurrentUser,
  getIndustryList,
  updateUserProfile,
} from "@/actions/user";
import ProfileForm from "./_components/profile-form";
import ResumeSelector from "@/app/(main)/resume/_components/resume-selector";
import ResumeUploader from "@/app/(main)/resume/_components/resume-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, industriesData] = await Promise.all([
          getCurrentUser(),
          getIndustryList(),
        ]);
        setUser(userData);
        setIndustries(industriesData);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="container px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="container px-4 py-8">User not found</div>;
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">Edit Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resume Sidebar */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="resumes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent
              value="resumes"
              className="border rounded-lg p-4 bg-card sticky top-4"
            >
              <ResumeSelector key={refreshKey} />
            </TabsContent>
            <TabsContent
              value="upload"
              className="border rounded-lg p-4 bg-card sticky top-4"
            >
              <ResumeUploader
                onUploadSuccess={() => {
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Profile Form - Main Content */}
        <div className="lg:col-span-3">
          <ProfileForm
            user={user}
            industries={industries}
            action={updateUserProfile}
          />
        </div>
      </div>
    </div>
  );
}
