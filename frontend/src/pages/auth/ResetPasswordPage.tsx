import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm/ResetPasswordForm";
import { useSearchParams } from "react-router-dom";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  return <ResetPasswordForm email={email} token={token} />;
};
