import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, ArrowRight } from "lucide-react";

interface AuthNotificationProps {
  title: string;
  description: string;
  onLogin: () => void;
  onRegister: () => void;
  feature?: string;
}

export function AuthNotification({ 
  title, 
  description, 
  onLogin, 
  onRegister, 
  feature = "feature" 
}: AuthNotificationProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Create an account to access {feature}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            Login to Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={onRegister}
            variant="outline" 
            className="w-full"
          >
            Create New Account
          </Button>
          
          <p className="text-xs text-gray-500">
            Your data is secure and will not be shared with third parties
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}