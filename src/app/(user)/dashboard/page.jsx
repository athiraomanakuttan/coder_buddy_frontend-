'use client'
import { useEffect } from "react";
import Navbar from "../../../components/user/Navbar/Navbar";
import { getSession, useSession } from "next-auth/react";
import useAuthStore from "@/store/authStore";
import { SessionProvider } from "next-auth/react";


const dashboard = () => {

  const { data: session, status } = useSession();
  console.log("session",session)
  console.log("status",status)
  const setUserAuth = useAuthStore(state => state.setUserAuth);

  useEffect(() => {
    if (session?.user && status === "authenticated") {
      setUserAuth(session.user.userData, session.user.access || '');
    }
  }, [session, status, setUserAuth]);

  return (
<SessionProvider >
    <div className=" m-0 p-0 flex">
      <div className=" p-0 m-0">
        <Navbar />
      </div>
      <div className="border w-100">
        <div className="container mt-5 flex justify-evenly">
          <div className="border pl-10 pr-10 pt-3 pb-3 text-center">
            <h5>TOTAL POST</h5>
            <h1 className="text-3xl text-primarys">10</h1>
          </div>
          <div className="border pl-10 pr-10 pt-3 pb-3 text-center">
          <h5>TOTAL POST</h5>
            <h1 className="text-3xl text-primarys">10</h1>
          </div>
          <div className="border pl-10 pr-10 pt-3 pb-3 text-center">
          <h5>TOTAL POST</h5>
            <h1 className="text-3xl text-primarys">10</h1>
          </div>
          <div className="border pl-10 pr-10 pt-3 pb-3 text-center">
          <h5>TOTAL POST</h5>
            <h1 className="text-3xl text-primarys">10</h1>
          </div>

          <div className="border pl-10 pr-10 pt-3 pb-3 text-center">
          <h5>TOTAL POST</h5>
            <h1 className="text-3xl text-primarys">10</h1>
          </div>

        </div>
      </div>
    </div>
    </SessionProvider>
  );
};

export default dashboard;
