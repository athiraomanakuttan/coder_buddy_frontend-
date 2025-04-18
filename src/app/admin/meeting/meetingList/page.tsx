'use client'
import {useState, useEffect} from 'react'
import Navbar from "@/components/admin/navbar/Navbar"
import TableComponent from "@/components/admin/TableComponent/TableComponent"
import { NewMeetingType } from '@/types/types' 
import { getMeetingDetails } from '@/app/services/admin/meetingApi' 

const ClientListPage = () => {
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalMeetings: 0,
        limit: 10
    })
    const [ meetingStatus , setStatus] = useState<number>(0)
    const [meetingData, setMeetingData]= useState<NewMeetingType[]>([])
    const [meetingType,setMeetingType] = useState("meetingList")
    const getMeetingData = async (newPage : number =1, meetingStatus : number =0)=>{
        const response =  await getMeetingDetails( newPage, meetingStatus)
        if(response){
            setMeetingData(response.data)
            setPagination({...pagination,totalMeetings : response.count, totalPages: response.totalPages})
        }
    }
    useEffect(()=>{
        if(meetingStatus)
            setMeetingType("meetingActiveList")
        else 
        setMeetingType("meetingList")
    },[meetingStatus])
    useEffect(()=>{
        getMeetingData(1,meetingStatus)
    },[meetingStatus])

    const handlePageChange = (newPage: number) => {
        const status = meetingStatus
        getMeetingData(newPage, status)
    }
    
    

    return (
        <div className="m-0 p-0 flex">
            <div className="p-0 m-0">
                <Navbar />
            </div>
            <div className="w-100 border p-8">
            <div className="flex gap-3 mb-3 justify-end">
            <button className={`${meetingStatus === 0 && 'bg-adminprimary text-white' } border rounded  pl-3 pr-3 pt-2 pb-2`} onClick={()=>setStatus(0)}>Scheduled</button>   
            <button className={` ${meetingStatus === 1 && 'bg-adminprimary text-white' } border rounded pl-3 pr-3 pt-2 pb-2`} onClick={()=>setStatus(1)}>History</button>
            </div>   
                 <TableComponent
                    headings={['title', 'dateTime', 'userId', 'createdAt']}
                    valueList={meetingData}
                    role={meetingType}
                /> 
                {/* Pagination Controls */}
                <div className="flex justify-end items-end mt-4 space-x-4">
                    <button 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 bg-adminprimary text-white rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 bg-adminprimary text-white rounded disabled:opacity-50"
                    > Next </button>
                </div>
            </div>
        </div>
    )
}

export default ClientListPage