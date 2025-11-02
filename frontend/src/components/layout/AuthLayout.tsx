import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
      
      {/* Right side - Hero/Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold animate-float">
              AI Video Studio
            </h1>
            <p className="text-xl opacity-90 max-w-md">
              Transform your videos with AI-powered clips, captions, translations, and more
            </p>
            <div className="flex space-x-4 text-sm opacity-80">
              <span>✨ Auto Clipping</span>
              <span>📝 Smart Captions</span>
              <span>🌍 Translations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;