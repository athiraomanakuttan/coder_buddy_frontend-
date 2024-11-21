import Link from "next/link";

const userLogin = () => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-7 p-5  col-sm-12">
            <div className="inner-div border rounded pr-3 pl-3 pt-14 pb-10">
              <form action="">
                <h1 className="text-center">Sign In</h1>
                <input
                  type="text"
                  placeholder="Enter your email id"
                  className="border rounded w-100 p-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Enter your password"
                  className="border rounded w-100 p-2 mb-3"
                />
                <input type="submit" value="Login"  className="w-100 bg-primarys p-2 mb-3 text-white"  />
                <button className="border-black border rounded w-100 p-2 mb-3" >
                    <img src="/icons/g-icon.png" alt=""  className="d-inline m-1"/>
                     Sign in with google </button>
              </form>
              <div className="flex justify-between">
            <Link href='/forgot' className="custom-link" >forgot password</Link>
            <p className="custom-link">Don't have an account yet ? <Link href='/signup'  className="custom-link">Register Now</Link></p>
          </div>
            </div>
          </div>
          <div className="col-5 d-none d-md-inline pt-5">
            <img src="/images/user-login.png" alt="" className="mx-auto" />
          </div>
          
        </div>
      </div>
    </>
  );
};

export default userLogin;
