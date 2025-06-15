// Extend the translations object from language-switcher.js
const aboutTranslations = {
    en: {
        shortStory: "SHORT STORY ABOUT US",
        bigStory: "The big story behind, our beautyness center",
        contactUs: "CONTACT US",
        aboutUs: "About Us",
        bridgeTitle: "It's the bridge between service companies and consumers.",
        bridgeText: "ServiceMarket.dk is a Copenhagen-based technology company known for our overview platform. Our aim is to simplify and improve everyday life for citizens in Denmark. One platform that brings together all services in an easy and controlled environment.",
        whatIncludes: "What Includes?",
        journeyStart: "The start of the journey",
        journeyText: "ServiceMarket.dk was founded in 2021 by two young entrepreneurs who saw a problem with the fragmented service industry in Denmark. There were thousands of small businesses offering services, but it was difficult for consumers to find them and know which ones to choose. They developed the idea of creating a platform that would bring all these service providers together in one place, making it easier for consumers to find what they need and get their issues resolved quickly and easily. Without having to go to many different websites, each with their own booking system.",
        methodology: "Our Methodology:",
        assessmentStage: "The Assessment Stage",
        assessmentText: "The point of using Lorem Ipsum is that it has a more-or-less normal letters.",
        initialisationStage: "The Initialisation Stage",
        treatmentStage: "The Treatment Stage",
        stylesTitle: "Styles from the city, service from out of this world",
        stylesText: "Lorem ipsum dolor sit amet consectetur. Blandit at maecenas dui sed amet sit enim vitae. Amet purus dictum urna sagittis dignissim. At fermentum nisl ullamcorper orci. Pellentesque id tempor lacus aliquet tempus vitae nibh habitasse consectetur.",
        learnMore: "Learn more",
        ourTeam: "Our Team",
        meetProfessionals: "Meet our professionals",
        hairdresser: "Hairdresser",
        ourBlog: "Our Blog",
        latestNews: "Latest news",
        readMore: "Read more"
    },
    ua: {
        shortStory: "КОРОТКА ІСТОРІЯ ПРО НАС",
        bigStory: "Велика історія, що стоїть за нашим центром краси",
        contactUs: "ЗВ'ЯЗАТИСЯ",
        aboutUs: "Про нас",
        bridgeTitle: "Це міст між сервісними компаніями та споживачами.",
        bridgeText: "ServiceMarket.dk - це технологічна компанія з Копенгагена, відома нашою платформою огляду. Наша мета - спростити та покращити повсякденне життя громадян Данії. Одна платформа, яка об'єднує всі послуги в простому та контрольованому середовищі.",
        whatIncludes: "Що включає?",
        journeyStart: "Початок подорожі",
        journeyText: "ServiceMarket.dk був заснований у 2021 році двома молодими підприємцями, які побачили проблему з фрагментованою сервісною індустрією в Данії. Були тисячі малих підприємств, які пропонували послуги, але споживачам було важко їх знайти та вибрати. Вони розробили ідею створення платформи, яка об'єднала б усіх цих постачальників послуг в одному місці, що дозволило споживачам швидко та легко знаходити те, що їм потрібно.",
        methodology: "Наша методологія:",
        assessmentStage: "Етап оцінки",
        assessmentText: "Сенс використання Lorem Ipsum полягає в тому, що він має більш-менш нормальний розподіл літер.",
        initialisationStage: "Етап ініціалізації",
        treatmentStage: "Етап лікування",
        stylesTitle: "Стилі з міста, сервіс не з цього світу",
        stylesText: "Lorem ipsum dolor sit amet consectetur. Blandit at maecenas dui sed amet sit enim vitae. Amet purus dictum urna sagittis dignissim. At fermentum nisl ullamcorper orci. Pellentesque id tempor lacus aliquet tempus vitae nibh habitasse consectetur.",
        learnMore: "Дізнатися більше",
        ourTeam: "Наша команда",
        meetProfessionals: "Зустрічайте наших професіоналів",
        hairdresser: "Перукар",
        ourBlog: "Наш блог",
        latestNews: "Останні новини",
        readMore: "Читати далі"
    },
    cz: {
        shortStory: "KRÁTKÝ PŘÍBĚH O NÁS",
        bigStory: "Velký příběh za naším centrem krásy",
        contactUs: "KONTAKTUJTE NÁS",
        aboutUs: "O nás",
        bridgeTitle: "Je to most mezi servisními společnostmi a spotřebiteli.",
        bridgeText: "ServiceMarket.dk je technologická společnost se sídlem v Kodani, známá svou přehledovou platformou. Naším cílem je zjednodušit a zlepšit každodenní život občanů Dánska. Jedna platforma, která spojuje všechny služby v jednoduchém a kontrolovaném prostředí.",
        whatIncludes: "Co zahrnuje?",
        journeyStart: "Začátek cesty",
        journeyText: "ServiceMarket.dk byl založen v roce 2021 dvěma mladými podnikateli, kteří viděli problém s fragmentovaným servisním průmyslem v Dánsku. Existovaly tisíce malých podniků nabízejících služby, ale pro spotřebitele bylo obtížné je najít a vědět, které si vybrat. Vyvinuli myšlenku vytvoření platformy, která by všechny tyto poskytovatele služeb spojila na jednom místě, což by spotřebitelům usnadnilo najít to, co potřebují, a rychle a snadno vyřešit své problémy.",
        methodology: "Naše metodologie:",
        assessmentStage: "Fáze hodnocení",
        assessmentText: "Smyslem použití Lorem Ipsum je, že má více-méně normální rozložení písmen.",
        initialisationStage: "Inicializační fáze",
        treatmentStage: "Léčebná fáze",
        stylesTitle: "Styly z města, služba jako z jiného světa",
        stylesText: "Lorem ipsum dolor sit amet consectetur. Blandit at maecenas dui sed amet sit enim vitae. Amet purus dictum urna sagittis dignissim. At fermentum nisl ullamcorper orci. Pellentesque id tempor lacus aliquet tempus vitae nibh habitasse consectetur.",
        learnMore: "Zjistit více",
        ourTeam: "Náš tým",
        meetProfessionals: "Poznejte naše profesionály",
        hairdresser: "Kadeřník",
        ourBlog: "Náš blog",
        latestNews: "Nejnovější zprávy",
        readMore: "Číst více"
    }
};

// Extend the setLanguage function for about page specific content
function setAboutPageLanguage(lang) {
    const langData = aboutTranslations[lang];
    
    // Update about section
    document.querySelector('.about-text').textContent = langData.shortStory;
    document.querySelector('.about-title').textContent = langData.bigStory;
    document.querySelector('.about-btn').textContent = langData.contactUs;
    
    // Update consumers section
    document.querySelector('.consumers_text').textContent = langData.aboutUs;
    document.querySelector('.consumers-title').textContent = langData.bridgeTitle;
    document.querySelector('.consumers-text').textContent = langData.bridgeText;
    
    // Update start section
    document.querySelector('.start_text').textContent = langData.whatIncludes;
    document.querySelector('.start-title').textContent = langData.journeyStart;
    document.querySelector('.start-text').textContent = langData.journeyText;
    document.querySelector('.methodology-title').textContent = langData.methodology;
    document.querySelectorAll('.assessment-title')[0].textContent = langData.assessmentStage;
    document.querySelectorAll('.assessment-text')[0].textContent = langData.assessmentText;
    document.querySelectorAll('.assessment-title')[1].textContent = langData.initialisationStage;
    document.querySelectorAll('.assessment-text')[1].textContent = langData.assessmentText;
    document.querySelectorAll('.assessment-title')[2].textContent = langData.treatmentStage;
    document.querySelectorAll('.assessment-text')[2].textContent = langData.assessmentText;
    
    // Update styles section
    document.querySelector('.styles-title').textContent = langData.stylesTitle;
    document.querySelector('.styles-text').textContent = langData.stylesText;
    document.querySelector('.styles-btn').textContent = langData.learnMore;
    
    // Update team section
    document.querySelector('.team-title').textContent = langData.ourTeam;
    document.querySelector('.team-text').textContent = langData.meetProfessionals;
    document.querySelectorAll('.team_text').forEach(el => {
        el.textContent = langData.hairdresser;
    });
    
    // Update blog section
    document.querySelector('.blog-title').textContent = langData.ourBlog;
    document.querySelector('.blog-text').textContent = langData.latestNews;
    document.querySelectorAll('.blog-read_link').forEach(el => {
        el.textContent = langData.readMore;
    });
}

// Override or extend the setLanguage function from language-switcher.js
const originalSetLanguage = window.setLanguage;
window.setLanguage = function(lang) {
    originalSetLanguage(lang); // Call the original function
    setAboutPageLanguage(lang); // Call our about page specific function
};

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setAboutPageLanguage(savedLang);
});