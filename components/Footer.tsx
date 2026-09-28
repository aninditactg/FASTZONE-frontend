import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#ebf0f5] rounded-t-lg p-5 border-t border-gray-200">
      <div className="font-semibold text-xs tracking-wider text-gray-700 uppercase mb-3">
        FAST ZONE
      </div>
      <div className="border-t border-gray-300 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          {/* EZ Logo badge */}
          <div className="w-6 h-6 rounded bg-white shadow-xs border border-gray-200 flex items-center justify-center font-black text-[10px] leading-none">
            <span className="text-red-500">E</span>
            <span className="text-blue-600">Z</span>
          </div>
          <span>© 2026 Developed by FZ</span>
        </div>
        <div>All rights reserved - v4.0.8</div>
      </div>
    </footer>
  );
}

