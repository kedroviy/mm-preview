import { UserCreationForm } from "@/src/features/user-creation/components/UserCreationForm";

export default function UserCreationPage() {
  // Логика редиректа обрабатывается в middleware
  // Если дошли сюда, значит токенов нет или они невалидные - показываем форму
  return <UserCreationForm />;
}
