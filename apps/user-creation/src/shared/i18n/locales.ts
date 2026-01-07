export const translations = {
  en: {
    title: "Enter the application",
    nameLabel: "Name",
    namePlaceholder: "Enter your name",
    nameRequired: "Name is required",
    nameInvalid: "Name can only contain letters and numbers",
    nameMinLength: "Name must be at least 2 characters",
    next: "Next",
    creating: "Creating...",
    error: "Failed to create account. Please try again.",
    successTitle: "User created successfully!",
    successMessage: "Your user with the name",
    successCreated: "created",
    successContinue: "Continue",
    successNotification: "User created successfully",
  },
  ru: {
    title: "Войти в приложение",
    nameLabel: "Имя",
    namePlaceholder: "Введите ваше имя",
    nameRequired: "Имя обязательно",
    nameInvalid: "Имя может содержать только буквы и цифры",
    nameMinLength: "Имя должно содержать минимум 2 символа",
    next: "Далее",
    creating: "Создание...",
    error: "Не удалось создать аккаунт. Попробуйте еще раз.",
    successTitle: "Пользователь успешно создан!",
    successMessage: "Ваш пользователь с именем",
    successCreated: "создан",
    successContinue: "Продолжить",
    successNotification: "Пользователь успешно создан",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
