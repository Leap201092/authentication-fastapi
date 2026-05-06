import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { axiosClient } from "./utils/axiosClient";
import MainContextProvider from "./context/MainContext";
import ProtectedLayout from "./layout/ProtectedLayout";

const App = () => {
  //console.log("BASE URL:", import.meta.env.VITE_APP_BACKEND_URI)
  const checkServerHealth = async () => {
    const response = await axiosClient.get("/health");
    const data = response.data;
    console.log(data);
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  return (
    <MainContextProvider>
      <Navbar> </Navbar>
      <div className="px-4">
        <Routes>
          <Route path="/" Component={ProtectedLayout}>
            <Route index Component={HomePage}></Route>
            <Route path="/profile" Component={ProfilePage}></Route>
          </Route>
          <Route path="/about" Component={AboutPage}></Route>
          <Route path="/login" Component={LoginPage}></Route>
          <Route path="/register" Component={RegisterPage}></Route>
        </Routes>
      </div>
      <Footer></Footer>
    </MainContextProvider>
  );
};

export default App;
