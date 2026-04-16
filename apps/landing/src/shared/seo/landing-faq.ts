import type { SupportedLocale } from "@/src/shared/config/metadata";
import { DEFAULT_LOCALE } from "@/src/shared/config/metadata";

/**
 * Единый источник правды: тот же текст в разметке FAQPage и на странице (требование Google).
 */
export type LandingFaqItem = {
  question: string;
  answer: string;
};

const LANDING_FAQ_RU: LandingFaqItem[] = [
  {
    question:
      "Чем Movie Match отличается от списка в чате или голосования в мессенджере?",
    answer:
      "Фокус на одном потоке: лобби, приглашение и совместный подбор внутри приложения, как в карточке Google Play. Параллельно в приложении доступен и соло-подбор — один человек может подобрать себе фильм на вечер без лобби. Меньше хаоса из десятков сообщений «давай это / нет, лучше то» — вы движетесь к согласованному варианту, когда смотрите вместе.",
  },
  {
    question: "Нужен ли всем участникам аккаунт в вебе?",
    answer:
      "В вебе вы можете начать с создания аккаунта на лендинге и перейти к сценарию из приложения. Для полного цикла в Android используйте Movie Match из Google Play — там тот же смысл: комната, приглашение и выбор вместе.",
  },
  {
    question: "Это только для пар или и для компании друзей?",
    answer:
      "Совместно — да: вечер вдвоём и посиделки с друзьями, с лобби и приглашением. Отдельно в приложении есть соло-подбор: один человек может выбрать себе фильм на вечер без второго участника.",
  },
  {
    question: "Можно ли пользоваться Movie Match одному, без компании?",
    answer:
      "Да. В приложении есть соло-подбор: вы подбираете себе фильм на вечер в одиночку, без лобби и без приглашения кого-то ещё. Если позже захотите посмотреть вместе — тот же Movie Match предлагает знакомый сценарий с комнатой и совместным выбором.",
  },
  {
    question: "Где скачать приложение и как устроена категория в Google Play?",
    answer:
      "Movie Match доступен в Google Play в категории развлечений (Entertainment). Ссылку на карточку приложения можно задать переменной окружения NEXT_PUBLIC_GOOGLE_PLAY_URL на деплое.",
  },
  {
    question: "Платный ли Movie Match?",
    answer:
      "На лендинге мы не продаём подписку: описание и сценарий соответствуют бесплатной установке из магазина с типичной моделью магазина приложений. Актуальные условия — в карточке Google Play.",
  },
  {
    question: "Работает ли выбор фильма, если у всех разные вкусы?",
    answer:
      "Именно для этого и заточен совместный подбор: вы не обязаны заранее сходиться во мнении — цель дойти до варианта, который устраивает участников лобби, без бесконечного круга обсуждений.",
  },
];

const LANDING_FAQ_EN: LandingFaqItem[] = [
  {
    question:
      "How is Movie Match different from a list in chat or a messenger poll?",
    answer:
      "It focuses on one flow: lobby, invite, and group matching inside the app, like the Google Play listing. Solo pick is also available—one person can choose a film for the night without a lobby. Fewer chaotic threads of “this one / no, that one”—you move toward an agreed pick when you watch together.",
  },
  {
    question: "Does everyone need a web account?",
    answer:
      "On the web you can start by creating an account on this landing and continue into the in-app flow. For the full loop on Android, use Movie Match from Google Play—the same idea: room, invite, and choosing together.",
  },
  {
    question: "Is this only for couples or also for a group of friends?",
    answer:
      "For groups—yes: date nights and hangouts with friends, with a lobby and invites. Separately, the app offers solo pick: one person can choose a film for the night without a second participant.",
  },
  {
    question: "Can I use Movie Match alone, without a group?",
    answer:
      "Yes. The app has solo pick: you choose a film for the night on your own, without a lobby or inviting anyone else. If you later want to watch together, the same Movie Match offers the familiar room-and-group-matching flow.",
  },
  {
    question: "Where do I download the app and how is the Play category set up?",
    answer:
      "Movie Match is on Google Play under Entertainment. You can point buttons to the listing with the NEXT_PUBLIC_GOOGLE_PLAY_URL environment variable on deploy.",
  },
  {
    question: "Is Movie Match paid?",
    answer:
      "This landing does not sell a subscription: the story matches a free install from the store with a typical app-store model. Current terms are on the Google Play listing.",
  },
  {
    question: "Does picking a film work if everyone has different tastes?",
    answer:
      "That is what group matching is for: you do not need to agree upfront—the goal is to reach an option the lobby participants can accept, without an endless discussion loop.",
  },
];

const LANDING_FAQ_ES: LandingFaqItem[] = [
  {
    question:
      "¿En qué se diferencia Movie Match de una lista en el chat o una encuesta en un messenger?",
    answer:
      "Se centra en un solo flujo: sala, invitación y elección en grupo dentro de la app, como en la ficha de Google Play. También hay elección en solitario: una persona puede elegir película para la noche sin sala. Menos caos de mensajes «esta / no, mejor esa»—avanzáis hacia una opción común cuando veis juntos.",
  },
  {
    question: "¿Todos necesitan cuenta en la web?",
    answer:
      "En la web podéis empezar creando cuenta en este sitio y seguir el flujo de la app. Para el ciclo completo en Android, usad Movie Match desde Google Play: la misma idea—sala, invitación y elección juntos.",
  },
  {
    question: "¿Solo es para parejas o también para un grupo de amigos?",
    answer:
      "En grupo—sí: noches en pareja y quedadas con amigos, con sala e invitaciones. Por separado, la app ofrece elección en solitario: una persona puede elegir película para la noche sin un segundo participante.",
  },
  {
    question: "¿Puedo usar Movie Match solo, sin grupo?",
    answer:
      "Sí. La app tiene elección en solitario: eliges película para la noche tú solo, sin sala ni invitar a nadie más. Si luego queréis ver juntos, el mismo Movie Match ofrece el flujo de sala y elección en grupo.",
  },
  {
    question: "¿Dónde descargo la app y cómo está la categoría en Google Play?",
    answer:
      "Movie Match está en Google Play en Entretenimiento. Podéis apuntar los botones a la ficha con la variable de entorno NEXT_PUBLIC_GOOGLE_PLAY_URL en el despliegue.",
  },
  {
    question: "¿Movie Match es de pago?",
    answer:
      "En este sitio no vendemos suscripción: la descripción encaja con una instalación gratuita desde la tienda y el modelo habitual de la tienda de apps. Las condiciones actuales están en la ficha de Google Play.",
  },
  {
    question: "¿Funciona la elección si a todos les gusta algo distinto?",
    answer:
      "Para eso está la elección en grupo: no hace falta estar de acuerdo desde el principio—el objetivo es llegar a una opción que encaje para quienes están en la sala, sin un bucle infinito de debate.",
  },
];

const FAQ_BY_LOCALE: Record<SupportedLocale, LandingFaqItem[]> = {
  ru: LANDING_FAQ_RU,
  en: LANDING_FAQ_EN,
  es: LANDING_FAQ_ES,
};

export function getLandingFaqItems(
  locale: SupportedLocale = DEFAULT_LOCALE,
): LandingFaqItem[] {
  return FAQ_BY_LOCALE[locale];
}
