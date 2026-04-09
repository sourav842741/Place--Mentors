import { Card, CardContent } from "@/components/ui/card";
import { Code, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CpotdCard({ solved = false, onClick }) {
  return (
    <Card 
className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-black/50 transition-all duration-200 cursor-pointer hover:scale-[1.005]"
      onClick={onClick}
    >

      
      {/* Content */}
      <CardContent className="relative p-8 pb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-100 rounded-2xl shadow-sm">
            <Code className="w-8 h-8 text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Coding POTD</h3>
            <p className="text-gray-500 text-lg font-medium">Daily DSA Challenge</p>
          </div>
        </div>
        
        <p className="text-white/70 text-sm mb-6 leading-relaxed line-clamp-3">
          Solve today's hand-picked coding problem and earn XP + badges!
        </p>

        {/* Solved Badge */}
        {solved && (
          <div className="absolute top-4 right-4 p-3 bg-green-100 border border-green-200 rounded-full shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between absolute bottom-6 left-6 right-6">
          <span className="text-3xl">
            💻
          </span>
          <div className="flex items-center gap-2 text-white font-semibold bg-black backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 hover:bg-black/30 transition-all">
            {solved ? (
              <>
                ✅ Completed
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Solve Now →
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

