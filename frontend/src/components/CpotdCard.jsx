import { Card, CardContent } from "@/components/ui/card";
import { Code, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CpotdCard({ solved = false, onClick }) {
  return (
    <Card 
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-600/20 border-0 hover:scale-[1.02] hover:-translate-y-2 active:scale-[0.98]"
      onClick={onClick}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500/80 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <CardContent className="relative p-8 pb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
            <Code className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Coding POTD</h3>
            <p className="text-white/80 text-lg">Daily DSA Challenge</p>
          </div>
        </div>
        
        <p className="text-white/70 text-sm mb-6 leading-relaxed line-clamp-3">
          Solve today's hand-picked coding problem and earn XP + badges!
        </p>

        {/* Solved Badge */}
        {solved && (
          <div className="absolute top-4 right-4 p-3 bg-green-500/20 backdrop-blur-sm rounded-2xl border border-green-400/50 shadow-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between absolute bottom-6 left-6 right-6">
          <span className="text-3xl">
            💻
          </span>
          <div className="flex items-center gap-2 text-white font-semibold bg-black/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 hover:bg-black/30 transition-all">
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

