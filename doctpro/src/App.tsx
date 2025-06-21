import "./App.css";
import "antd/dist/reset.css";
import {
  createRootRoute,
  createRoute,
  Outlet,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import LoginPage from "./pages/Auth/LoginPage";
import SignUp from "./pages/Auth/Signup/Signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Verification from "./pages/Auth/Verification/Verification";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import SubAdmin from "./pages/SubAdmin/SubAdmin";
import HospitalList from "./pages/Organizations/Hospitals/HospitalList";
import CollegeList from "./pages/Organizations/Colleges/CollegeList";
import DegreeSpecializationList from "./pages/Organizations/Degree/DegreeSpecializationList";
import ClinicsList from "./pages/Organizations/Clinics/ClinicsList";
import StudentList from "./pages/PeopleManagement/Students/StudentList";
import HealthCareList from "./pages/PeopleManagement/HealthCare/HealthCareList";
import KycList from "./pages/KYCManagement/KycList";
import AdsPostList from "./pages/AdsManagement/AdsPostList";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ListCollege from "./pages/Organizations/College/ListCollege";
import SubAdminDashboard from "./pages/SubAdminFlow/SubAdminDashboard";
import CampaignList from "./pages/PeopleManagement/Campaign/CampaignList";
import PostManagementList from "./pages/PostManagement/PostManagementList";
import ChangePassword from "./pages/Auth/ChangePassword";
import ForgotPasswordVerifyOtp from "./pages/Auth/ForgotPasswordVerifyOtp";
import { AuthProvider } from "./pages/Common/Context/AuthContext";
import HospitalDashboard from "./pages/Dashboard/HospitalDashboard";
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    window.location.href = "/app";
    return null;
  },
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "auth",
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "signup",
  component: SignUp,
});

const verificationRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "verify",
  component: Verification,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "forgot-password",
  component: ForgotPassword,
});

const forgotPasswordVerifyOtpRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "forgot-password/verify-otp",
  component: ForgotPasswordVerifyOtp,
});

const changePasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "change-password",
  component: ChangePassword,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "app",
  component: () => <MainLayout />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "dashboard",
  component: () => <Dashboard />,
});

const subadminDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "subadmin/dashboard",
  component: () => <SubAdminDashboard />,
});

const subAdminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "subadmin",
  component: () => <SubAdmin />,
});

const hospitalsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hospitals",
  component: () => <HospitalList />,
});

const collegesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "colleges",
  component: () => <CollegeList />,
});

const collegeListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "colleges/list",
  component: () => <ListCollege />,
});

const degreeSpecializationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "degree-specialization",
  component: () => <DegreeSpecializationList />,
});

const clinicsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "clinics",
  component: () => <ClinicsList />,
});

const studentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "students",
  component: () => <StudentList />,
});

const healthcareRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "healthcare",
  component: () => <HealthCareList />,
});

const campaignRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "campaign",
  component: () => <CampaignList />,
});

const kycRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "kyc",
  component: () => <KycList />,
});

const adsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "ads",
  component: () => <AdsPostList />,
});

const postManagementRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "post-management/list",
  component: () => <PostManagementList />,
});

const hospitalDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "hospital/dashboard",
  component: () => <HospitalDashboard />,
});

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  authLayoutRoute.addChildren([
    loginRoute,
    signupRoute,
    verificationRoute,
    forgotPasswordRoute,
    changePasswordRoute,
    forgotPasswordVerifyOtpRoute,
  ]),
  appRoute.addChildren([
    dashboardRoute,
    subadminDashboardRoute,
    subAdminRoute,
    hospitalsRoute,
    collegesRoute,
    collegeListRoute,
    degreeSpecializationRoute,
    clinicsRoute,
    studentsRoute,
    healthcareRoute,
    kycRoute,
    adsRoute,
    campaignRoute,
    postManagementRoute,
    hospitalDashboardRoute,
  ]),
]);

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface RoutePaths {
    "/app": {};
  }
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      placeholderData: [],
    },
  },
});

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AntdApp>
        <div className="min-h-screen">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
