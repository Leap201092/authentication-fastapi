import React from "react";
import { useMainContext } from "../../context/MainContext";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useMainContext();
  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="py-10 px-5 lg:w-1/2 w-[96%] bg-black/90">
          <h3 className="text-white text-4xl font-bold">Name: {user.name}</h3>
          <h3 className="text-white text-4xl font-bold">Email: {user.email}</h3>
          <h3 className="text-white text-4xl font-bold">
            Phone: {user.mobile}
          </h3>
          <h3 className="text-white text-4xl font-bold">
            Address: {user.address}
          </h3>
          <div className="mb-3">
            <Link
              to={"/profile"}
              className={
                "flex items-center justify-center bg-blue-600 disabled:bg-blue-900 w-full py-3 rounded cursor-pointer border-none text-white gap-x-2 outline-none disabled:cursor-no-drop"
              }
            >
              Update
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
