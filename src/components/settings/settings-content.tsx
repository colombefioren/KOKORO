import { User } from "@/types/user";
import UpdateInfoForm from "./update-info-form";
import UpdateSecurityForm from "./update-security-form";



const SettingsContent = ({ activeTab, user }: {activeTab: string, user: User}) => {
  return (
    <>
      <div className={activeTab === "profile" ? "block" : "hidden"}>
        <div className="panel-header mb-8 pb-6 border-b border-light-royal-blue/20">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            Profile Information
          </h2>
        </div>
        <UpdateInfoForm />
      </div>

      <div className={activeTab === "security" ? "block" : "hidden"}>
        <div className="panel-header mb-8 pb-6 border-b border-light-royal-blue/20">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            Security Settings
          </h2>
        </div>
        <UpdateSecurityForm user={user} />
      </div>
    </>
  );
};

export default SettingsContent;
