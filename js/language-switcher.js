// // Language data object containing translations for all elements
import { translations } from "./translations.js";

// Function to change language
function changeLanguage(lang) {
    // Set the selected language in localStorage
    localStorage.setItem('selectedLanguage', lang);

    // Update the language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = lang;
    }

    // Get all elements with data attributes
    const elements = document.querySelectorAll('[data]');

    // Update each element's text content
    elements.forEach(element => {
        const key = element.getAttribute('data');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update common elements that don't have data attributes
    updateCommonElements(lang);

    // Page-specific updates
    if (document.querySelector('.section-service')) {
        updateIndexPage(lang);
    }

    if (document.querySelector('.section-about')) {
        updateAboutPage(lang);
    }

    if (document.querySelector('.section-services')) {
        updateServicesPage(lang);
    }

    if (document.querySelector('.section-contact')) {
        updateContactPage(lang);
    }
}

// Update common elements across all pages
function updateCommonElements(lang) {
    // Update login/signup links if they exist
    const loginLinks = document.querySelectorAll('.login');
    if (loginLinks.length > 0 && translations[lang] && translations[lang]['login']) {
        loginLinks.forEach(link => {
            link.textContent = translations[lang]['login'];
        });
    }

    const signupLinks = document.querySelectorAll('.signup');
    if (signupLinks.length > 0 && translations[lang] && translations[lang]['signup']) {
        signupLinks.forEach(link => {
            link.textContent = translations[lang]['signup'];
        });
    }

    // Update footer elements
    const exploreTitles = document.querySelectorAll('.item-1 .footer-title');
    if (exploreTitles.length > 0 && translations[lang] && translations[lang]['explore']) {
        exploreTitles.forEach(title => {
            title.textContent = translations[lang]['explore'];
        });
    }

    const utilityTitles = document.querySelectorAll('.item-2 .footer-title');
    if (utilityTitles.length > 0 && translations[lang] && translations[lang]['utility']) {
        utilityTitles.forEach(title => {
            title.textContent = translations[lang]['utility'];
        });
    }

    const keepInTouchTitles = document.querySelectorAll('.item-3 .footer-title');
    if (keepInTouchTitles.length > 0 && translations[lang] && translations[lang]['keep-in-touch']) {
        keepInTouchTitles.forEach(title => {
            title.textContent = translations[lang]['keep-in-touch'];
        });
    }

    const privacyLinks = document.querySelectorAll('.item-2 .footer-block_list li:nth-child(1) .footer-block_link');
    if (privacyLinks.length > 0 && translations[lang] && translations[lang]['privacy']) {
        privacyLinks.forEach(link => {
            link.textContent = translations[lang]['privacy'];
        });
    }

    const termsLinks = document.querySelectorAll('.item-2 .footer-block_list li:nth-child(2) .footer-block_link');
    if (termsLinks.length > 0 && translations[lang] && translations[lang]['terms']) {
        termsLinks.forEach(link => {
            link.textContent = translations[lang]['terms'];
        });
    }

    const addressSpans = document.querySelectorAll('.address-span');
    if (addressSpans.length > 0 && translations[lang] && translations[lang]['address']) {
        addressSpans.forEach(span => {
            span.textContent = translations[lang]['address'];
        });
    }

    const mailSpans = document.querySelectorAll('.footer-address_item:nth-child(2) .address-span');
    if (mailSpans.length > 0 && translations[lang] && translations[lang]['mail']) {
        mailSpans.forEach(span => {
            span.textContent = translations[lang]['mail'];
        });
    }

    const phoneSpans = document.querySelectorAll('.footer-address_item:nth-child(3) .address-span');
    if (phoneSpans.length > 0 && translations[lang] && translations[lang]['phone']) {
        phoneSpans.forEach(span => {
            span.textContent = translations[lang]['phone'];
        });
    }

    // Update read more links
    const readMoreLinks = document.querySelectorAll('.blog-read_link, .prices_link');
    if (readMoreLinks.length > 0 && translations[lang]) {
        const readMoreText = translations[lang]['read-more'] || 'Read more';
        const viewAllText = translations[lang]['view-all'] || 'View all';

        readMoreLinks.forEach(link => {
            if (link.classList.contains('prices_link')) {
                link.textContent = viewAllText;
            }
            else {
                const textNode = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = readMoreText;
                }
            }
        });
    }

    // Update send message buttons
    const sendMessageBtns = document.querySelectorAll('.book-btn');
    if (sendMessageBtns.length > 0 && translations[lang] && translations[lang]['send-message']) {
        sendMessageBtns.forEach(btn => {
            btn.textContent = translations[lang]['send-message'];
        });
    }
}

// Update index page specific elements
function updateIndexPage(lang) {
    const serviceText = document.querySelector('.box-text');
    if (serviceText && translations[lang] && translations[lang]['service-text']) {
        serviceText.textContent = translations[lang]['service-text'];
    }

    const serviceTitle = document.querySelector('.block-title');
    if (serviceTitle && translations[lang] && translations[lang]['service-title']) {
        serviceTitle.textContent = translations[lang]['service-title'];
    }

    const serviceDescription = document.querySelector('.block-text');
    if (serviceDescription && translations[lang] && translations[lang]['service-description']) {
        serviceDescription.textContent = translations[lang]['service-description'];
    }

    const serviceNameLabel = document.querySelector('.name-label');
    if (serviceNameLabel && translations[lang] && translations[lang]['service-name']) {
        serviceNameLabel.textContent = translations[lang]['service-name'];
    }

    const serviceNameInput = document.querySelector('.name-input');
    if (serviceNameInput && translations[lang] && translations[lang]['service-placeholder']) {
        serviceNameInput.placeholder = translations[lang]['service-placeholder'];
    }

    const addressLabel = document.querySelector('.address-label');
    if (addressLabel && translations[lang] && translations[lang]['address-label']) {
        addressLabel.textContent = translations[lang]['address-label'];
    }

    const addressInput = document.querySelector('.address-input');
    if (addressInput && translations[lang] && translations[lang]['where']) {
        addressInput.placeholder = translations[lang]['where'];
    }

    const searchText = document.querySelector('.search-text');
    if (searchText && translations[lang] && translations[lang]['search']) {
        searchText.textContent = translations[lang]['search'];
    }

    // Update procedure items
    const procedureItems = document.querySelectorAll('.block_text');
    if (procedureItems.length > 0 && translations[lang]) {
        const procedureKeys = [
            'procedure-makeup',
            'procedure-wellness',
            'procedure-barber',
            'procedure-hair',
            'procedure-massage',
            'procedure-podiatrist'
        ];

        procedureItems.forEach((item, index) => {
            if (procedureKeys[index] && translations[lang][procedureKeys[index]]) {
                item.textContent = translations[lang][procedureKeys[index]];
            }
        });
    }

    // Update beautiful section
    const beautifulTitle = document.querySelector('.beautiful-title');
    if (beautifulTitle && translations[lang] && translations[lang]['beautiful-title']) {
        beautifulTitle.textContent = translations[lang]['beautiful-title'];
    }

    const beautifulText = document.querySelector('.beautiful-text');
    if (beautifulText && translations[lang] && translations[lang]['beautiful-text']) {
        beautifulText.textContent = translations[lang]['beautiful-text'];
    }

    // Update recommended section
    const recommendedText = document.querySelector('.recommended_text');
    if (recommendedText && translations[lang] && translations[lang]['our-services']) {
        recommendedText.textContent = translations[lang]['our-services'];
    }

    const recommendedTitle = document.querySelector('.recommended-title');
    if (recommendedTitle && translations[lang] && translations[lang]['recommended']) {
        recommendedTitle.textContent = translations[lang]['recommended'];
    }

    const recommendedDescription = document.querySelector('.recommended-text');
    if (recommendedDescription && translations[lang] && translations[lang]['beautiful-text']) {
        recommendedDescription.textContent = translations[lang]['beautiful-text'];
    }

    // Update elegance section
    const eleganceTitle = document.querySelector('.elegance-title');
    if (eleganceTitle && translations[lang] && translations[lang]['elegance-title']) {
        eleganceTitle.textContent = translations[lang]['elegance-title'];
    }

    const eleganceText = document.querySelector('.elegance-text');
    if (eleganceText && translations[lang] && translations[lang]['elegance-text']) {
        eleganceText.textContent = translations[lang]['elegance-text'];
    }

    // Update services list
    const servicesItems = document.querySelectorAll('.elegance_text');
    if (servicesItems.length > 0 && translations[lang]) {
        const servicesKeys = [
            'makeup',
            'hair-styling',
            'nail-care',
            'cosmetology'
        ];

        servicesItems.forEach((item, index) => {
            if (servicesKeys[index] && translations[lang][servicesKeys[index]]) {
                item.textContent = translations[lang][servicesKeys[index]];
            }
        });
    }

    // Update newsletter section
    const newsletterTitle = document.querySelector('.newsletter-title');
    if (newsletterTitle && translations[lang] && translations[lang]['newsletter-title']) {
        newsletterTitle.textContent = translations[lang]['newsletter-title'];
    }

    const newsletterText = document.querySelector('.newsletter-text');
    if (newsletterText && translations[lang] && translations[lang]['newsletter-text']) {
        newsletterText.textContent = translations[lang]['newsletter-text'];
    }

    const newsletterInput = document.querySelector('.newsletter-input');
    if (newsletterInput && translations[lang] && translations[lang]['enter-mail']) {
        newsletterInput.placeholder = translations[lang]['enter-mail'];
    }

    const newsletterButton = document.querySelector('.newsletter-btn');
    if (newsletterButton && translations[lang] && translations[lang]['subscribe']) {
        newsletterButton.textContent = translations[lang]['subscribe'];
    }

    // Update follow section
    const followTitle = document.querySelector('.follow-title');
    if (followTitle && translations[lang] && translations[lang]['follow-title']) {
        followTitle.textContent = translations[lang]['follow-title'];
    }

    const followText = document.querySelector('.follow-text');
    if (followText && translations[lang] && translations[lang]['follow-text']) {
        followText.textContent = translations[lang]['follow-text'];
    }
}

// Update about page specific elements
function updateAboutPage(lang) {
    const aboutText = document.querySelector('.about-text');
    if (aboutText && translations[lang] && translations[lang]['short-story']) {
        aboutText.textContent = translations[lang]['short-story'];
    }

    const aboutTitle = document.querySelector('.about-title');
    if (aboutTitle && translations[lang] && translations[lang]['big-story']) {
        aboutTitle.textContent = translations[lang]['big-story'];
    }

    const aboutBtn = document.querySelector('.about-btn');
    if (aboutBtn && translations[lang] && translations[lang]['contact-us']) {
        aboutBtn.textContent = translations[lang]['contact-us'];
    }

    const aboutUs = document.querySelector('.consumers_text');
    if (aboutUs && translations[lang] && translations[lang]['about-us']) {
        aboutUs.textContent = translations[lang]['about-us'];
    }

    const bridgeText = document.querySelector('.consumers-title');
    if (bridgeText && translations[lang] && translations[lang]['bridge-text']) {
        bridgeText.textContent = translations[lang]['bridge-text'];
    }

    const serviceMarketDesc = document.querySelector('.consumers-text');
    if (serviceMarketDesc && translations[lang] && translations[lang]['service-market-desc']) {
        serviceMarketDesc.textContent = translations[lang]['service-market-desc'];
    }

    const whatIncludes = document.querySelector('.start_text');
    if (whatIncludes && translations[lang] && translations[lang]['what-includes']) {
        whatIncludes.textContent = translations[lang]['what-includes'];
    }

    const journeyStart = document.querySelector('.start-title');
    if (journeyStart && translations[lang] && translations[lang]['journey-start']) {
        journeyStart.textContent = translations[lang]['journey-start'];
    }

    const serviceMarketHistory = document.querySelector('.start-text');
    if (serviceMarketHistory && translations[lang] && translations[lang]['service-market-history']) {
        serviceMarketHistory.textContent = translations[lang]['service-market-history'];
    }

    const ourMethodology = document.querySelector('.methodology-title');
    if (ourMethodology && translations[lang] && translations[lang]['our-methodology']) {
        ourMethodology.textContent = translations[lang]['our-methodology'];
    }

    const assessmentTitles = document.querySelectorAll('.assessment-title');
    if (assessmentTitles.length > 0 && translations[lang]) {
        const assessmentKeys = [
            'assessment-stage',
            'initialisation-stage',
            'treatment-stage'
        ];

        assessmentTitles.forEach((title, index) => {
            if (assessmentKeys[index] && translations[lang][assessmentKeys[index]]) {
                title.textContent = translations[lang][assessmentKeys[index]];
            }
        });
    }

    const assessmentTexts = document.querySelectorAll('.assessment-text');
    if (assessmentTexts.length > 0 && translations[lang] && translations[lang]['assessment-text']) {
        assessmentTexts.forEach(text => {
            text.textContent = translations[lang]['assessment-text'];
        });
    }

    const stylesTitle = document.querySelector('.styles-title');
    if (stylesTitle && translations[lang] && translations[lang]['styles-title']) {
        stylesTitle.textContent = translations[lang]['styles-title'];
    }

    const stylesText = document.querySelector('.styles-text');
    if (stylesText && translations[lang] && translations[lang]['styles-text']) {
        stylesText.textContent = translations[lang]['styles-text'];
    }

    const learnMoreLinks = document.querySelectorAll('.styles-btn');
    if (learnMoreLinks.length > 0 && translations[lang] && translations[lang]['learn-more']) {
        learnMoreLinks.forEach(link => {
            link.textContent = translations[lang]['learn-more'];
        });
    }

    const ourTeam = document.querySelector('.team-title');
    if (ourTeam && translations[lang] && translations[lang]['our-team']) {
        ourTeam.textContent = translations[lang]['our-team'];
    }

    const meetProfessionals = document.querySelector('.team-text');
    if (meetProfessionals && translations[lang] && translations[lang]['meet-professionals']) {
        meetProfessionals.textContent = translations[lang]['meet-professionals'];
    }

    // Update team items
    const teamItems = document.querySelectorAll('.team_title');
    if (teamItems.length > 0 && translations[lang]) {
        const teamKeys = [
            "team-marianna",
            "team-tiffany",
            "team-brianna",
            "team-jaqueline",
            "team-wanda",
            "team-cameron",
        ];

        teamItems.forEach((item, index) => {
            if (teamKeys[index] && translations[lang][teamKeys[index]]) {
                item.textContent = translations[lang][teamKeys[index]];
            }
        });
    }

    const teamJobs = document.querySelectorAll('.team_text');
    if (teamJobs.length > 0 && translations[lang] && translations[lang]['hairdresser']) {
        teamJobs.forEach(job => {
            job.textContent = translations[lang]['hairdresser'];
        });
    }

    const ourBlog = document.querySelector('.blog-title');
    if (ourBlog && translations[lang] && translations[lang]['our-blog']) {
        ourBlog.textContent = translations[lang]['our-blog'];
    }

    const latestNews = document.querySelector('.blog-text');
    if (latestNews && translations[lang] && translations[lang]['latest-news']) {
        latestNews.textContent = translations[lang]['latest-news'];
    }

    // Update blog items
    const blogItems = document.querySelectorAll('.blog_link');
    if (blogItems.length > 0 && translations[lang]) {
        const blogKeys = [
            "blog-sap",
            "blog-nail",
            "blog-makeup",
            "blog-casmetology",
        ];

        blogItems.forEach((item, index) => {
            if (blogKeys[index] && translations[lang][blogKeys[index]]) {
                item.textContent = translations[lang][blogKeys[index]];
            }
        });
    }

    const readMoreLinks = document.querySelectorAll('.blog-read_link');
    if (readMoreLinks.length > 0 && translations[lang] && translations[lang]['read-more']) {
        readMoreLinks.forEach(link => {
            link.textContent = translations[lang]['read-more'];
        });
    }
}

// Update services page specific elements
function updateServicesPage(lang) {
    const servicesPrices = document.querySelector('.services-title');
    if (servicesPrices && translations[lang] && translations[lang]['services-prices']) {
        servicesPrices.textContent = translations[lang]['services-prices'];
    }

    const servicesDescription = document.querySelector('.services-text');
    if (servicesDescription && translations[lang] && translations[lang]['services-description']) {
        servicesDescription.textContent = translations[lang]['services-description'];
    }

    const treatmentsPrices = document.querySelector('.prices-title');
    if (treatmentsPrices && translations[lang] && translations[lang]['treatments-prices']) {
        treatmentsPrices.textContent = translations[lang]['treatments-prices'];
    }

    const pricesDescription = document.querySelector('.prices-text');
    if (pricesDescription && translations[lang] && translations[lang]['prices-description']) {
        pricesDescription.textContent = translations[lang]['prices-description'];
    }

    // Update team items
    const pricesItems = document.querySelectorAll('.prices_title');
    if (pricesItems.length > 0 && translations[lang]) {
        const pricesKeys = [
            "make-up",
            "hair-styling",
            "nail-care",
            "cosmetology",
            "spa-procedures",
        ];

        pricesItems.forEach((item, index) => {
            if (pricesKeys[index] && translations[lang][pricesKeys[index]]) {
                item.textContent = translations[lang][pricesKeys[index]];
            }
        });
    }

    const makeUpDesc = document.querySelector('.prices_text');
    if (makeUpDesc && translations[lang] && translations[lang]['make-up-desc']) {
        makeUpDesc.textContent = translations[lang]['make-up-desc'];
    }

    const elements = document.querySelectorAll('[data]');
    elements.forEach(el => {
        const key = el.getAttribute('data');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });


    const beautySalon = document.querySelector('.book_text');
    if (beautySalon && translations[lang] && translations[lang]['beauty-salon']) {
        beautySalon.textContent = translations[lang]['beauty-salon'];
    }

    const bookAppointment = document.querySelector('.book-title');
    if (bookAppointment && translations[lang] && translations[lang]['book-appointment']) {
        bookAppointment.textContent = translations[lang]['book-appointment'];
    }

    const bookDescription = document.querySelector('.book-text');
    if (bookDescription && translations[lang] && translations[lang]['bookDescription']) {
        bookDescription.textContent = translations[lang]['bookDescription'];
    }

    // Update form labels
    const firstNameLabel = document.querySelector('.first-name-label');
    if (firstNameLabel && translations[lang] && translations[lang]['first-name']) {
        firstNameLabel.textContent = translations[lang]['first-name'];
    }

    const lastNameLabel = document.querySelector('.last-name-label');
    if (lastNameLabel && translations[lang] && translations[lang]['last-name']) {
        lastNameLabel.textContent = translations[lang]['last-name'];
    }

    const emailLabel = document.querySelector('.email-label');
    if (emailLabel && translations[lang] && translations[lang]['email']) {
        emailLabel.textContent = translations[lang]['email'];
    }

    const phoneLabel = document.querySelector('.phone-label');
    if (phoneLabel && translations[lang] && translations[lang]['phone']) {
        phoneLabel.textContent = translations[lang]['phone'];
    }

    const dateLabel = document.querySelector('.date-label');
    if (dateLabel && translations[lang] && translations[lang]['date']) {
        dateLabel.textContent = translations[lang]['date'];
    }

    const timeLabel = document.querySelector('.time-label');
    if (timeLabel && translations[lang] && translations[lang]['time']) {
        timeLabel.textContent = translations[lang]['time'];
    }

    const serviceLabel = document.querySelector('.service-label');
    if (serviceLabel && translations[lang] && translations[lang]['service']) {
        serviceLabel.textContent = translations[lang]['service'];
    }

    // Update labels
    document.querySelectorAll('.book-label, .book_label').forEach(label => {
        const originalText = label.textContent;
        if (translations[lang][originalText]) {
            label.textContent = translations[lang][originalText];
        }
    });

    // Update button text
    document.querySelectorAll('.book-btn').forEach(button => {
        const originalText = button.textContent;
        if (translations[lang][originalText]) {
            button.textContent = translations[lang][originalText];
        }
    });

    // Update placeholders
    document.querySelectorAll('.book-input, .book_input').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder && translations[lang][`placeholder_${placeholder}`]) {
            input.setAttribute('placeholder', translations[lang][`placeholder_${placeholder}`]);
        }
    });
}

// Update contact page specific elements
function updateContactPage(lang) {
    const langData = translations[lang];

    // Update elements with data attributes
    document.querySelectorAll('[data]').forEach(element => {
        const key = element.getAttribute('data');
        if (langData[key]) {
            element.textContent = langData[key];
        }
    });

    // Update contact section
    const contactElements = {
        '.contact_text': 'getInTouch',
        '.contact-title': 'weAreHere',
        '.contact-text': 'contactDescription',
        '.contact__text:first-of-type': 'visitUs',
        '.contact__text:nth-of-type(2)': 'dropUs',
        '.contact__text:last-of-type': 'callUs'
    };

    for (const selector in contactElements) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = langData[contactElements[selector]];
        }
    }

    const beautySalon = document.querySelector('.book_text');
    if (beautySalon && translations[lang] && translations[lang]['beauty-salon']) {
        beautySalon.textContent = translations[lang]['beauty-salon'];
    }

    const bookAppointment = document.querySelector('.book-title');
    if (bookAppointment && translations[lang] && translations[lang]['book-appointment']) {
        bookAppointment.textContent = translations[lang]['book-appointment'];
    }

    const bookDescription = document.querySelector('.book-text');
    if (bookDescription && translations[lang] && translations[lang]['bookDescription']) {
        bookDescription.textContent = translations[lang]['bookDescription'];
    }

    // Update form labels
    const firstNameLabel = document.querySelector('.first-name-label');
    if (firstNameLabel && translations[lang] && translations[lang]['first-name']) {
        firstNameLabel.textContent = translations[lang]['first-name'];
    }

    const lastNameLabel = document.querySelector('.last-name-label');
    if (lastNameLabel && translations[lang] && translations[lang]['last-name']) {
        lastNameLabel.textContent = translations[lang]['last-name'];
    }

    const emailLabel = document.querySelector('.email-label');
    if (emailLabel && translations[lang] && translations[lang]['email']) {
        emailLabel.textContent = translations[lang]['email'];
    }

    const phoneLabel = document.querySelector('.phone-label');
    if (phoneLabel && translations[lang] && translations[lang]['phone']) {
        phoneLabel.textContent = translations[lang]['phone'];
    }

    const dateLabel = document.querySelector('.date-label');
    if (dateLabel && translations[lang] && translations[lang]['date']) {
        dateLabel.textContent = translations[lang]['date'];
    }

    const timeLabel = document.querySelector('.time-label');
    if (timeLabel && translations[lang] && translations[lang]['time']) {
        timeLabel.textContent = translations[lang]['time'];
    }

    const serviceLabel = document.querySelector('.service-label');
    if (serviceLabel && translations[lang] && translations[lang]['service']) {
        serviceLabel.textContent = translations[lang]['service'];
    }

    // Update labels
    document.querySelectorAll('.book-label, .book_label').forEach(label => {
        const originalText = label.textContent;
        if (translations[lang][originalText]) {
            label.textContent = translations[lang][originalText];
        }
    });

    // Update button text
    document.querySelectorAll('.book-btn').forEach(button => {
        const originalText = button.textContent;
        if (translations[lang][originalText]) {
            button.textContent = translations[lang][originalText];
        }
    });

    // Update placeholders
    document.querySelectorAll('.book-input, .book_input').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder && translations[lang][`placeholder_${placeholder}`]) {
            input.setAttribute('placeholder', translations[lang][`placeholder_${placeholder}`]);
        }
    });
    
    // Update follow section
    const followElements = {
        '.follow-title': 'followInstagram',
        '.follow-text': 'followDescription'
    };

    for (const selector in followElements) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = langData[followElements[selector]];
        }
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function () {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';

    // Set the language selector to saved language
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = savedLanguage;

        // Add event listener for language change
        languageSelect.addEventListener('change', function () {
            changeLanguage(this.value);
        });
    }

    // Apply the saved language
    changeLanguage(savedLanguage);
});

// Expose the changeLanguage function to the global scope
window.changeLanguage = changeLanguage;
