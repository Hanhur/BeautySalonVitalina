
// // import { translations } from "./translations.js";

// // // Функция для плавного изменения языка
// // async function changeLanguage(lang) {
// //     // Добавляем класс для плавного исчезновения
// //     document.body.classList.add('language-changing');

// //     // Ждем завершения анимации
// //     await new Promise(resolve => setTimeout(resolve, 300));

// //     // Обновляем контент
// //     updateContent(lang);

// //     // Удаляем класс для появления нового контента
// //     document.body.classList.remove('language-changing');

// //     // Сохраняем выбранный язык
// //     localStorage.setItem('selectedLanguage', lang);
// // }

// // // Функция обновления контента
// // function updateContent(lang) {
// //     // Обновляем тексты с атрибутом data-i18n
// //     document.querySelectorAll('[data]').forEach(el => {
// //         const key = el.getAttribute('data');
// //         if (translations[lang] && translations[lang][key]) {
// //             el.textContent = translations[lang][key];
// //         }
// //     });

// //     // Обновляем выбранный язык в селекторе
// //     const select = document.getElementById('language-select');
// //     if (select) select.value = lang;
// // }

// // // Инициализация при загрузке страницы
// // document.addEventListener('DOMContentLoaded', () => {
// //     // Устанавливаем обработчик для селектора языка
// //     const languageSelect = document.getElementById('language-select');
// //     if (languageSelect) {
// //         languageSelect.addEventListener('change', (e) => {
// //             changeLanguage(e.target.value);
// //         });
// //     }

// //     // Восстанавливаем сохраненный язык или используем язык по умолчанию
// //     const savedLang = localStorage.getItem('selectedLanguage') || 'en';
// //     changeLanguage(savedLang);
// // });

// const translations = {
//     en: {
//         home: "Home",
//         about: "About Us",
//         services: "Services",
//         contact: "Contact Us",
//         login: "Login",
//         signup: "Signup",
//         serviceNameLabel: "Service Name",
//         addressLabel: "Address",
//         search: "Search",
//         subscribeTitle: "Subscribe to newsletter",
//         subscribeText: "Sign up for our newsletter to stay up-to-date on the latest promotions, discounts, and new features releases.",
//         newsletterPlaceholder: "Enter your mail",
//         newsletterButton: "Subscribe",
//         bookNow: "BOOK NOW",
//         followTitle: "Follow our Instagram",
//     },
//     ua: {
//         home: "Головна",
//         about: "Про нас",
//         services: "Послуги",
//         contact: "Контакти",
//         login: "Увійти",
//         signup: "Реєстрація",
//         serviceNameLabel: "Назва послуги",
//         addressLabel: "Адреса",
//         search: "Пошук",
//         subscribeTitle: "Підписка на розсилку",
//         subscribeText: "Підпишіться, щоб бути в курсі акцій, знижок та оновлень.",
//         newsletterPlaceholder: "Введіть електронну пошту",
//         newsletterButton: "Підписатися",
//         bookNow: "ЗАПИСАТИСЯ",
//         followTitle: "Наш Instagram",
//     },
//     cz: {
//         home: "Domů",
//         about: "O nás",
//         services: "Služby",
//         contact: "Kontakt",
//         login: "Přihlásit se",
//         signup: "Registrovat se",
//         serviceNameLabel: "Název služby",
//         addressLabel: "Adresa",
//         search: "Hledat",
//         subscribeTitle: "Přihlásit se k odběru",
//         subscribeText: "Přihlaste se a získejte informace o akcích, slevách a novinkách.",
//         newsletterPlaceholder: "Zadejte e-mail",
//         newsletterButton: "Odebírat",
//         bookNow: "REZERVOVAT",
//         followTitle: "Sledujte nás na Instagramu",
//     },
// };

// function translatePage(lang) {
//     const t = translations[lang];

//     document.querySelectorAll("[data]").forEach(el => {
//         const key = el.getAttribute("data");
//         if (t[key]) el.textContent = t[key];
//     });

//     const serviceInput = document.querySelector(".name-input");
//     const addressInput = document.querySelector(".address-input");
//     const newsletterInput = document.querySelector(".newsletter-input");
//     const newsletterBtn = document.querySelector(".newsletter-btn");

//     if (serviceInput) serviceInput.placeholder = t.serviceNameLabel;
//     if (addressInput) addressInput.placeholder = t.addressLabel;
//     if (newsletterInput) newsletterInput.placeholder = t.newsletterPlaceholder;
//     if (newsletterBtn) newsletterBtn.textContent = t.newsletterButton;

//     const newsletterTitle = document.querySelector(".newsletter-title");
//     const newsletterText = document.querySelector(".newsletter-text");
//     if (newsletterTitle) newsletterTitle.textContent = t.subscribeTitle;
//     if (newsletterText) newsletterText.textContent = t.subscribeText;

//     const bookNowButtons = document.querySelectorAll(".recommended-btn");
//     bookNowButtons.forEach(btn => btn.textContent = t.bookNow);

//     const followTitle = document.querySelector(".follow-title");
//     if (followTitle) followTitle.textContent = t.followTitle;
// }

// // Слушаем изменение языка из селекта
// document.addEventListener("DOMContentLoaded", () => {
//     const langSelect = document.getElementById("language-select");
//     translatePage(langSelect.value); // Начальный перевод

//     langSelect.addEventListener("change", () => {
//         const selectedLang = langSelect.value;
//         translatePage(selectedLang);
//     });
// });

// language-switcher.js

const translations = {
  en: {
    home: "Home",
    about: "About Us",
    services: "Services",
    contact: "Contact Us",
    login: "Login",
    signup: "Signup",
    serviceNameLabel: "Service Name",
    addressLabel: "Address",
    servicePlaceholder: "Book your services...",
    addressPlaceholder: "Where",
    search: "Search",
    subscribeTitle: "Subscribe to newsletter",
    subscribeText: "Sign up for our newsletter to stay up-to-date on the latest promotions, discounts, and new features releases.",
    newsletterPlaceholder: "Enter your mail",
    newsletterButton: "Subscribe",
    bookNow: "BOOK NOW",
    followTitle: "Follow our Instagram",
    recommended: "Recommended",
    ourServices: "Our Services",
    beautyTitle: "We are Experienced in making you very Beautiful",
    beautyText: "Lorem ipsum dolor sit amet consectetur. Eu quis enim tempor et proin neque.",
    eleganceTitle: "Elegance comes from being as beautiful inside as outside",
    eleganceText: "Eleifend arcu non lorem justo in tempus purus gravida. Est tortor egestas sed feugiat elementum. Viverra nulla amet a ultrices massa dui. Tortor est purus morbi vitae arcu suspendisse amet."
  },
  ua: {
    home: "Головна",
    about: "Про нас",
    services: "Послуги",
    contact: "Контакти",
    login: "Увійти",
    signup: "Реєстрація",
    serviceNameLabel: "Назва послуги",
    addressLabel: "Адреса",
    servicePlaceholder: "Забронюйте послугу...",
    addressPlaceholder: "Де саме",
    search: "Пошук",
    subscribeTitle: "Підписка на розсилку",
    subscribeText: "Підпишіться, щоб отримувати останні акції, знижки та новини.",
    newsletterPlaceholder: "Введіть вашу пошту",
    newsletterButton: "Підписатися",
    bookNow: "ЗАПИСАТИСЯ",
    followTitle: "Наш Instagram",
    recommended: "Рекомендовано",
    ourServices: "Наші послуги",
    beautyTitle: "Ми знаємо, як зробити вас красивими",
    beautyText: "Lorem ipsum dolor sit amet consectetur. Eu quis enim tempor et proin neque.",
    eleganceTitle: "Елегантність — це краса душі та зовнішності",
    eleganceText: "Eleifend arcu non lorem justo in tempus purus gravida. Est tortor egestas sed feugiat elementum. Viverra nulla amet a ultrices massa dui. Tortor est purus morbi vitae arcu suspendisse amet."
  },
  cz: {
    home: "Domů",
    about: "O nás",
    services: "Služby",
    contact: "Kontakt",
    login: "Přihlásit se",
    signup: "Registrovat se",
    serviceNameLabel: "Název služby",
    addressLabel: "Adresa",
    servicePlaceholder: "Zarezervujte si služby...",
    addressPlaceholder: "Kde",
    search: "Hledat",
    subscribeTitle: "Přihlásit se k odběru",
    subscribeText: "Přihlaste se k odběru a získejte novinky o akcích a slevách.",
    newsletterPlaceholder: "Zadejte svůj e-mail",
    newsletterButton: "Odebírat",
    bookNow: "REZERVOVAT",
    followTitle: "Sledujte nás na Instagramu",
    recommended: "Doporučeno",
    ourServices: "Naše služby",
    beautyTitle: "Máme zkušenosti, jak vás učinit krásnými",
    beautyText: "Lorem ipsum dolor sit amet consectetur. Eu quis enim tempor et proin neque.",
    eleganceTitle: "Elegance znamená být krásný uvnitř i navenek",
    eleganceText: "Eleifend arcu non lorem justo in tempus purus gravida. Est tortor egestas sed feugiat elementum. Viverra nulla amet a ultrices massa dui. Tortor est purus morbi vitae arcu suspendisse amet."
  }
};

function translatePage(lang) {
  const t = translations[lang];
  if (!t) return;

  const map = {
    home: '[data="home"]',
    about: '[data="about"]',
    services: '[data="services"]',
    contact: '[data="contact"]',
    login: '.login',
    signup: '.signup',
    serviceNameLabel: '.name-label',
    addressLabel: '.address-label',
    servicePlaceholder: '.name-input',
    addressPlaceholder: '.address-input',
    search: '.search-text',
    subscribeTitle: '.newsletter-title',
    subscribeText: '.newsletter-text',
    newsletterPlaceholder: '.newsletter-input',
    newsletterButton: '.newsletter-btn',
    bookNow: '.recommended-btn',
    followTitle: '.follow-title',
    recommended: '.recommended-title',
    ourServices: '.recommended_text',
    beautyTitle: '.beautiful-title',
    beautyText: '.beautiful-text',
    eleganceTitle: '.elegance-title',
    eleganceText: '.elegance-text'
  };

  for (const key in map) {
    const el = document.querySelectorAll(map[key]);
    el.forEach(item => {
      if (key.includes('Placeholder')) {
        item.placeholder = t[key];
      } else if (item.tagName === 'INPUT' || item.tagName === 'TEXTAREA') {
        item.value = t[key];
      } else {
        item.textContent = t[key];
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('language-select');
  translatePage(langSelect.value);
  langSelect.addEventListener('change', () => translatePage(langSelect.value));
});
