import { Search, MapPin, ChevronDown } from 'lucide-react';

export default function SearchSection() {
  return (
    <div className="w-full">
      {/* Dark Search Area */}
      <div className="bg-primary py-12 px-6 mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row items-center gap-2 overflow-hidden">
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Medical Services"
                className="w-full py-3 outline-none text-gray-700 font-medium"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200" />
            <button className="w-full md:w-auto bg-[#1B4B36] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#256045] transition-colors whitespace-nowrap cursor-pointer">
              Update Search
            </button>
          </div>
        </div>
      </div>

      {/* Light Filter Area */}
      <div className="bg-[#F8FAF9] border-b border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
             <div className="relative group">
                <button className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between text-gray-600 hover:border-[#1B4B36] transition-colors cursor-pointer">
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#1B4B36]" />
                </button>
             </div>
          </div>
          <div className="flex-1 min-w-[200px]">
             <div className="relative group">
                <button className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between text-gray-600 hover:border-[#1B4B36] transition-colors cursor-pointer">
                  <span>Location</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#1B4B36]" />
                </button>
             </div>
          </div>
          <div className="flex-1 min-w-[200px]">
             <div className="relative group">
                <button className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-between text-gray-600 hover:border-[#1B4B36] transition-colors cursor-pointer">
                  <span>Service Type</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#1B4B36]" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
