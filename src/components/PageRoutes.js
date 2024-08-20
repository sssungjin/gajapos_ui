import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Customer from "../pages/Customer";
import Layout from "./Layout";
import Tax from "../pages/Tax";
import ProtectedRoute from "./ProtectedRoute";

const PageRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="customer" element={<Customer />} />
          <Route element={<ProtectedRoute />}>
            <Route path="tax" element={<Tax />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default PageRoutes;
