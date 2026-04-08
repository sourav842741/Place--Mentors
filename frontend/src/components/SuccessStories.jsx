import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaQuoteLeft } from "react-icons/fa";

const successStoriesData = [
  {
    name: "Sarah Jenkins",
    role: "SDE-1 at Amazon",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    message:
      "The coding track here exactly matched the level of difficulty I faced in the actual OA.",
  },
  {
    name: "Rohan Mehta",
    role: "SDE Intern at Amazon",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    message:
      "Didn’t ignore aptitude rounds. PrepPro’s data interpretation mocks were crucial.",
  },
  {
    name: "Ananya Sharma",
    role: "Placed at Flipkart",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    message:
      "AI planner helped me stay consistent. My preparation became structured.",
  },
  {
    name: "Kunal Verma",
    role: "SDE at TCS",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    message:
      "Revision notes feature saved me before exams. Highly recommended!",
  },
  {
    name: "Vikram Aditya",
    role: "SDE at Google",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    message: "Data Structures aur Algorithms ka depth yahan kaafi solid hai. Google ke interview rounds ke liye kaafi help mili."
  },
  {
    name: "Ishita Gupta",
    role: "Full Stack Dev at Zomato",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    message: "Project-based learning approach ne mere resume ko stand out karne mein help ki. Mentor support top-notch tha!"
  },
  {
    name: "Priya Das",
    role: "Software Engineer at Microsoft",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    message: "System Design ke concepts itne clear pehle kabhi nahi the. Mock interviews ne mera confidence level boost kar diya."
  },
  {
    name: "Siddharth Rao",
    role: "Frontend Lead at Razorpay",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    message: "Yahan ke UI/UX tracks aur React mocks industry standards se bilkul match karte hain. Placement support amazing hai."
  },
  {
    name: "Megha Kapoor",
    role: "Backend Intern at Adobe",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7b?w=200&h=200&fit=crop",
    message: "Practice sets itne exhaustive hain ki aapko kahin aur jaane ki zaroorat hi nahi. Best decision for my career!"
  },
  {
    name: "Rahul Khanna",
    role: "Placement in Goldman Sachs",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    message: "Problem-solving speed pe focus karna mere liye game changer raha. Quantitative aptitude tests kaafi accurate the."
  }
];

const SuccessStories = () => {
  return (
    <div className="w-full space-y-4 md:5 lg:ml-70">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🏆 Success Stories
        </h2>

        <Button variant="link" className="text-blue-600 text-sm p-0 h-auto">
          View All →
        </Button>
      </div>

      {/* Scrollable Stories */}
      <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">
        {successStoriesData.map((story, index) => (
          <Card
            key={index}
            className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-4 flex gap-3">
              
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={story.image} alt={story.name} />
                <AvatarFallback>
                  {story.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{story.name}</h4>
                <p className="text-xs text-gray-500">{story.role}</p>

                <div className="flex gap-2 mt-2">
                  <FaQuoteLeft className="text-gray-400 text-xs mt-1" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {story.message}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuccessStories;