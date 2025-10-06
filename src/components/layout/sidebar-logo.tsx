import Image from "next/image";

const SidebarLogo = () => {
  return (
    <div className="px-4 py-6">
      <Image width={50} height={50} alt="Kokoro Logo" src="/logo.png" />
    </div>
  );
};

export default SidebarLogo;
