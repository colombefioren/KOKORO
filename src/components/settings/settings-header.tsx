const SettingsHeader = () => {
  return (
    <div className="mb-10 mt-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Account Settings
          </h1>
          <p className="text-white/60 text-sm">
            Manage your profile and account preferences
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
