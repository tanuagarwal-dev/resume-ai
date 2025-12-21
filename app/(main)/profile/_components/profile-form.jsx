"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProfileForm({ user, industries, action }) {
  const [isPending, startTransition] = useTransition();
  const [selectedIndustry, setSelectedIndustry] = useState(user.industry || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      experience: user.experience || 0,
      skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
      industry: user.industry || "",
    },
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        const payload = {
          name: data.name,
          bio: data.bio,
          experience: Number(data.experience) || 0,
          skills: data.skills,
          industry: selectedIndustry || data.industry,
        };
        await action(payload);
        toast.success("Profile updated");
      } catch (e) {
        toast.error(e?.message || "Failed to update profile");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input {...register("name")} placeholder="Your name" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Textarea {...register("bio")} placeholder="Short bio" rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Experience (years)
          </label>
          <Input type="number" min={0} {...register("experience")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Skills (comma-separated)
        </label>
        <Input
          {...register("skills")}
          placeholder="e.g., JavaScript, React, SQL"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
