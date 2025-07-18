import { Button } from "../components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function SaaSLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-purple-400 to-indigo-900 font-['Inter',sans-serif]">
      {/* Top Navbar */}
      <nav className="relative z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between backdrop-blur-md bg-white/10 rounded-2xl px-6 py-3 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-white">Marketeam</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Your Team</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Solutions</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Blog</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button  className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">Log In</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25">Join Now</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 to-purple-200/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="relative z-10 p-8 lg:p-12">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
                  <span className="text-gray-900">Unlock Top</span><br />
                  <span className="text-gray-900">Marketing Talent</span><br />
                  <span className="text-gray-900">You Thought Was</span><br />
                  <span className="text-gray-900">Out of Reach —</span><br />
                  <span className="text-white drop-shadow-lg">Now Just One</span><br />
                  <span className="text-white drop-shadow-lg">Click Away!</span>
                </h1>
                <div className="space-y-6">
                  <Button className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-8 py-4 text-lg font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300">
                    Start Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="inline-flex items-center space-x-3 backdrop-blur-md bg-white/20 rounded-full px-4 py-2 border border-white/30 shadow-lg">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">David</span>
                    <span className="text-gray-700 text-sm">is ready to help</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] lg:h-[700px]">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="absolute z-20 bg-gradient-to-r from-purple-600/90 to-indigo-700/90 backdrop-blur-md rounded-full w-40 h-40 flex flex-col items-center justify-center text-white border border-purple-400/30 shadow-2xl shadow-purple-500/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">20k+</div>
                  <div className="text-sm font-medium text-purple-100">Specialists</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur-xl opacity-30 scale-150"></div>
                </div>
                <div className="absolute w-80 h-80 border border-purple-300/20 rounded-full animate-spin" style={{ animationDuration: "20s" }}></div>
                <div className="absolute w-96 h-96 border border-purple-300/10 rounded-full animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }}></div>
                <div className="absolute w-[28rem] h-[28rem] border border-purple-300/5 rounded-full animate-spin" style={{ animationDuration: "40s" }}></div>
                {[56, 48, 64, 48, 56, 40, 48].map((size, idx) => (
                  <div
                    key={idx}
                    className="absolute animate-pulse overflow-hidden rounded-full border-2 border-white/50 shadow-lg backdrop-blur-sm"
                    style={{ width: size, height: size }}
                  >
                    <img
                      src={`/placeholder.svg`}
                      alt="Marketing Specialist"
                      width={size}
                      height={size}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="absolute top-1/4 right-1/3 animate-bounce" style={{ animationDelay: "1s" }}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border border-white/30 shadow-lg shadow-purple-500/40 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute bottom-1/4 right-16 animate-bounce" style={{ animationDelay: "2s" }}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 border border-white/30 shadow-lg shadow-pink-500/40 backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl px-8 py-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between opacity-70">
              {[
                { name: "Dreamure", from: "blue-400", to: "indigo-500" },
                { name: "SWITCH.WIN", isTextOnly: true },
                { name: "Sphere", from: "emerald-400", to: "teal-500" },
                { name: "PinSpace", from: "purple-400", to: "pink-500" },
                { name: "Visionix", from: "orange-400", to: "red-500" },
              ].map((client, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  {!client.isTextOnly && (
                    <div className={`w-5 h-5 bg-gradient-to-r from-${client.from} to-${client.to} rounded${client.name === "Sphere" ? "-full" : ""}`}></div>
                  )}
                  <span className="text-white text-sm font-medium">{client.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}