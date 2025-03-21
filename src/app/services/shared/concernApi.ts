
import {  ChatResType, Participant,  } from "@/types/types";
import axios from "axios";
import { toast } from "react-toastify";
const API_URI = process.env.NEXT_PUBLIC_API_URI;



export const getUserData = async (token: string) => {
    try {
      const response = await axios.get(`${API_URI}/api/chat/get-chat-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
  
      if (!response.data || !response.data.data) {
        console.warn("Invalid API response structure:", response.data);
        return [];
      }
  
      const participants = response.data.data
        .flatMap((chat: ChatResType) =>chat.participents?.map((participant: Participant) => ({
            id: participant?.id || "",
            name: participant?.name || "Unknown",
          })) || []
        )
        .filter(
          (participant: Participant, index: number, self: Participant[]) =>
            index === self.findIndex((p) => p.id === participant.id)
        );
  
      return participants;
    } catch (error) {
      console.error("Error fetching chat list:", error);
      return [];
    }
  };


export const getMeetingData = async (token: string, userId: string)=>{
    try {
        const response = await axios.get(`${API_URI}/api/meeting/get-user-meetings`,{
            params:{ participentId : userId},
            headers:{ Authorization : `Bearer ${token}`}
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}


export const createConcern = async (token: string, data: FormData) => {
    try {
        const response = await axios.post(`${API_URI}/api/concern/create-concern`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", 
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error while creating concern:", error);
        toast.error("Something went wrong");
    }
};

export const getUserConcernData = async (token: string, status:number)=>{
    try {
        const response = await axios.get(`${API_URI}/api/concern/get-user-concern`,{
            params:{ status },
            headers:{Authorization:`Bearer ${token}`}
        })
        return response.data
    } catch (error) {
        console.log("unable to fetch data",error)
    }
}

export const addConernComment = async (token: string, comment: string, meetingId: string, userType: string)=>{
try {
  const response = await axios.post(`${API_URI}/api/concern/add-concern-replay`,{comment,userType,meetingId},{headers:{Authorization:`Bearer ${token}`}})
  return response.data
} catch (error) {
  console.log(error)
  toast.error("error while adding replay")
}
}