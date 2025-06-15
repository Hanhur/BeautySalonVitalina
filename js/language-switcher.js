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
