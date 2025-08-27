import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-8 right-8 z-50 transition-all duration-300 ease-in-out transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 0})`,
      }}
    >
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform duration-200"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
    </div>
  );
}
