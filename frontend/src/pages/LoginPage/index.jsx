import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLoaderButton from "../../components/AuthLoaderButton";
import { Form, Formik, ErrorMessage, Field } from "formik";
import * as yup from "yup";
import { axiosClient } from "../../utils/axiosClient";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useMainContext } from "../../context/MainContext";

const LoginPage = () => {
  const [isHide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const { fetchProfile } = useMainContext();
  const navigate = useNavigate();
  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Email must be valid")
      .required("Email Is Required"),
    password: yup.string().required("Password is Required"),
  });

  const initialValues = {
    email: "user@example.com",
    password: "string",
  };

  const onSubmitHandler = async (values, helpers) => {
    try {
      setLoading(true);
      /* console.log(values); */
      const response = await axiosClient.post("/auth/login", values);
      const data = response.data;
      //console.log(data);
      toast.success(data.message);
      localStorage.setItem("token", data.token);

      await fetchProfile();
      navigate("/");

      helpers.resetForm();
    } catch (error) {
      toast.error(error.response.data.detail || error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-[80vh]  flex justify-center items-center ">
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={onSubmitHandler}
        >
          <Form className="w-[96%] mx-auto py-10 px-8 bg-black lg:w-1/2 border border-gray-500 rounded-2xl shadow">
            <div className="mb-3">
              <label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                autoComplete="off"
                name="email"
                id="email"
                type="email"
                className="w-full py-3 px-4 rounded border outline-none transition-all duration-300 border-gray-400 focus:ring-1"
                placeholder="Enter Your Name"
              />
              <ErrorMessage
                name="email"
                className="text-red-500"
                component={"p"}
              ></ErrorMessage>
            </div>
            <div className="mb-3">
              <label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="border outline-none transition-all duration-300 border-gray-400 px-4 rounded focus:ring-1 flex justify-center items-center">
                <Field
                  autoComplete="off"
                  name="password"
                  id="password"
                  type={isHide ? "password" : "text"}
                  className="w-full py-3 border-none outline-none"
                  placeholder="Enter Your Name"
                />
                <button
                  onClick={() => setIsHide(!isHide)}
                  type="button"
                  className="text-2xl"
                >
                  {isHide ? <FaEye></FaEye> : <FaEyeSlash></FaEyeSlash>}
                </button>
              </div>
              <ErrorMessage
                name="password"
                className="text-red-500"
                component={"p"}
              ></ErrorMessage>
            </div>
            <div className="mb-3">
              <AuthLoaderButton
                isLoading={loading}
                text={"Login"}
                className={""}
              ></AuthLoaderButton>
            </div>
            <div className="mb-3">
              <p className="text-end">
                Don't have An Account?
                <Link to={"/register"} className="text-blue-500 font-bold">
                  {" "}
                  Register
                </Link>
              </p>
            </div>
          </Form>
        </Formik>
      </div>
    </>
  );
};

export default LoginPage;
