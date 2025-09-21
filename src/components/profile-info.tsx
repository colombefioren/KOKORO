import SignOutButton from "./auth/sign-out-button";

const ProfileInfo = () => {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-semibold text-xl">Profile</h1>
      <SignOutButton />
    </div>
  );
};
export default ProfileInfo;
