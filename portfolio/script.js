document.addEventListener('DOMContentLoaded', () => {

  // ─── PART 1: Navbar Scroll Effect ───
  const nav = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });


  // ─── PART 2: Active Nav Link ───
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 100) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });


  // ─── PART 3: Scroll Animations ───
  const observerOptions = {
    threshold: 0.1
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });


  // ─── PART 4: Chatbot ───
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');

  const API_URL = 'http://localhost:8000/chat';

  // open chatbot window
  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.remove('hidden');
    chatbotInput.focus();

    // show welcome message on first open
    if (chatbotMessages.children.length === 0) {
      addMessage('bot', 'Hi! I\'m Faiq\'s AI assistant. Ask me anything about his skills, projects, or experience 👋');
    }
  });

  // close chatbot window
  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.add('hidden');
  });

  // send on button click
  chatbotSend.addEventListener('click', () => {
    sendMessage();
  });

  // send on Enter key
  chatbotInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // ─── convert markdown to html ───
  // cohere returns **bold**, - bullets, and \n newlines
  // this converts them to proper html before displaying
  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  }

  // ─── add a message bubble to chat ───
  function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    // use innerHTML with formatMessage for bot messages
    // use textContent for user messages — no need to format
    if (sender === 'bot') {
      messageDiv.innerHTML = formatMessage(text);
    } else {
      messageDiv.textContent = text;
    }
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return messageDiv;
  }

  // ─── send message and get AI response ───
  async function sendMessage() {
    const userMessage = chatbotInput.value.trim();

    if (!userMessage) return;

    addMessage('user', userMessage);
    chatbotInput.value = '';

    const thinkingDiv = addMessage('bot', 'Thinking...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await response.json();

      // replace thinking with formatted answer
      thinkingDiv.innerHTML = formatMessage(data.answer);

    } catch (error) {
      thinkingDiv.textContent = 'Sorry, I am currently offline. Email faiqmohsin7@gmail.com directly.';
    }
  }

});