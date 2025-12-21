import {
  getCurrentUser,
  getIndustryList,
  updateUserProfile,
} from "@/actions/user";
import ProfileForm from "./_components/profile-form";

export const metadata = {
  title: "Edit Profile | ResumeAI",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const industries = await getIndustryList();

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      <ProfileForm
        user={user}
        industries={industries}
        action={updateUserProfile}
      />
    </div>
  );
}
