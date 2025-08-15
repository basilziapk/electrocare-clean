import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  continueText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  continueText = "Continue" 
}: SuccessModalProps) {
  if (!isOpen) return null;

  // Prevent closing with Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Dark Overlay - Not clickable */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
        aria-hidden="true" 
      />
      
      {/* Modal Content */}
      <div className="relative z-60 max-w-md mx-auto bg-white rounded-lg shadow-2xl border">
        <div className="flex flex-col items-center text-center p-6">

          {/* Success Icon */}
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          
          {/* Description */}
          {description && (
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Continue Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {continueText}
          </Button>
        </div>
      </div>
    </div>
  );
}