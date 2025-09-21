import { Button } from "../ui/button";

const LoginForm = ({
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
      LoginForm
      <Button
        onClick={onToggle}
      >
        Sign Up
      </Button>
    </div>
  );
};
export default LoginForm;
