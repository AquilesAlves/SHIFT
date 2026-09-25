/**
 * SHIFT - Script Principal do Site
 * Desenvolvido puramente em Vanilla JS sem dependências externas.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ALTERNÂNCIA DE TEMA (CLARO/ESCURO) COM LOCALSTORAGE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Detectar preferência salva ou do Sistema Operacional
    const savedTheme = localStorage.getItem('shift-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.classList.add('dark-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        // Salvar escolha no LocalStorage
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('shift-theme', 'dark');
        } else {
            localStorage.setItem('shift-theme', 'light');
        }
    });


    // --- 2. HEADER DINÂMICO NO SCROLL ---
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- 3. MENU MOBILE RESPONSIVO ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Bloquear scroll do body quando menu estiver aberto
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Fechar menu mobile ao clicar num link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // --- 4. SCROLL SUAVE PARA LINKS INTERNOS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Compensar altura do header fixo
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // --- 5. ANIMAÇÕES AO ENTRAR NA TELA (REVEAL) E MENU ATIVO ---
    const revealElements = document.querySelectorAll('.reveal');
    const sections = document.querySelectorAll('section[id]');

    const scrollObserverOptions = {
        threshold: 0.1, // Dispara quando 10% do elemento estiver visível
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Animação de entrada
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Se for um elemento de reveal apenas para animação, pode parar de observar
                if(entry.target.classList.contains('reveal')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, scrollObserverOptions);

    revealElements.forEach(el => scrollObserver.observe(el));

    // Observador dedicado para destacar o menu ativo baseado na seção
    const sectionObserverOptions = {
        threshold: 0.3
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active de todos
                navLinks.forEach(link => link.classList.remove('active'));
                // Adiciona active no correspondente
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if(activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => sectionObserver.observe(section));


    // --- 6. CONTADORES ANIMADOS ---
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 segundos
                const increment = target / (duration / 16); // 16ms por frame (aprox 60fps)
                
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        }
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('estatisticas');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }


    // --- 7. BOTÃO VOLTAR AO TOPO ---
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // --- 8. VALIDAÇÃO DO FORMULÁRIO DE CONTATO ---
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
            
            // Função simples de validação de e-mail (Regex)
            const validateEmail = (email) => {
                return String(email).toLowerCase().match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            };

            // Limpa mensagens de erro
            contactForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));

            // Validação individual
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    isValid = false;
                    input.parentElement.classList.add('error');
                } else if (input.type === 'email' && !validateEmail(input.value)) {
                    isValid = false;
                    input.parentElement.classList.add('error');
                }
            });

            if (isValid) {
                // Simula envio de dados
                const btn = contactForm.querySelector('button[type="submit"]');
                const btnOriginalText = btn.innerText;
                btn.innerText = 'Enviando...';
                btn.disabled = true;

                setTimeout(() => {
                    successMsg.classList.remove('hidden');
                    contactForm.reset();
                    btn.innerText = btnOriginalText;
                    btn.disabled = false;
                    
                    // Esconde a mensagem após 5 segundos
                    setTimeout(() => {
                        successMsg.classList.add('hidden');
                    }, 5000);
                }, 1500); // Simulando delay de API de 1.5s
            }
        });
    }

    // --- 9. INSERIR ANO ATUAL NO FOOTER ---
    document.getElementById('currentYear').textContent = new Date().getFullYear();

});