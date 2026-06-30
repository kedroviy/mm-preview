import type { SupportedLocale } from "@/src/shared/config/metadata";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";

export type PrivacyPolicySection = Readonly<{
  title: string;
  paragraphs: readonly string[];
}>;

export type PrivacyPolicyContent = Readonly<{
  metaTitle: string;
  metaDescription: string;
  h1: string;
  updatedAt: string;
  intro: string;
  sections: readonly PrivacyPolicySection[];
}>;

const PRIVACY_CONTACT_EMAIL = "kedraja@gmail.com";

const privacyByLocale: Record<SupportedLocale, PrivacyPolicyContent> = {
  ru: {
    metaTitle: "Политика конфиденциальности",
    metaDescription:
      "Как сайт Movie Match обрабатывает данные посетителей: cookies, реклама Яндекса и ссылки на мобильное приложение.",
    h1: "Политика конфиденциальности",
    updatedAt: "30 июня 2026 г.",
    intro:
      "Настоящая политика описывает, какие данные могут обрабатываться при посещении информационного сайта Movie Match (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями ниже.",
    sections: [
      {
        title: "1. Оператор и контакты",
        paragraphs: [
          `Оператор Сайта — проект Movie Match. Сайт размещён по адресу ${getLandingSiteUrl()}.`,
          `По вопросам обработки персональных данных и реализации ваших прав напишите на ${PRIVACY_CONTACT_EMAIL}.`,
        ],
      },
      {
        title: "2. Какие данные мы обрабатываем на Сайте",
        paragraphs: [
          "Сайт носит информационный характер: мы не требуем регистрации для просмотра страниц.",
          "При посещении автоматически могут передаваться технические данные: IP-адрес, тип браузера и устройства, язык интерфейса, дата и время запроса, адрес запрашиваемой страницы, источник перехода.",
          "Мы можем сохранять на вашем устройстве файлы cookie и аналогичные технологии для работы языковых настроек и анализа посещаемости.",
        ],
      },
      {
        title: "3. Реклама и сторонние сервисы",
        paragraphs: [
          "На Сайте может показываться реклама через рекламную сеть Яндекса (РСЯ). Яндекс может использовать cookie и иные идентификаторы для подбора объявлений, ограничения частоты показов и статистики.",
          "Обработка данных рекламными партнёрами регулируется их политиками. Подробнее о настройках рекламы Яндекса: https://yandex.ru/legal/confidential/",
          "Ссылки на Google Play и другие внешние ресурсы ведут на сторонние сайты с собственными правилами конфиденциальности.",
        ],
      },
      {
        title: "4. Цели обработки",
        paragraphs: [
          "Обеспечение работы и безопасности Сайта.",
          "Показ релевантной рекламы и измерение её эффективности.",
          "Улучшение контента и пользовательского опыта.",
          "Ответы на обращения пользователей.",
        ],
      },
      {
        title: "5. Правовые основания",
        paragraphs: [
          "Обработка технических данных необходима для функционирования Сайта.",
          "Для cookie и рекламных технологий мы опираемся на ваше согласие, которое выражается продолжением использования Сайта после ознакомления с настоящей политикой, если иное не предусмотрено применимым законодательством.",
        ],
      },
      {
        title: "6. Хранение и передача данных",
        paragraphs: [
          "Данные хранятся не дольше, чем это необходимо для указанных целей, либо в сроки, установленные законом.",
          "Данные могут обрабатываться поставщиками хостинга, аналитики и рекламными партнёрами, действующими по нашим поручениям или на основании собственных правил.",
        ],
      },
      {
        title: "7. Ваши права",
        paragraphs: [
          "Вы можете запросить уточнение, блокирование или удаление данных, отозвать согласие на обработку и ограничить использование cookie в настройках браузера.",
          "Вы вправе обратиться в уполномоченный орган по защите прав субъектов персональных данных в вашей стране, если считаете, что ваши права нарушены.",
        ],
      },
      {
        title: "8. Изменения политики",
        paragraphs: [
          "Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице с указанием даты обновления.",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Privacy Policy",
    metaDescription:
      "How the Movie Match website handles visitor data: cookies, Yandex advertising, and links to the mobile app.",
    h1: "Privacy Policy",
    updatedAt: "June 30, 2026",
    intro:
      "This policy explains what data may be processed when you visit the Movie Match informational website (the “Site”). By using the Site, you agree to the terms below.",
    sections: [
      {
        title: "1. Operator and contact",
        paragraphs: [
          `The Site is operated by the Movie Match project and is available at ${getLandingSiteUrl()}.`,
          `For privacy-related requests, contact ${PRIVACY_CONTACT_EMAIL}.`,
        ],
      },
      {
        title: "2. Data we process on the Site",
        paragraphs: [
          "The Site is informational; you do not need an account to browse pages.",
          "When you visit, technical data may be collected automatically: IP address, browser and device type, interface language, date and time of the request, requested page URL, and referral source.",
          "We may store cookies and similar technologies on your device for language preferences and traffic analysis.",
        ],
      },
      {
        title: "3. Advertising and third-party services",
        paragraphs: [
          "The Site may display ads through Yandex Advertising Network. Yandex may use cookies and other identifiers to select ads, cap frequency, and measure performance.",
          "Partner data processing is governed by their own policies. Learn more about Yandex privacy settings: https://yandex.ru/legal/confidential/",
          "Links to Google Play and other external resources lead to third-party sites with their own privacy rules.",
        ],
      },
      {
        title: "4. Purposes of processing",
        paragraphs: [
          "Operating and securing the Site.",
          "Showing relevant ads and measuring their effectiveness.",
          "Improving content and user experience.",
          "Responding to user inquiries.",
        ],
      },
      {
        title: "5. Legal bases",
        paragraphs: [
          "Processing technical data is necessary for the Site to function.",
          "For cookies and advertising technologies we rely on your consent, expressed by continuing to use the Site after reading this policy, unless applicable law requires otherwise.",
        ],
      },
      {
        title: "6. Retention and sharing",
        paragraphs: [
          "Data is kept only as long as needed for the purposes above or as required by law.",
          "Data may be processed by hosting, analytics, and advertising providers acting on our instructions or under their own terms.",
        ],
      },
      {
        title: "7. Your rights",
        paragraphs: [
          "You may request access, correction, restriction, or deletion of your data, withdraw consent, and limit cookies in your browser settings.",
          "You may lodge a complaint with your local data protection authority if you believe your rights have been violated.",
        ],
      },
      {
        title: "8. Changes to this policy",
        paragraphs: [
          "We may update this policy. The current version is always available on this page with the update date shown below.",
        ],
      },
    ],
  },
  es: {
    metaTitle: "Política de privacidad",
    metaDescription:
      "Cómo el sitio Movie Match trata los datos de los visitantes: cookies, publicidad de Yandex y enlaces a la app móvil.",
    h1: "Política de privacidad",
    updatedAt: "30 de junio de 2026",
    intro:
      "Esta política describe qué datos pueden tratarse al visitar el sitio informativo Movie Match (el «Sitio»). Al usar el Sitio, aceptas las condiciones siguientes.",
    sections: [
      {
        title: "1. Operador y contacto",
        paragraphs: [
          `El Sitio es operado por el proyecto Movie Match y está disponible en ${getLandingSiteUrl()}.`,
          `Para consultas sobre privacidad, escribe a ${PRIVACY_CONTACT_EMAIL}.`,
        ],
      },
      {
        title: "2. Datos que tratamos en el Sitio",
        paragraphs: [
          "El Sitio es informativo; no necesitas una cuenta para navegar.",
          "Al visitar, pueden recopilarse datos técnicos automáticamente: dirección IP, tipo de navegador y dispositivo, idioma de la interfaz, fecha y hora de la solicitud, URL de la página y origen de la visita.",
          "Podemos guardar cookies y tecnologías similares en tu dispositivo para preferencias de idioma y análisis de tráfico.",
        ],
      },
      {
        title: "3. Publicidad y servicios de terceros",
        paragraphs: [
          "El Sitio puede mostrar anuncios a través de la red publicitaria de Yandex. Yandex puede usar cookies y otros identificadores para seleccionar anuncios, limitar la frecuencia y medir resultados.",
          "El tratamiento por socios publicitarios se rige por sus propias políticas. Más información sobre privacidad en Yandex: https://yandex.ru/legal/confidential/",
          "Los enlaces a Google Play y otros recursos externos llevan a sitios de terceros con sus propias reglas de privacidad.",
        ],
      },
      {
        title: "4. Finalidades del tratamiento",
        paragraphs: [
          "Garantizar el funcionamiento y la seguridad del Sitio.",
          "Mostrar publicidad relevante y medir su eficacia.",
          "Mejorar el contenido y la experiencia de usuario.",
          "Responder a consultas de los usuarios.",
        ],
      },
      {
        title: "5. Bases legales",
        paragraphs: [
          "El tratamiento de datos técnicos es necesario para el funcionamiento del Sitio.",
          "Para cookies y tecnologías publicitarias nos basamos en tu consentimiento, expresado al seguir usando el Sitio después de leer esta política, salvo que la ley aplicable exija otra cosa.",
        ],
      },
      {
        title: "6. Conservación y cesión",
        paragraphs: [
          "Los datos se conservan solo el tiempo necesario para las finalidades indicadas o lo que exija la ley.",
          "Los datos pueden tratarse por proveedores de hosting, analítica y publicidad que actúan según nuestras instrucciones o sus propios términos.",
        ],
      },
      {
        title: "7. Tus derechos",
        paragraphs: [
          "Puedes solicitar acceso, rectificación, limitación o supresión de tus datos, retirar el consentimiento y restringir cookies en la configuración del navegador.",
          "Puedes presentar una reclamación ante la autoridad de protección de datos de tu país si consideras que se han vulnerado tus derechos.",
        ],
      },
      {
        title: "8. Cambios en esta política",
        paragraphs: [
          "Podemos actualizar esta política. La versión vigente siempre está disponible en esta página con la fecha de actualización.",
        ],
      },
    ],
  },
};

export function getPrivacyPolicyContent(
  locale: SupportedLocale,
): PrivacyPolicyContent {
  return privacyByLocale[locale] ?? privacyByLocale.ru;
}
