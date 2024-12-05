import { basicType, ExpertType } from "@/types/types";
import axios from "axios";
import { toast } from "react-toastify";
const API_URL = process.env.NEXT_PUBLIC_API_URI
export const signupPost = async(data:basicType)=>{
    if(!API_URL)
        toast.error("unable to connect backend")
    try {
         const responce =  await axios.post(`${API_URL}/api/expert/signup`,data)  
         console.log(responce) 
         return responce
    } catch (error:any) {
        if(axios.isAxiosError(error))
        {
            if(error.status===400)
            {
                toast.error(error.response?.data.message)
            }
        }
        return error.message ? error.message : "unable to add user"
    }
}

export const otpPost = async (otp:string, storedOTP : string, storedEmail:string )=>{
    try {
        const responce = await axios.post(`${API_URL}/api/expert/verify-otp`,{otp, storedOTP,storedEmail})
        return responce.data;
    } catch (error:any) {
      if(error.response)
        toast.error(error.response.data.message)
    }
  }

  export const signinPost = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return null;
    }
    try {
      const response = await axios.post(`${API_URL}/api/expert/login`, { email, password });
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message || "Unknown error occurred";
        return null;
      } else {
        toast.error("Unable to connect to the server. Please try again later.");
        return null;
      }
    }
  };

  export const getProfile = async (token : string)=>{
    if(!token)
      toast.error("user is not autherized please login again");
    else{
      try {
        const response =  await axios.get(`${API_URL}/api/expert/get-expert-details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          })
          console.log("response.data",response.data)
          return response.data
      } catch (error) {
        console.log( error);
      }

    }
  }

  export const updateProfile = async (token: string, data: ExpertType) => {
    if (!token) {
      toast.error("User is not authorized. Please login again.");
    } else {
      try {
        const formData = new FormData();
        
        // Append text fields
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('primary_contact', data.primary_contact  ? data.primary_contact : "");
        formData.append('address', data.address ? data.address : "");
        formData.append('secondary_contact', data.secondary_contact ? data.secondary_contact:"" );
        formData.append('skills', JSON.stringify(data.skills));  
        formData.append('experience', JSON.stringify(data.experience));  
        formData.append('qualification', JSON.stringify(data.qualification));  

        if (data.profilePicture  instanceof File) {
          formData.append('profilePicture', data.profilePicture);
        }

        const response = await axios.put(
          `${API_URL}/api/expert/update-profile`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          }
        );
  
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Error while updating user profile", error);
        throw error;
      }
    }
  };
  
  

  export const forgotPssword = async (email :  string)=>{
    if(!email){
      toast.error("email is required");
      return
    }
    try {
      const response =  await axios.post(`${API_URL}/api/expert/forgot-password`,{email})
      return response.data
    } catch (error: any) {
      if(error.status)
        toast.error(error?.response?.data?.message)
      else
      toast.error("not ble t send the otp try again")
    }
  }

  export const resetUserPassword = async (email: string, password :  string)=>{
     if(!email ){
      toast.error("User is unautherized")
      return;
     }
     else if(!password){
      toast.error("password is required");
      return;
     }
     try {
      const response =  await axios.put(`${API_URL}/api/expert/update-password`,{email,password})
      return response.data
     } catch (error: any) {
      if(error.response)
        toast.error(error?.responce?.data?.message)
      else
      toast.error("unable to update the password")
     }
  }