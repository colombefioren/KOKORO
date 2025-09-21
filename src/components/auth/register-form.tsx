import { Button } from "../ui/button";

const RegisterForm = ({
  className,
  onToggle,
}: {
  className?: string;
  onToggle: () => void;
}) => {
  return (
    <div
      className={`bg-amber-700 rounded-xl h-[70vh] w-[400px] max-w-[400px] ${className}`}
    >
      RegisterForm
      <Button
        onClick={onToggle}
      >
        Sign In
      </Button>
    </div>
  );
};
export default RegisterForm;
