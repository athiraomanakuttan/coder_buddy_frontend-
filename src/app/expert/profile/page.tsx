"use client";
import Navbar from "@/components/expert/Navbar/Navbar";
import { useState, ChangeEvent, useEffect } from "react";
import { ExpertType } from "@/types/types";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "@/app/services/expertApi";
import {parseSkills} from '@/app/utils/skillUtils'

const ProfilePage = () => {
  const [part, setPart] = useState<boolean>(true);
  const [formData, setFormData] = useState<ExpertType>({
    _id: "",
    first_name: "",
    last_name: "",
    primary_contact: undefined,
    secondary_contact: undefined,
    qualification: [{ qualification: "", college: "", year_of_passout: "" }],
    experience: [{ job_role: "", employer: "", start_date: "", end_date: "" }],
    profilePicture: "/images/expert_profile_pic.jpg"
  });

  const [qualifications, setQualifications] = useState<
    { qualification: string; university: string; year: string }[]
  >([{ qualification: "", university: "", year: "" }]);

  const [jobs, setJobs] = useState<
    { occupation: string; employer: string; startDate: string; endDate: string }[]
  >([{ occupation: "", employer: "", startDate: "", endDate: "" }]);

  const [skills, setSkills] = useState<string>("");

  const getProfileData = async () => {
    try {
      const token = localStorage.getItem("userAccessToken")!;
      const userData = await getProfile(token);

      if (userData.status) {
        const transformedData: ExpertType = {
          _id: userData.data._id,
          first_name: userData.data.first_name || "",
          last_name: userData.data.last_name || "",
          primary_contact: userData.data.primary_contact,
          secondary_contact: userData.data.secondary_contact,
          qualification: userData.data.qualification?.length
            ? userData.data.qualification.map((qual: any) => ({
                qualification: qual.qualification || "",
                college: qual.college || "",
                year_of_passout: qual.year_of_passout || ""
              }))
            : [{ qualification: "", college: "", year_of_passout: "" }],
          experience: userData.data.experience?.length
            ? userData.data.experience.map((exp: any) => ({
                job_role: exp.job_role || "",
                employer: exp.employer || "",
                start_date: exp.start_date
                  ? new Date(exp.start_date).toISOString().split("T")[0]
                  : "",
                end_date: exp.end_date
                  ? new Date(exp.end_date).toISOString().split("T")[0]
                  : ""
              }))
            : [{ job_role: "", employer: "", start_date: "", end_date: "" }],
          skills: userData.data.skills || [],
          profilePicture: userData.data.profilePicture || "/images/expert_profile_pic.jpg"
        };

        setFormData(transformedData);
        setQualifications(
          transformedData.qualification.map(qual => ({
            qualification: qual.qualification,
            university: qual.college,
            year: qual.year_of_passout
          }))
        );

        setJobs(
          transformedData.experience.map(exp => ({
            occupation: exp.job_role,
            employer: exp.employer,
            startDate: exp.start_date,
            endDate: exp.end_date
          }))
        );

        setSkills(transformedData.skills?.join(", ") || "");
      }
    } catch (error) {
      toast.error("Failed to fetch profile data");
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData({
            ...formData,
            profilePicture: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addQualification = () => {
    setQualifications([...qualifications, { qualification: "", university: "", year: "" }]);
  };

  const updateQualification = (
    index: number,
    field: "qualification" | "university" | "year",
    value: string
  ) => {
    const updatedQualifications = [...qualifications];
    updatedQualifications[index][field] = value;
    setQualifications(updatedQualifications);
  };

  const addJob = () => {
    setJobs([...jobs, { occupation: "", employer: "", startDate: "", endDate: "" }]);
  };

  const updateJob = (
    index: number,
    field: "occupation" | "employer" | "startDate" | "endDate",
    value: string
  ) => {
    const updatedJobs = [...jobs];
    updatedJobs[index][field] = value;
    setJobs(updatedJobs);
  };

  const handleFormSubmit = async () => {
    try {
      const token = localStorage.getItem("userAccessToken")!;
      const parsedSkills = parseSkills(skills);
      const transformedQualifications = qualifications.map(qual => ({
        qualification: qual.qualification,
        college: qual.university,
        year_of_passout: qual.year
      }));

      const transformedExperience = jobs.map(job => ({
        job_role: job.occupation,
        employer: job.employer,
        start_date: job.startDate,
        end_date: job.endDate
      }));

      const updatedFormData: ExpertType = {
        ...formData,
        qualification: transformedQualifications,
        experience: transformedExperience,
        skills: parsedSkills
      };

      const updateExpert = await updateProfile(token, updatedFormData);
      if (updateExpert.status) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(updateExpert.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
    }
  };
  return (
    <>
      <div className="m-0 p-0 flex">
        <div className="p-0 m-0">
          <Navbar />
        </div>
        <div className="w-100 border p-8">
          <h5>Your Profile</h5>
          {part ? (
            <div className="part1">
              <div className="flex gap-8 items-end justify-evenly mb-7">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-50"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-50"
                />
                <div className="relative">
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="rounded-full w-32 cursor-pointer"
                    onClick={() =>
                      document.getElementById("profilePictureInput")?.click()
                    }
                  />
                  <input
                    type="file"
                    id="profilePictureInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleProfilePictureChange}
                  />
                </div>
              </div>
              <button
                className="border rounded-full pt-2 pb-2 pr-4 pl-4 float-end"
                onClick={addQualification}
              >
                +
              </button>
              {qualifications.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-8 items-end justify-evenly mb-7"
                >
                  <input
                    type="text"
                    placeholder="Qualification"
                    value={item.qualification}
                    onChange={(e) =>
                      updateQualification(
                        index,
                        "qualification",
                        e.target.value
                      )
                    }
                    className="border rounded p-2 w-50"
                  />
                  <input
                    type="text"
                    placeholder="College/ University"
                    value={item.university}
                    onChange={(e) =>
                      updateQualification(index, "university", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                  <input
                    type="text"
                    placeholder="Passout year"
                    value={item.year}
                    onChange={(e) =>
                      updateQualification(index, "year", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                </div>
              ))}

              <div className="flex gap-8 items-end justify-evenly mb-7">
                <textarea
                  name="address"
                  id="address"
                  className="w-100 border rounded p-3"
                  placeholder="Address"
                ></textarea>
              </div>
              <div className="flex gap-8 items-end justify-evenly mb-7">
                <input
                  type="text"
                  name="primary_contact"
                  placeholder="Primary contact"
                  value={formData.primary_contact || ''}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-50"
                />
                <input
                  type="text"
                  name="secondary_contact"
                  placeholder="Secondary contact"
                  value={formData.secondary_contact || ''}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-50"
                />
              </div>
              <button
                className="bg-secondarys p-2 rounded float-right text-white"
                onClick={() => setPart(false)}
              >
                Next Page
              </button>
            </div>
          ) : (
            <div className="part2 mt-16">
              <button
                className="border rounded-full pt-2 pb-2 pr-4 pl-4 float-end"
                onClick={addJob}
              >
                +
              </button>
              {jobs.map((job, index) => (
                <div
                  key={index}
                  className="flex gap-8 items-end justify-evenly mb-7"
                >
                  <input
                    type="text"
                    placeholder="Occupation"
                    value={job.occupation}
                    onChange={(e) =>
                      updateJob(index, "occupation", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                  <input
                    type="text"
                    placeholder="Employer"
                    value={job.employer}
                    onChange={(e) =>
                      updateJob(index, "employer", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={job.startDate}
                    onChange={(e) =>
                      updateJob(index, "startDate", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={job.endDate}
                    onChange={(e) =>
                      updateJob(index, "endDate", e.target.value)
                    }
                    className="border rounded p-2 w-50"
                  />
                </div>
              ))}
              <div className="mb-7">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  className="w-100 border rounded p-3"
                  placeholder="Enter skills separated by commas"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <button 
                className="bg-secondarys pl-5 pr-5 pb-2 pt-2 rounded float-right text-white"
                onClick={handleFormSubmit}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;