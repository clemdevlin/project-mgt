import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import { Loader2Icon } from "lucide-react";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const AuthLayout = () => {
  const { loading } = useSelector((state) => state.workspace);
  const dispatch = useDispatch();
  const { isLoaded } = useUser();

  // Initial load of theme
  useEffect(() => {
    dispatch(loadTheme());
  }, []);

  if (loading || !isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-20 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="flex  bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
      <div className="flex w-screen items-center justify-center h-screen p-6 xl:p-10 xl:px-16 overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
