import "./App.css";
import {
  createRootRoute,
  createRoute,
  Outlet,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import LoginPage from "./pages/Auth/LoginPage";
import SignUp from "./pages/Auth/Signup/Signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Verification from "./pages/Auth/Verification/Verification";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import SubAdmin from "./pages/SubAdmin/SubAdmin";
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

const subAdminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "subadmin",
  component: () => <SubAdmin />,
});

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  authLayoutRoute.addChildren([loginRoute, signupRoute, verificationRoute]),
  appRoute.addChildren([dashboardRoute, subAdminRoute]),
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
const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
