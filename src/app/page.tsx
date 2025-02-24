'use client'
import { signinPost } from "@/app/services/user/userApi";
import { signupValidation } from "@/app/utils/validation";
import { basicType } from "@/types/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  useState,useEffect } from "react";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import Image from "next/image";

const userLogin = () => {
  const {setUserAuth, isAuthenticated} = useAuthStore()
  const route = useRouter()
  useEffect(() => {
    // if (isAuthenticated) {
    //   route.push("/dashboard");
    // }
  }, [isAuthenticated, route]);

  const [formData,setFormData]= useState<basicType>({
    email:"",
    password:""
  })
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const validate = signupValidation(formData);
    if (validate.status) {
      
        const response = await signinPost(formData.email, formData.password);
        if (response?.success) {
          const message = response.message || "Successfully logged in";
          toast.success(message);
          setUserAuth(response.data.user,response.data.accessToken) 
          route.push('/dashboard');
        } 
    } else {
      toast.error(validate.message);
    }
  };
  

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-7 p-5  col-sm-12">
            <div className="inner-div border rounded pr-3 pl-3 pt-14 pb-10">
              <form onSubmit={handleFormSubmit}>
                <h1 className="text-center text-3xl mb-2">Sign In</h1>
                <input
                  type="email"
                  placeholder="Enter your email id"
                  className="border rounded w-100 p-2 mb-3"
                  value={formData.email}
                  onChange={(e)=>setFormData({...formData,email : e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="border rounded w-100 p-2 mb-3"
                  value={formData.password}
                  onChange={(e)=>setFormData({...formData,password : e.target.value})}
                />
                <input type="submit" value="Login"  className="w-100 bg-primarys p-2 mb-3 text-white"  />
                <button className="border-black border rounded w-100 p-2 mb-3" >
                    <Image src="/icons/g-icon.png" alt=""  className="d-inline m-1" width={100} height={100}/>
                     Sign in with google </button>
              </form>
              <div className="flex justify-between">
            <Link href='/forgot' className="custom-link" >forgot password</Link>
            <p className="custom-link">Don't have an account yet ? <Link href='/signup'  className="custom-link">Register Now</Link></p>
          </div>
            </div>
          </div>
          <div className="col-5 d-none d-md-inline pt-5">
            <Image src="/images/user-login.png" alt="" className="mx-auto" width={100} height={100}/>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default userLogin;
