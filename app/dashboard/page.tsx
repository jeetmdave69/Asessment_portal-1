"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ModernRedirectLoader from "../../components/ModernRedirectLoader";

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const role = user?.publicMetadata?.role;
    if (!role) return router.push("/sign-in");
    
    let url: string;
    if (role === "admin") url = "/dashboard/admin";
    else if (role === "teacher") url = "/dashboard/teacher";
    else if (role === "student") url = "/dashboard/student";
    else url = "/sign-in"; // Redirect to sign-in if role is invalid
    
    setRedirectUrl(url);
  }, [isLoaded, user, router]);

  if (!redirectUrl) return null;

  return (
    <ModernRedirectLoader
      name={
        typeof user?.firstName === 'string' ? user.firstName :
        typeof user?.fullName === 'string' ? user.fullName :
        typeof user?.username === 'string' ? user.username :
        typeof user?.emailAddresses?.[0]?.emailAddress === 'string' ? user.emailAddresses[0].emailAddress :
        "User"
      }
      redirectUrl={redirectUrl}
    />
  );
}
