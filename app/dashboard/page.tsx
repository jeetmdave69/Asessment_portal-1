"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import RoleRedirectSplash from "../../components/RoleRedirectSplash";

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const role = user?.publicMetadata?.role;
    if (!role) return router.push("/unauthorized");
    let url = "/unauthorized";
    if (role === "admin") url = "/dashboard/admin";
    else if (role === "teacher") url = "/dashboard/teacher";
    else if (role === "student") url = "/dashboard/student";
    setRedirectUrl(url);
  }, [isLoaded, user, router]);

  if (!redirectUrl) return null;

  return (
    <RoleRedirectSplash
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
