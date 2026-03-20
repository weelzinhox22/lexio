import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("id")

    if (!userId) {
        return new NextResponse("console.error('Themixa Widget: user id not provided');", {
            headers: { "Content-Type": "application/javascript" }
        })
    }

    // Initialize admin client to read config bypassing RLS, or simple client if public
    // Let's use service_role so we can fetch regardless of RLS setup since user_id is the key
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: config, error } = await supabase
        .from("whatsapp_widgets")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

    if (error || !config) {
        return new NextResponse("console.warn('Themixa Widget: configuration not found or inactive');", {
            headers: { "Content-Type": "application/javascript" }
        })
    }

    const host = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    const scriptContent = `
(function() {
    // Themixa WhatsApp Connect Widget
    var config = {
        userId: "${config.user_id}",
        phone: "${config.phone_number}",
        message: "${config.default_message || ''}",
        cta: "${config.call_to_action || 'Fale no WhatsApp'}",
        color: "${config.button_color || '#25D366'}",
        apiUrl: "${host}/api/leads/capture"
    };

    // Inject Styles
    var styles = document.createElement('style');
    styles.innerHTML = \`
        #tmx-wa-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #tmx-wa-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: \${config.color};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        #tmx-wa-button:hover {
            transform: scale(1.05);
        }
        #tmx-wa-button svg {
            width: 32px;
            height: 32px;
            fill: #fff;
        }
        #tmx-wa-form-container {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 320px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.16);
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #tmx-wa-form-container.tmx-active {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }
        .tmx-header {
            background-color: \${config.color};
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .tmx-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        .tmx-body {
            padding: 20px;
        }
        .tmx-input-group {
            margin-bottom: 12px;
        }
        .tmx-input-group label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
            font-weight: 500;
        }
        .tmx-input-group input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
        }
        .tmx-input-group input:focus {
            border-color: \${config.color};
        }
        #tmx-submit {
            width: 100%;
            padding: 12px;
            background-color: \${config.color};
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
            transition: opacity 0.2s;
        }
        #tmx-submit:hover {
            opacity: 0.9;
        }
        #tmx-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .tmx-footer {
            text-align: center;
            padding-bottom: 12px;
            font-size: 10px;
            color: #aaa;
        }
        .tmx-footer a {
            color: #aaa;
            text-decoration: none;
        }
    \`;
    document.head.appendChild(styles);

    // Build DOM
    var wrapper = document.createElement('div');
    wrapper.id = 'tmx-wa-widget';

    var button = document.createElement('div');
    button.id = 'tmx-wa-button';
    button.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.14,2A13.88,13.88,0,0,0,4.24,22L2.35,28.84l7-1.83A13.86,13.86,0,1,0,16.14,2Zm7.56,19.46c-.32.89-1.84,1.71-2.54,1.82-.66.1-1.46.25-4.69-1.08-3.9-1.61-6.43-5.6-6.63-5.86s-1.58-2.1-1.58-4.06S9,9.45,9.25,9.15s.81-.38,1.08-.38a.5.5,0,0,1,.45.31c.14.34.46,1.13.5,1.23s.09.24.05.41-.12.28-.24.43c-.12.14-.25.32-.36.43s-.25.26-.11.51a9.21,9.21,0,0,0,1.72,2.15,8.36,8.36,0,0,0,2.5,1.55c.23.11.37.1.51-.06s.63-.73.8-1,.34-.21.56-.12S17.48,8.23,17.7,8.34,18.06,8.5,18.15,8.65a3.81,3.81,0,0,1,.15,1.8C18.13,20.89,16.61,21.71,16.14,21.46Z"/></svg>';

    var formContainer = document.createElement('div');
    formContainer.id = 'tmx-wa-form-container';
    
    var header = document.createElement('div');
    header.className = 'tmx-header';
    header.innerHTML = '<h3>' + config.cta + '</h3>';

    var body = document.createElement('div');
    body.className = 'tmx-body';
    
    var html = '<div class="tmx-input-group"><label>Seu Nome</label><input type="text" id="tmx-name" placeholder="Como podemos te chamar?"></div>' +
               '<div class="tmx-input-group"><label>Seu Telefone / WhatsApp</label><input type="tel" id="tmx-phone" placeholder="(11) 99999-9999"></div>' +
               '<button id="tmx-submit">Iniciar Conversa</button>';
               
    body.innerHTML = html;

    var footer = document.createElement('div');
    footer.className = 'tmx-footer';
    footer.innerHTML = '⚡ Powered by <a href="https://themixa.com.br" target="_blank">Themixa</a>';

    formContainer.appendChild(header);
    formContainer.appendChild(body);
    formContainer.appendChild(footer);

    wrapper.appendChild(formContainer);
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);

    // Event Listeners
    button.addEventListener('click', function() {
        formContainer.classList.toggle('tmx-active');
        if (formContainer.classList.contains('tmx-active')) {
            document.getElementById('tmx-name').focus();
        }
    });

    var allowClose = true;
    formContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    button.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    document.addEventListener('click', function() {
        if (allowClose) formContainer.classList.remove('tmx-active');
    });

    // Form Submit logic
    var submitBtn = document.getElementById('tmx-submit');
    submitBtn.addEventListener('click', function() {
        var n = document.getElementById('tmx-name').value;
        var p = document.getElementById('tmx-phone').value;

        if (!n || !p) {
            alert('Por favor, preencha nome e telefone para continuarmos.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Conectando...';

        // Fire request to Themixa CRM
        fetch(config.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: config.userId,
                name: n,
                phone: p,
                source: window.location.hostname
            })
        })
        .then(function() {
            // Success or fail, we redirect to whatsapp immediately after to not hurt conversion
            redirectToWhatsapp(n);
        })
        .catch(function(e) {
            console.error('Themixa Capture Error:', e);
            redirectToWhatsapp(n);
        });
    });

    function redirectToWhatsapp(userName) {
        var baseMsg = config.message;
        var encodedMsg = encodeURIComponent(baseMsg);
        
        // Formating phone (remover tudo que nao eh numero)
        var cleanPhone = config.phone.replace(/\\D/g, '');
        // If it starts with 55 already we keep, otherwise we prepend 55 (assuming brazil)
        if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
            cleanPhone = '55' + cleanPhone;
        }

        var waUrl = 'https://wa.me/' + cleanPhone + '?text=' + encodedMsg;
        window.open(waUrl, '_blank');
        
        // Reset form
        formContainer.classList.remove('tmx-active');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Iniciar Conversa';
        document.getElementById('tmx-name').value = '';
        document.getElementById('tmx-phone').value = '';
    }
})();
    `;

    return new NextResponse(scriptContent, {
        headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=60" // Cache for 1 min
        }
    })
}
