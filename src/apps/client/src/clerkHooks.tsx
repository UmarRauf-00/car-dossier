import { useUser } from "@clerk/react";

export default function GetClerkUser() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Handle loading state
  if (!isLoaded) return <div>Loading...</div>;

  // Protect the page from unauthenticated users
  if (!isSignedIn) return <div>Sign in to view this page</div>;

  return (
    <div>
      Hello {user.id}! {user.firstName} - {user.lastName} -{" "}
      {user.primaryEmailAddress?.emailAddress}
    </div>
  );
}
