import { Routes, Route, Link } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import AuthLayout from "./components/AuthLayout";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
};

export default App;

const Notfound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-800">
      <div className="flex flex-col items-center justify-center w-1/2 h-1/3 border border-gray-200 rounded shadow bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900">
        <h1 className="text-4xl text-zinc-600 dark:text-white/70">404</h1>
        <p className="text-xl text-zinc-400 dark:text-white/50">
          Oops! You've entered the wrong path
        </p>
        <Link
          to="/"
          className="mt-8 bg-zinc-100 rounded-xl shadow border border-gray-100 p-4 hover:bg-zinc-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};
