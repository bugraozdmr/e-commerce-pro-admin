import { ReactNode } from 'react';


interface AuthLayoutProps {
    children: ReactNode;
}
  

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex items-center justify-center h-full">
            {children}
        </div>
    )
}