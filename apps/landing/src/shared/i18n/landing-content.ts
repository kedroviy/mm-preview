import type { SupportedLocale } from "@/src/shared/config/metadata";

export type LandingFeature = {
  title: string;
  desc: string;
  icon: string;
  span: string;
};

export type LandingReview = {
  quote: string;
  name: string;
  role: string;
};

export type ScenarioKey = "friends" | "couple" | "solo";

export type ScenarioBlock = {
  label: string;
  body: string;
  hint: string;
};

export type LandingCopy = {
  googlePlayBadgeTop: string;
  googlePlayBadgeBottom: string;
  heroEyebrow: string;
  heroTitleBefore: string;
  heroTitleHighlight: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  ctaCreateAccount: string;
  ctaCreateAccountAria: string;
  ctaDownloadPlay: string;
  ctaDownloadPlayAria: string;
  marquee: string[];
  scenarioCardKicker: string;
  scenarioCardTitle: string;
  playBrand: string;
  playCardSub: string;
  playCheck1: string;
  playCheck2: string;
  playCheck3: string;
  downloadKicker: string;
  downloadTitleBefore: string;
  downloadTitleBrand: string;
  downloadTitleAfter: string;
  downloadBody: string;
  downloadCardAria: string;
  downloadQrCaption: string;
  downloadQrAlt: string;
  downloadCardHint: string;
  downloadLinkAria: string;
  downloadLinkText: string;
  featuresHeading: string;
  featuresSub: string;
  features: LandingFeature[];
  guidesHeading: string;
  guidesSub: string;
  guidesReadMore: string;
  guidesAllLink: string;
  guidesListAria: string;
  faqHeading: string;
  faqSub: string;
  reviewsHeading: string;
  reviewsSub: string;
  reviews: LandingReview[];
  closingHeading: string;
  closingBody: string;
  closingWeb: string;
  closingWebAria: string;
  closingPlay: string;
  closingPlayAria: string;
  scenarioHeading: string;
  scenarioSub: string;
  scenarioLegend: string;
  scenarioByKey: Record<ScenarioKey, ScenarioBlock>;
};

const landingCopy: Record<SupportedLocale, LandingCopy> = {
  ru: {
    googlePlayBadgeTop: "GET IT ON",
    googlePlayBadgeBottom: "Google Play",
    heroEyebrow: "Movie Match · развлечения · Google Play",
    heroTitleBefore: "Фильм для вечера — ",
    heroTitleHighlight: "без споров",
    heroTitleLine2: "с друзьями, парой или в соло",
    heroSubtitle:
      "Как в приложении в Google Play: лобби, приглашение и совместный выбор с друзьями или партнёром — или соло-подбор, когда один человек подбирает себе кино на вечер без лобби и без второго участника.",
    ctaCreateAccount: "Создать аккаунт (веб)",
    ctaCreateAccountAria: "Создать аккаунт Movie Match в браузере",
    ctaDownloadPlay: "Скачать в Google Play",
    ctaDownloadPlayAria:
      "Скачать Movie Match в Google Play (откроется в новой вкладке)",
    marquee: [
      "Лобби",
      "Приглашение друга",
      "Соло-подбор",
      "Компания друзей",
      "Вдвоём с партнёром",
      "Драма",
      "Комедия",
      "Триллер",
      "Совместный выбор",
      "Без споров",
      "Как в Google Play",
    ],
    scenarioCardKicker: "Сценарий из приложения",
    scenarioCardTitle:
      "Лобби → приглашение → совместный подбор — и отдельно соло-подбор для вечера одному.",
    playBrand: "Play",
    playCardSub: "приложение уже в каталоге Google Play (Entertainment)",
    playCheck1: "Лобби и приглашение друга",
    playCheck2: "Совместный выбор без споров",
    playCheck3: "Соло-подбор фильма на вечер",
    downloadKicker: "Google Play · Entertainment",
    downloadTitleBefore: "Скачай ",
    downloadTitleBrand: "Movie Match",
    downloadTitleAfter: " в Google Play",
    downloadBody:
      "Официальное описание в магазине: приложение помогает выбрать фильм в компании друзей или супругов — больше никаких споров при совместном выборе. Плюс в приложении есть соло-подбор: один человек может подобрать себе кино на вечер. Лобби и приглашение — когда смотрите вместе.",
    downloadCardAria:
      "Скачать Movie Match в Google Play. Откроется карточка приложения в новой вкладке.",
    downloadQrCaption: "Сканируй QR с телефона — откроется Google Play",
    downloadQrAlt: "QR-код: открыть Movie Match в Google Play",
    downloadCardHint: "Откроется карточка приложения в Google Play",
    downloadLinkAria: "Открыть Movie Match в Google Play в новой вкладке",
    downloadLinkText: "Открыть Movie Match в Google Play →",
    featuresHeading: "Совместно и в одиночку",
    featuresSub:
      "В карточке приложения: лобби, приглашение и совместный выбор — и соло-подбор, когда фильм на вечер выбираете только вы.",
    features: [
      {
        title: "Лобби и приглашение",
        desc: "Как в приложении в Google Play: создаёшь комнату, приглашаешь человека и переходите к совместному выбору — без хаоса в чате. Нужен вечер один — открой соло-подбор без лобби.",
        icon: "pi-comment",
        span: "md:col-span-2",
      },
      {
        title: "Друзья, пара или соло",
        desc: "Компания, вдвоём с партнёром или ты один: в приложении есть и совместный подбор с лобби, и соло-подбор фильма на вечер без второго участника.",
        icon: "pi-users",
        span: "md:col-span-1",
      },
      {
        title: "Меньше споров",
        desc: "Вместе — к согласованному фильму без часовых дискуссий. В соло — быстрее сузить варианты и выбрать кино на своё настроение.",
        icon: "pi-heart",
        span: "md:col-span-1",
      },
      {
        title: "Развлечения в Play",
        desc: "Movie Match уже в каталоге Google Play (Entertainment) — скачай на телефон: лобби для компании или соло-подбор для вечера одному.",
        icon: "pi-android",
        span: "md:col-span-2",
      },
    ],
    guidesHeading: "Гайды: выбор фильма и Movie Match",
    guidesSub:
      "Отдельные страницы под узкие запросы — лобби, пара, компания, соло-подбор, Google Play. Всё в одном приложении.",
    guidesReadMore: "Читать →",
    guidesAllLink: "Все материалы на одной странице →",
    guidesListAria: "Тематические гайды по выбору фильма и приложению",
    faqHeading: "Вопросы и ответы",
    faqSub:
      "Лобби, приглашение, совместный и соло-подбор — и как это связано с Google Play.",
    reviewsHeading: "Отзывы",
    reviewsSub: "Коротко — как это ощущается в жизни, а не в презентации.",
    reviews: [
      {
        quote:
          "Раньше убивали вечер на «ну выбери ты». Теперь лобби, приглашение — и мы уже в подборе.",
        name: "Алина",
        role: "вечера с друзьями",
      },
      {
        quote:
          "Как в описании приложения: без споров при выборе фильма. Вдвоём наконец смотрим, а не обсуждаем.",
        name: "Макс и Катя",
        role: "пара, Google Play",
      },
      {
        quote:
          "Скачали из Play, создали комнату за минуту. Для компании идеально.",
        name: "Илья",
        role: "развлечения на выходных",
      },
    ],
    closingHeading: "Готов убрать хаос из выбора фильма?",
    closingBody:
      "В вебе — быстрый старт с аккаунтом; в Android — то же Movie Match из Google Play: совместный выбор в лобби или соло-подбор фильма на вечер одному.",
    closingWeb: "Начать в браузере",
    closingWebAria: "Начать в браузере: создать аккаунт Movie Match",
    closingPlay: "Открыть в Google Play",
    closingPlayAria: "Открыть Movie Match в Google Play в новой вкладке",
    scenarioHeading: "Ваш сценарий",
    scenarioSub:
      "Нажмите вариант — вечер с друзьями, вдвоём или соло-подбор фильма на вечер одному.",
    scenarioLegend: "Выберите сценарий использования",
    scenarioByKey: {
      friends: {
        label: "С друзьями",
        body: "В компании чаще всего страдает синхронизация: кто-то в личке, кто-то в общем чате. Movie Match завязан на одном лобби и приглашении — вы заранее собираете состав, а потом идёте в подбор, как в описании приложения в Google Play.",
        hint: "Дальше: создайте комнату в приложении и разошлите приглашение до того, как начнётся «а у меня тут ещё пять вариантов».",
      },
      couple: {
        label: "Вдвоём",
        body: "В паре больше эмоций вокруг «ты опять не угадал». Совместный подбор в Movie Match симметричен: не один тянет выбор, а оба участвуют в одном потоке — меньше ощущения, что ответственность лежит на одном человеке.",
        hint: "Если удобнее начать с телефона — карточка Movie Match в Google Play; если с браузера — кнопка создания аккаунта на этом сайте.",
      },
      solo: {
        label: "В соло",
        body: "Не всегда есть с кем согласовывать вечер: в приложении есть соло-подбор — один человек проходит подбор и выбирает себе фильм без лобби и без приглашения второго участника.",
        hint: "Откройте Movie Match в Google Play и выберите сценарий для вечера в одиночку; при желании позже всегда можно перейти к лобби для совместного просмотра.",
      },
    },
  },
  en: {
    googlePlayBadgeTop: "GET IT ON",
    googlePlayBadgeBottom: "Google Play",
    heroEyebrow: "Movie Match · entertainment · Google Play",
    heroTitleBefore: "A film for tonight — ",
    heroTitleHighlight: "without the fight",
    heroTitleLine2: "with friends, your partner, or solo",
    heroSubtitle:
      "Like the Google Play listing: lobby, invite, and group matching with friends or your partner—or a solo picker when one person picks a film for the night without a lobby or a second player.",
    ctaCreateAccount: "Create account (web)",
    ctaCreateAccountAria: "Create a Movie Match account in the browser",
    ctaDownloadPlay: "Get it on Google Play",
    ctaDownloadPlayAria: "Download Movie Match on Google Play (opens in a new tab)",
    marquee: [
      "Lobby",
      "Invite a friend",
      "Solo pick",
      "Friends night",
      "Date night",
      "Drama",
      "Comedy",
      "Thriller",
      "Group match",
      "No endless debate",
      "Like on Google Play",
    ],
    scenarioCardKicker: "From the app",
    scenarioCardTitle:
      "Lobby → invite → group matching—and a separate solo pick when you are on your own tonight.",
    playBrand: "Play",
    playCardSub: "the app is already listed on Google Play (Entertainment)",
    playCheck1: "Lobby and friend invite",
    playCheck2: "Group choice without endless arguing",
    playCheck3: "Solo pick for your evening",
    downloadKicker: "Google Play · Entertainment",
    downloadTitleBefore: "Download ",
    downloadTitleBrand: "Movie Match",
    downloadTitleAfter: " on Google Play",
    downloadBody:
      "Per the store listing: the app helps you pick a film with friends or your partner—no more deadlocked debates. There is also solo pick: one person can choose a film for the night. Lobby and invite are for watching together.",
    downloadCardAria:
      "Download Movie Match on Google Play. The store listing opens in a new tab.",
    downloadQrCaption: "Scan the QR on your phone to open Google Play",
    downloadQrAlt: "QR code: open Movie Match on Google Play",
    downloadCardHint: "Opens the app listing on Google Play",
    downloadLinkAria: "Open Movie Match on Google Play in a new tab",
    downloadLinkText: "Open Movie Match on Google Play →",
    featuresHeading: "Together or on your own",
    featuresSub:
      "In the store listing: lobby, invite, and group matching—and solo pick when only you choose tonight’s film.",
    features: [
      {
        title: "Lobby and invite",
        desc: "Like on Google Play: create a room, invite someone, and move into group matching—without chat chaos. Want a solo night? Open solo pick without a lobby.",
        icon: "pi-comment",
        span: "md:col-span-2",
      },
      {
        title: "Friends, couple, or solo",
        desc: "A group, date night, or just you: the app has group matching with a lobby and solo pick for the evening without a second person.",
        icon: "pi-users",
        span: "md:col-span-1",
      },
      {
        title: "Fewer fights",
        desc: "Together—land on one film without hour-long threads. Solo—narrow options faster and match your mood.",
        icon: "pi-heart",
        span: "md:col-span-1",
      },
      {
        title: "Entertainment on Play",
        desc: "Movie Match is already on Google Play (Entertainment)—install on your phone: lobby for a group or solo pick for a night alone.",
        icon: "pi-android",
        span: "md:col-span-2",
      },
    ],
    guidesHeading: "Guides: picking films and Movie Match",
    guidesSub:
      "Separate pages for specific searches—lobby, couple, group, solo pick, Google Play. All in one app.",
    guidesReadMore: "Read →",
    guidesAllLink: "All articles on one page →",
    guidesListAria: "Topic guides about picking films and the app",
    faqHeading: "Questions and answers",
    faqSub:
      "Lobby, invite, group and solo matching—and how that ties to Google Play.",
    reviewsHeading: "Reviews",
    reviewsSub: "Short takes—how it feels in real life, not in a slide deck.",
    reviews: [
      {
        quote:
          "We used to waste the night on “you pick.” Now it’s lobby, invite—and we are already matching.",
        name: "Alina",
        role: "friends’ movie nights",
      },
      {
        quote:
          "Just like the store description: less arguing about the film. As a couple we finally watch instead of debating.",
        name: "Max & Katya",
        role: "couple, Google Play",
      },
      {
        quote:
          "Installed from Play, room up in a minute. Perfect for a group.",
        name: "Ilya",
        role: "weekend hangouts",
      },
    ],
    closingHeading: "Ready to tame movie-night chaos?",
    closingBody:
      "On the web—quick start with an account; on Android—the same Movie Match from Google Play: group matching in a lobby or solo pick for a night on your own.",
    closingWeb: "Start in the browser",
    closingWebAria: "Start in the browser: create a Movie Match account",
    closingPlay: "Open on Google Play",
    closingPlayAria: "Open Movie Match on Google Play in a new tab",
    scenarioHeading: "Your scenario",
    scenarioSub:
      "Pick an option—friends, date night, or solo pick when you choose a film alone.",
    scenarioLegend: "Choose how you will use Movie Match",
    scenarioByKey: {
      friends: {
        label: "With friends",
        body: "In a group, sync is the pain: some people DM, others use the main chat. Movie Match centers on one lobby and invite—you lock the crew first, then move into matching, as in the Play description.",
        hint: "Next: create a room in the app and send invites before “I have five more options” takes over.",
      },
      couple: {
        label: "Just the two of you",
        body: "Couples know the “you never pick right” tension. Matching in Movie Match is symmetric: both of you share one flow—less feeling like only one person owns the decision.",
        hint: "Prefer the phone? Open Movie Match on Google Play; prefer the web? Use account creation on this site.",
      },
      solo: {
        label: "Solo",
        body: "You do not always have someone to align with: the app has solo pick—one person runs the flow and chooses a film without a lobby or inviting someone else.",
        hint: "Open Movie Match on Google Play and pick the solo path for tonight; you can always switch to a lobby for a shared watch later.",
      },
    },
  },
  es: {
    googlePlayBadgeTop: "DISPONIBLE EN",
    googlePlayBadgeBottom: "Google Play",
    heroEyebrow: "Movie Match · entretenimiento · Google Play",
    heroTitleBefore: "Una película para esta noche — ",
    heroTitleHighlight: "sin discusiones",
    heroTitleLine2: "con amigos, en pareja o en solitario",
    heroSubtitle:
      "Como en Google Play: sala, invitación y elección en grupo con amigos o pareja—o modo en solitario cuando una persona elige película para la noche sin sala ni segunda persona.",
    ctaCreateAccount: "Crear cuenta (web)",
    ctaCreateAccountAria: "Crear una cuenta de Movie Match en el navegador",
    ctaDownloadPlay: "Descargar en Google Play",
    ctaDownloadPlayAria:
      "Descargar Movie Match en Google Play (se abre en una pestaña nueva)",
    marquee: [
      "Sala",
      "Invitar a un amigo",
      "Elección en solitario",
      "Noche con amigos",
      "Noche en pareja",
      "Drama",
      "Comedia",
      "Thriller",
      "Elección en grupo",
      "Sin discusiones eternas",
      "Como en Google Play",
    ],
    scenarioCardKicker: "Escenario de la app",
    scenarioCardTitle:
      "Sala → invitación → elección en grupo—y además elección en solitario para una noche solo.",
    playBrand: "Play",
    playCardSub: "la app ya está en Google Play (Entretenimiento)",
    playCheck1: "Sala e invitación a un amigo",
    playCheck2: "Elección en grupo sin discusiones eternas",
    playCheck3: "Elección en solitario para tu noche",
    downloadKicker: "Google Play · Entretenimiento",
    downloadTitleBefore: "Descarga ",
    downloadTitleBrand: "Movie Match",
    downloadTitleAfter: " en Google Play",
    downloadBody:
      "Según la ficha oficial: la app ayuda a elegir película con amigos o pareja—sin quedar atrapados en el debate. También hay elección en solitario: una persona puede elegir película para la noche. Sala e invitación son para ver juntos.",
    downloadCardAria:
      "Descargar Movie Match en Google Play. Se abre la ficha en una pestaña nueva.",
    downloadQrCaption: "Escanea el QR con el móvil para abrir Google Play",
    downloadQrAlt: "Código QR: abrir Movie Match en Google Play",
    downloadCardHint: "Se abre la ficha de la app en Google Play",
    downloadLinkAria: "Abrir Movie Match en Google Play en una pestaña nueva",
    downloadLinkText: "Abrir Movie Match en Google Play →",
    featuresHeading: "Juntos o en solitario",
    featuresSub:
      "En la ficha: sala, invitación y elección en grupo—y elección en solitario cuando solo tú eliges la película de la noche.",
    features: [
      {
        title: "Sala e invitación",
        desc: "Como en Google Play: creas una sala, invitas a alguien y pasáis a la elección en grupo—sin caos en el chat. ¿Noche solo? Abre la elección en solitario sin sala.",
        icon: "pi-comment",
        span: "md:col-span-2",
      },
      {
        title: "Amigos, pareja o solitario",
        desc: "Grupo, pareja o tú solo: la app tiene elección en grupo con sala y elección en solitario para la noche sin segunda persona.",
        icon: "pi-users",
        span: "md:col-span-1",
      },
      {
        title: "Menos discusiones",
        desc: "Juntos—llegáis a una película sin hilos interminables. En solitario—acotáis opciones antes y acertáis con el humor del día.",
        icon: "pi-heart",
        span: "md:col-span-1",
      },
      {
        title: "Entretenimiento en Play",
        desc: "Movie Match ya está en Google Play (Entretenimiento)—instálala en el móvil: sala para un grupo o elección en solitario para una noche solo.",
        icon: "pi-android",
        span: "md:col-span-2",
      },
    ],
    guidesHeading: "Guías: elegir película y Movie Match",
    guidesSub:
      "Páginas aparte para búsquedas concretas—sala, pareja, grupo, modo en solitario, Google Play. Todo en una sola app.",
    guidesReadMore: "Leer →",
    guidesAllLink: "Todos los artículos en una página →",
    guidesListAria: "Guías temáticas sobre elegir películas y la app",
    faqHeading: "Preguntas y respuestas",
    faqSub:
      "Sala, invitación, elección en grupo y en solitario—y cómo encaja con Google Play.",
    reviewsHeading: "Reseñas",
    reviewsSub: "En pocas palabras—cómo se siente en la vida real, no en una presentación.",
    reviews: [
      {
        quote:
          "Antes perdíamos la noche en «elige tú». Ahora es sala, invitación—y ya estamos en la elección.",
        name: "Alina",
        role: "noches de cine con amigos",
      },
      {
        quote:
          "Como en la descripción de la tienda: menos pelea por la película. En pareja por fin vemos en vez de discutir.",
        name: "Max y Katya",
        role: "pareja, Google Play",
      },
      {
        quote:
          "Instalamos desde Play, sala lista en un minuto. Ideal para un grupo.",
        name: "Ilia",
        role: "planes de fin de semana",
      },
    ],
    closingHeading: "¿Listo para quitar el caos al elegir película?",
    closingBody:
      "En la web—arranque rápido con cuenta; en Android—el mismo Movie Match de Google Play: elección en grupo en sala o elección en solitario para una noche solo.",
    closingWeb: "Empezar en el navegador",
    closingWebAria: "Empezar en el navegador: crear cuenta de Movie Match",
    closingPlay: "Abrir en Google Play",
    closingPlayAria: "Abrir Movie Match en Google Play en una pestaña nueva",
    scenarioHeading: "Tu escenario",
    scenarioSub:
      "Elige una opción—noche con amigos, en pareja o elección en solitario cuando eliges película tú solo.",
    scenarioLegend: "Elige cómo vas a usar Movie Match",
    scenarioByKey: {
      friends: {
        label: "Con amigos",
        body: "En grupo lo peor es la sincronía: unos escriben en privado, otros en el chat general. Movie Match gira en torno a una sala e invitación—primero cerráis el grupo y luego pasáis a la elección, como en la ficha de Play.",
        hint: "Siguiente: crea sala en la app y manda invitaciones antes de que aparezcan «cinco opciones más».",
      },
      couple: {
        label: "En pareja",
        body: "En pareja suele doler el «otra vez no acertaste». La elección en Movie Match es simétrica: los dos compartís un flujo—menos sensación de que solo uno decide.",
        hint: "¿Móvil primero? La ficha de Movie Match en Google Play; ¿navegador? El botón de crear cuenta en este sitio.",
      },
      solo: {
        label: "En solitario",
        body: "No siempre hay con quién cuadrar la noche: la app tiene elección en solitario—una persona hace el flujo y elige película sin sala ni invitar a nadie más.",
        hint: "Abre Movie Match en Google Play y elige el camino en solitario para hoy; siempre podrás pasar a una sala para ver juntos después.",
      },
    },
  },
};

export function getLandingCopy(lang: SupportedLocale): LandingCopy {
  return landingCopy[lang];
}
