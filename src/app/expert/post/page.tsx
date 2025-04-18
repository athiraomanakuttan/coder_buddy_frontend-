'use client'
import Navbar from "@/components/expert/Navbar/Navbar"
import Post from '@/components/expert/PostComponent/PostComponent'
import { PostType } from "@/types/types";
import { useEffect, useState } from "react";
import { getUserPost } from "@/app/services/expert/expertApi";

const PostPage = () => {
  const [postData, setPostData] = useState<PostType[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getPostData = async (page: number = 1) => {
    try {
      const response = await getUserPost( page,5 );
      console.log(response)
      if (response && response.data) {
        setPostData(response.data);
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  }
  
  useEffect(() => {
    getPostData()
  }, [])

  const handlePageChange = (newPage: number) => {
    getPostData(newPage);
  }

  return (
    <div>
      <div className="m-0 p-0 flex">
        <div className="p-0 m-0">
          <Navbar />
        </div>
        <div className="border w-100 h-[100vh] overflow-auto">
          <div className="container p-5">
            <h1 className="text-3xl">Post</h1>
            
            <div>
              {postData.length > 0 ? (
                <>
                  {postData.map((post: PostType, index: number) => (
                    <Post key={index} postdata={post} role="user" getPostData={getPostData} />
                  ))}
                  
                  <div className="flex justify-center items-center mt-4 space-x-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <h1 className="text-2xl">No Post Yet</h1>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default PostPage