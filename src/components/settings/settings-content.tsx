import { User } from "@/types/user";
import UpdateInfoForm from "./update-info-form";
import UpdateSecurityForm from "./update-security-form";

const SettingsContent = ({
  activeTab,
  user,
}: {
  activeTab: string;
  user: User;
}) => {
  return (
    <>
      <div className={activeTab === "profile" ? "block" : "hidden"}>
        <div className="mb-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Profile Information
          </h2>
        </div>
        <UpdateInfoForm />
      </div>

      <div className={activeTab === "security" ? "block" : "hidden"}>
        <div className="mb-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Security Settings
          </h2>
        </div>
        <UpdateSecurityForm user={user} />
      </div>
    </>
  );
};

export default SettingsContent;
