import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import { Outlet } from "@tanstack/react-router";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect } from "react";
import {
  checkAndRedirectIfNotAuth,
  isAuthenticated,
  getToken,
} from "./Common/authUtils";

const MainLayout = () => {
  useEffect(() => {
    console.log("MainLayout mounted, checking authentication...");
    console.log("Is authenticated:", isAuthenticated());
    console.log("Token exists:", !!getToken());

    // Check authentication on component mount
    checkAndRedirectIfNotAuth();
  }, []);

  return (
    <Layout className="">
      <Sidebar />
      <Layout className="min-h-screen bg-[#f8f9fa]">
        <Header />
        <Content className="ml-[210px] mt-[100px] h-[calc(100vh-100px)] overflow-y-auto">
          <div className="py-4 px-2 overflow-y-auto">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
