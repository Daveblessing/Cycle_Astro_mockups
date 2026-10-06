/**
 * Cycle & Astro · traductions (v1.1.0)
 * Source = français. Chaque ligne : [fr, en, es, pt, zh].
 * Les longues lectures (chemin de vie, profil complet, Krizoua verbatim) restent en français.
 */
(function () {
  'use strict';

  const LANGS = [
    { code: 'fr', label: 'FR', html: 'fr' },
    { code: 'en', label: 'EN', html: 'en' },
    { code: 'es', label: 'ES', html: 'es' },
    { code: 'pt', label: 'PT', html: 'pt' },
    { code: 'zh', label: '中文', html: 'zh-Hans' },
  ];

  const ROWS = [
    // —— Accueil / portes ——
    ['Mercredi 23 septembre 2026', 'Wednesday, September 23, 2026', 'Miércoles, 23 de septiembre de 2026', 'Quarta-feira, 23 de setembro de 2026', '2026年9月23日 星期三'],
    ['Cycle', 'Cycle', 'Ciclo', 'Ciclo', '周期'],
    ['Mes règles', 'My period', 'Mi regla', 'Minha menstruação', '我的经期'],
    ['Astro', 'Astro', 'Astro', 'Astro', '星象'],
    ['Mon ciel', 'My sky', 'Mi cielo', 'Meu céu', '我的星空'],
    ['Nouvelle personne', 'New person', 'Nueva persona', 'Nova pessoa', '新用户'],

    // —— Onboarding ——
    ['Étape 1 / 7', 'Step 1 / 7', 'Paso 1 / 7', 'Etapa 1 / 7', '第 1 步 / 共 7 步'],
    ['Disclaimer', 'Disclaimer', 'Aviso', 'Aviso', '免责声明'],
    ['Avant de commencer', 'Before you start', 'Antes de empezar', 'Antes de começar', '开始之前'],
    ['Une lecture importante — bienveillance avant tout.', 'An important read — kindness first.', 'Una lectura importante: amabilidad ante todo.', 'Uma leitura importante — gentileza acima de tudo.', '重要提示——善意为先。'],
    ['Cycle & Astro n’est pas un dispositif médical.', 'Cycle & Astro is not a medical device.', 'Cycle & Astro no es un dispositivo médico.', 'Cycle & Astro não é um dispositivo médico.', 'Cycle & Astro 不是医疗器械。'],
    ['Pour toute question de santé, consulte un·e professionnel·le de santé.', 'For any health question, see a health professional.', 'Para cualquier duda de salud, consulta a un profesional de la salud.', 'Para qualquer questão de saúde, consulte um profissional de saúde.', '如有任何健康问题，请咨询医疗专业人士。'],
    ['J’ai lu et j’accepte ce disclaimer. Je comprends que cette app est un outil de bien-être, pas un avis médical.', 'I have read and accept this disclaimer. I understand this app is a well-being tool, not medical advice.', 'He leído y acepto este aviso. Entiendo que esta app es una herramienta de bienestar, no un consejo médico.', 'Li e aceito este aviso. Entendo que este app é uma ferramenta de bem-estar, não um conselho médico.', '我已阅读并接受此免责声明。我理解本应用是身心健康工具，不是医疗建议。'],
    ['Continuer', 'Continue', 'Continuar', 'Continuar', '继续'],
    ['Quitter', 'Leave', 'Salir', 'Sair', '退出'],
    ['Tu pourras relire ce texte dans Profil → Santé & disclaimer.', 'You can reread this in Profile → Health & disclaimer.', 'Podrás releer este texto en Perfil → Salud y aviso.', 'Você pode reler este texto em Perfil → Saúde e aviso.', '你可以在“个人资料 → 健康与免责声明”中重读此内容。'],
    ['Disclaimer accepté · bienvenue', 'Disclaimer accepted · welcome', 'Aviso aceptado · bienvenida', 'Aviso aceito · boas-vindas', '已接受免责声明 · 欢迎'],

    // —— Hub ——
    ['Bonjour, Aïcha', 'Hello, Aïcha', 'Hola, Aïcha', 'Olá, Aïcha', '你好，Aïcha'],
    ['Bonjour ✦', 'Hello ✦', 'Hola ✦', 'Olá ✦', '你好 ✦'],
    ['Phase lutéale', 'Luteal phase', 'Fase lútea', 'Fase lútea', '黄体期'],
    ['septembre', 'September', 'septiembre', 'setembro', '九月'],
    ['Voir le calendrier', 'See the calendar', 'Ver el calendario', 'Ver o calendário', '查看日历'],
    ['Prochaines règles · vers le {d}', 'Next period · around {d}', 'Próxima regla · hacia el {d}', 'Próxima menstruação · por volta de {d}', '下次经期 · 约{d}'],
    ['• Calculateur', '• Calculator', '• Calculadora', '• Calculadora', '• 计算器'],
    ['✦ Profil complet', '✦ Full profile', '✦ Perfil completo', '✦ Perfil completo', '✦ 完整档案'],
    ['↺ Nouvelle personne', '↺ New person', '↺ Nueva persona', '↺ Nova pessoa', '↺ 新用户'],
    ['Cycle menstruel', 'Menstrual cycle', 'Ciclo menstrual', 'Ciclo menstrual', '月经周期'],
    ['Jour 23', 'Day 23', 'Día 23', 'Dia 23', '第 23 天'],
    ['Ralentir et ressentir', 'Slow down and feel', 'Bajar el ritmo y sentir', 'Desacelerar e sentir', '放慢脚步，感受自己'],
    ['Lune', 'Moon', 'Luna', 'Lua', '月亮'],
    ['Gibbeuse', 'Gibbous', 'Gibosa', 'Gibosa', '凸月'],
    ['Écoute ce qui se termine', 'Listen to what is ending', 'Escucha lo que termina', 'Ouça o que está terminando', '倾听正在结束的事'],
    ['Vierge', 'Virgo', 'Virgo', 'Virgem', '处女座'],
    ['Message du jour', 'Message of the day', 'Mensaje del día', 'Mensagem do dia', '今日寄语'],
    ['Chemin', 'Path', 'Camino', 'Caminho', '灵数'],
    ['Maîtrise', 'Mastery', 'Maestría', 'Maestria', '掌控'],
    ['Axes à explorer', 'Areas to explore', 'Ejes para explorar', 'Eixos a explorar', '可探索的方向'],
    ['Raccourcis', 'Shortcuts', 'Accesos directos', 'Atalhos', '快捷方式'],
    ['Retour au Market', 'Back to Market', 'Volver al Market', 'Voltar ao Market', '返回 Market'],
    ['← Retour au Market', '← Back to Market', '← Volver al Market', '← Voltar ao Market', '← 返回 Market'],
    ['Langue', 'Language', 'Idioma', 'Idioma', '语言'],

    // —— Cycle ——
    ['← Accueil', '← Home', '← Inicio', '← Início', '← 首页'],
    ['En douceur, à ton rythme.', 'Gently, at your own pace.', 'Con suavidad, a tu ritmo.', 'Com calma, no seu ritmo.', '温柔地，按你的节奏。'],
    ['Aujourd’hui · {d}', 'Today · {d}', 'Hoy · {d}', 'Hoje · {d}', '今天 · {d}'],
    ['Prochaine date · {d}', 'Next date · {d}', 'Próxima fecha · {d}', 'Próxima data · {d}', '下次日期 · {d}'],
    ['Dernières règles · {d} · cycle de {n} jours', 'Last period · {d} · {n}-day cycle', 'Última regla · {d} · ciclo de {n} días', 'Última menstruação · {d} · ciclo de {n} dias', '上次经期 · {d} · 周期 {n} 天'],
    ['Prochaine date = dernières règles + longueur du cycle', 'Next date = last period + cycle length', 'Próxima fecha = última regla + duración del ciclo', 'Próxima data = última menstruação + duração do ciclo', '下次日期 = 上次经期 + 周期长度'],
    ['Voir ma date', 'See my date', 'Ver mi fecha', 'Ver minha data', '查看我的日期'],
    ['Bien-être, pas un avis médical.', 'Well-being, not medical advice.', 'Bienestar, no consejo médico.', 'Bem-estar, não conselho médico.', '身心健康参考，非医疗建议。'],
    ['Septembre 2026', 'September 2026', 'Septiembre 2026', 'Setembro 2026', '2026年9月'],
    ['Jours de règles', 'Period days', 'Días de regla', 'Dias de menstruação', '经期'],
    ['Aujourd’hui', 'Today', 'Hoy', 'Hoje', '今天'],
    ['Corriger une période', 'Correct a period', 'Corregir un periodo', 'Corrigir um período', '修改经期'],
    ['Mois précédent', 'Previous month', 'Mes anterior', 'Mês anterior', '上个月'],
    ['Mois suivant', 'Next month', 'Mes siguiente', 'Próximo mês', '下个月'],
    ['Calendrier du cycle', 'Cycle calendar', 'Calendario del ciclo', 'Calendário do ciclo', '周期日历'],
    ['Règles (saisie)', 'Period (entered)', 'Regla (registrada)', 'Menstruação (registrada)', '经期（已记录）'],
    ['Correction de période · bientôt disponible', 'Period correction · coming soon', 'Corrección de periodo · próximamente', 'Correção de período · em breve', '经期修改 · 即将推出'],

    // —— Lune ——
    ['← Aujourd’hui', '← Today', '← Hoy', '← Hoje', '← 今天'],
    ['Gibbeuse décroissante', 'Waning gibbous', 'Gibosa menguante', 'Gibosa minguante', '亏凸月'],
    ['23 septembre 2026 · illumination ~62 %', 'September 23, 2026 · ~62% illuminated', '23 de septiembre de 2026 · iluminación ~62 %', '23 de setembro de 2026 · iluminação ~62%', '2026年9月23日 · 亮度约62%'],
    ['Énergie du jour', 'Today’s energy', 'Energía del día', 'Energia do dia', '今日能量'],
    ['Une piste pour ralentir et écouter ce qui se termine. La Lune décroissante invite au lâcher-prise — sans obligation, juste une invitation.', 'A cue to slow down and listen to what is ending. The waning Moon invites letting go — no obligation, just an invitation.', 'Una pista para bajar el ritmo y escuchar lo que termina. La Luna menguante invita a soltar, sin obligación, solo una invitación.', 'Uma pista para desacelerar e ouvir o que está terminando. A Lua minguante convida a soltar — sem obrigação, apenas um convite.', '这是一个放慢脚步、倾听正在结束之事的提示。亏月邀请你学会放下——没有强迫，只是一份邀请。'],
    ['Phases du mois', 'This month’s phases', 'Fases del mes', 'Fases do mês', '本月月相'],
    ['Nouvelle', 'New', 'Nueva', 'Nova', '新月'],
    ['Pleine', 'Full', 'Llena', 'Cheia', '满月'],
    ['Dernier q.', 'Last q.', 'C. menguante', 'Q. minguante', '下弦月'],
    ['fin septembre', 'late September', 'finales de septiembre', 'fim de setembro', '9月下旬'],
    ['12 septembre', 'September 12', '12 de septiembre', '12 de setembro', '9月12日'],
    ['14 septembre', 'September 14', '14 de septiembre', '14 de setembro', '9月14日'],
    ['18 septembre', 'September 18', '18 de septiembre', '18 de setembro', '9月18日'],
    ['20 septembre', 'September 20', '20 de septiembre', '20 de setembro', '9月20日'],
    ['21 septembre', 'September 21', '21 de septiembre', '21 de setembro', '9月21日'],
    ['23 septembre', 'September 23', '23 de septiembre', '23 de setembro', '9月23日'],
    ['26 septembre', 'September 26', '26 de septiembre', '26 de setembro', '9月26日'],
    ['Calendrier lunaire', 'Lunar calendar', 'Calendario lunar', 'Calendário lunar', '月历'],

    // —— Astro ——
    ['Tu es en sécurité ici.', 'You are safe here.', 'Aquí estás a salvo.', 'Aqui você está em segurança.', '在这里你是安全的。'],
    ['Lire le ciel', 'Read the sky', 'Leer el cielo', 'Ler o céu', '解读星空'],
    ['Lecture symbolique. Pas un avis médical.', 'Symbolic reading. Not medical advice.', 'Lectura simbólica. No es consejo médico.', 'Leitura simbólica. Não é conselho médico.', '象征性解读，非医疗建议。'],
    ['Balance — Air — Cardinal · Vénus', 'Libra — Air — Cardinal · Venus', 'Libra — Aire — Cardinal · Venus', 'Libra — Ar — Cardinal · Vênus', '天秤座 — 风象 — 基本宫 · 金星'],
    ['Harmonie, écoute et juste mesure seront tes atouts. L’énergie du 23 septembre invite à l’équilibre — une piste, pas une sentence.', 'Harmony, listening and balance will be your strengths. The energy of September 23 invites balance — a cue, not a verdict.', 'Armonía, escucha y justa medida serán tus bazas. La energía del 23 de septiembre invita al equilibrio: una pista, no una sentencia.', 'Harmonia, escuta e justa medida serão seus trunfos. A energia de 23 de setembro convida ao equilíbrio — uma pista, não uma sentença.', '和谐、倾听与分寸将是你的优势。9月23日的能量邀请你保持平衡——这是提示，而非定论。'],
    ['Phase lunaire', 'Moon phase', 'Fase lunar', 'Fase lunar', '月相'],
    ['Positions (aperçu)', 'Positions (preview)', 'Posiciones (vista previa)', 'Posições (prévia)', '星位（概览）'],
    ['Soleil', 'Sun', 'Sol', 'Sol', '太阳'],
    ['en Balance', 'in Libra', 'en Libra', 'em Libra', '在天秤座'],
    ['en Gémeaux', 'in Gemini', 'en Géminis', 'em Gêmeos', '在双子座'],
    ['Mercure', 'Mercury', 'Mercurio', 'Mercúrio', '水星'],
    ['en Vierge', 'in Virgo', 'en Virgo', 'em Virgem', '在处女座'],
    ['Vénus', 'Venus', 'Venus', 'Vênus', '金星'],
    ['en Scorpion', 'in Scorpio', 'en Escorpio', 'em Escorpião', '在天蝎座'],
    ['L’astro guide, elle ne dicte pas.', 'Astrology guides, it does not dictate.', 'La astrología guía, no dicta.', 'A astrologia guia, não dita.', '占星只是指引，不是命令。'],
    ['Niveaux d’énergie', 'Energy levels', 'Niveles de energía', 'Níveis de energia', '能量水平'],
    ['Énergie solaire', 'Solar energy', 'Energía solar', 'Energia solar', '太阳能量'],
    ['Clarté mentale', 'Mental clarity', 'Claridad mental', 'Clareza mental', '思维清晰度'],
    ['Ouverture émotionnelle', 'Emotional openness', 'Apertura emocional', 'Abertura emocional', '情感开放度'],
    ['Ancrage', 'Grounding', 'Arraigo', 'Enraizamento', '扎根感'],
    ['Favorable aujourd’hui', 'Favourable today', 'Favorable hoy', 'Favorável hoje', '今日适宜'],
    ['Santé & bien-être', 'Health & well-being', 'Salud y bienestar', 'Saúde e bem-estar', '健康与身心'],
    ['Organisation', 'Organisation', 'Organización', 'Organização', '规划整理'],
    ['Travail précis', 'Precise work', 'Trabajo preciso', 'Trabalho preciso', '细致工作'],
    ['Mon thème natal lite', 'My natal chart (lite)', 'Mi carta natal (lite)', 'Meu mapa natal (lite)', '我的简易星盘'],
    ['Cancer', 'Cancer', 'Cáncer', 'Câncer', '巨蟹座'],
    ['Ascendant', 'Rising', 'Ascendente', 'Ascendente', '上升星座'],
    ['Scorpion', 'Scorpio', 'Escorpio', 'Escorpião', '天蝎座'],
    ['(si heure)', '(if time known)', '(si hay hora)', '(se houver hora)', '（需出生时间）'],
    ['Manque heure / lieu ? Complète dans Profil pour affiner.', 'Missing time / place? Add it in Profile to refine.', '¿Falta la hora o el lugar? Complétalo en Perfil para afinar.', 'Falta hora / local? Complete no Perfil para refinar.', '缺少时间/地点？请在个人资料中补充以更精确。'],
    ['Profil complet', 'Full profile', 'Perfil completo', 'Perfil completo', '完整档案'],

    // —— Chemin de vie ——
    ['Chemin de vie', 'Life path', 'Camino de vida', 'Caminho de vida', '生命灵数'],
    ['✦ NOMBRE ✦', '✦ NUMBER ✦', '✦ NÚMERO ✦', '✦ NÚMERO ✦', '✦ 数字 ✦'],
    ['La maîtrise', 'Mastery', 'La maestría', 'A maestria', '掌控'],
    ['Lecture douce', 'Gentle reading', 'Lectura suave', 'Leitura suave', '温和解读'],
    ['Ton chemin de vie 8 évoque la maîtrise, l’abondance et la responsabilité — des axes à explorer, librement. Ce n’est pas un destin figé : juste une boussole.', 'Your life path 8 evokes mastery, abundance and responsibility — areas to explore freely. It is not a fixed destiny: just a compass.', 'Tu camino de vida 8 evoca la maestría, la abundancia y la responsabilidad: ejes para explorar libremente. No es un destino fijo, solo una brújula.', 'Seu caminho de vida 8 evoca maestria, abundância e responsabilidade — eixos a explorar livremente. Não é um destino fixo: apenas uma bússola.', '你的生命灵数 8 象征掌控、丰盛与责任——可以自由探索的方向。这不是注定的命运，只是一枚指南针。'],
    ['Invitations', 'Invitations', 'Invitaciones', 'Convites', '邀请'],
    ['Honorer ta capacité à structurer et à diriger avec cœur.', 'Honour your ability to structure and lead with heart.', 'Honrar tu capacidad de estructurar y dirigir con el corazón.', 'Honrar sua capacidade de estruturar e liderar com o coração.', '珍视你用心规划与领导的能力。'],
    ['Équilibrer ambition et repos — la force se cultive aussi dans le calme.', 'Balance ambition and rest — strength also grows in calm.', 'Equilibrar ambición y descanso: la fuerza también se cultiva en la calma.', 'Equilibrar ambição e descanso — a força também se cultiva na calma.', '平衡抱负与休息——力量也在平静中滋长。'],
    ['Voir l’abondance comme circulation, pas comme pression.', 'See abundance as flow, not pressure.', 'Ver la abundancia como circulación, no como presión.', 'Ver a abundância como circulação, não como pressão.', '把丰盛看作流动，而非压力。'],
    ['Choisir la maîtrise de soi avant la maîtrise des autres.', 'Choose self-mastery before mastering others.', 'Elegir el dominio de uno mismo antes que el de los demás.', 'Escolher o domínio de si antes do domínio dos outros.', '先掌控自己，再引领他人。'],
    ['Lire mon profil', 'Read my profile', 'Leer mi perfil', 'Ler meu perfil', '查看我的档案'],
    ['Chemin · jour · signe & décan · dons · axes', 'Path · day · sign & decan · gifts · areas', 'Camino · día · signo y decanato · dones · ejes', 'Caminho · dia · signo e decanato · dons · eixos', '灵数 · 日 · 星座与十度 · 天赋 · 方向'],
    ['Ce n’est pas un destin figé. Juste une boussole à explorer — tu restes libre.', 'It is not a fixed destiny. Just a compass to explore — you remain free.', 'No es un destino fijo. Solo una brújula para explorar: sigues siendo libre.', 'Não é um destino fixo. Apenas uma bússola para explorar — você continua livre.', '这不是注定的命运，只是一枚可以探索的指南针——你始终自由。'],

    // —— Journal / check-in ——
    ['Check-in', 'Check-in', 'Registro', 'Check-in', '每日记录'],
    ['Historique', 'History', 'Historial', 'Histórico', '历史'],
    ['Aujourd’hui · 23 septembre 2026', 'Today · September 23, 2026', 'Hoy · 23 de septiembre de 2026', 'Hoje · 23 de setembro de 2026', '今天 · 2026年9月23日'],
    ['Comment tu te sens ?', 'How do you feel?', '¿Cómo te sientes?', 'Como você se sente?', '你感觉怎么样？'],
    ['Sereine', 'Serene', 'Serena', 'Serena', '平静'],
    ['Fatiguée', 'Tired', 'Cansada', 'Cansada', '疲惫'],
    ['Énergique', 'Energetic', 'Enérgica', 'Enérgica', '充满活力'],
    ['Sensible', 'Sensitive', 'Sensible', 'Sensível', '敏感'],
    ['Motivée', 'Motivated', 'Motivada', 'Motivada', '有动力'],
    ['Besoin de calme', 'Need calm', 'Necesito calma', 'Preciso de calma', '需要安静'],
    ['Ce que tu ressens', 'What you feel', 'Lo que sientes', 'O que você sente', '你的身体感受'],
    ['Crampes légères', 'Mild cramps', 'Calambres leves', 'Cólicas leves', '轻微痉挛'],
    ['Fatigue', 'Fatigue', 'Cansancio', 'Cansaço', '疲劳'],
    ['Ballonnements', 'Bloating', 'Hinchazón', 'Inchaço', '腹胀'],
    ['Appétit changeant', 'Changing appetite', 'Apetito cambiante', 'Apetite variável', '食欲变化'],
    ['Sensibilité émotionnelle', 'Emotional sensitivity', 'Sensibilidad emocional', 'Sensibilidade emocional', '情绪敏感'],
    ['Sommeil agité', 'Restless sleep', 'Sueño agitado', 'Sono agitado', '睡眠不安'],
    ['Peau sensible', 'Sensitive skin', 'Piel sensible', 'Pele sensível', '皮肤敏感'],
    ['Motivation', 'Motivation', 'Motivación', 'Motivação', '动力'],
    ['Énergie', 'Energy', 'Energía', 'Energia', '能量'],
    ['Note (optionnel)', 'Note (optional)', 'Nota (opcional)', 'Nota (opcional)', '备注（可选）'],
    ['Quelques mots pour toi…', 'A few words for yourself…', 'Unas palabras para ti…', 'Algumas palavras para você…', '写几句话给自己…'],
    ['Enregistrer', 'Save', 'Guardar', 'Salvar', '保存'],
    ['Liste soft · aucun terme pathologique · pas un avis médical.', 'Gentle list · no clinical terms · not medical advice.', 'Lista suave · sin términos patológicos · no es consejo médico.', 'Lista suave · sem termos patológicos · não é conselho médico.', '温和清单 · 不含病理术语 · 非医疗建议。'],
    ['Historique récent', 'Recent history', 'Historial reciente', 'Histórico recente', '最近记录'],
    ['Énergique · fatigue, sensibilité', 'Energetic · fatigue, sensitivity', 'Enérgica · cansancio, sensibilidad', 'Enérgica · cansaço, sensibilidade', '充满活力 · 疲劳、敏感'],
    ['Sensible · besoin de calme', 'Sensitive · need calm', 'Sensible · necesito calma', 'Sensível · preciso de calma', '敏感 · 需要安静'],
    ['Motivée · énergie haute', 'Motivated · high energy', 'Motivada · energía alta', 'Motivada · energia alta', '有动力 · 能量充沛'],
    ['Retour au check-in', 'Back to check-in', 'Volver al registro', 'Voltar ao check-in', '返回每日记录'],
    ['Check-in enregistré ✦', 'Check-in saved ✦', 'Registro guardado ✦', 'Check-in salvo ✦', '记录已保存 ✦'],
    ['Check-in noté pour cette session · non enregistré', 'Check-in noted for this session · not saved', 'Registro anotado en esta sesión · no guardado', 'Check-in anotado nesta sessão · não salvo', '本次会话已记录 · 未保存'],
    ['Énergie de 1 à 5', 'Energy from 1 to 5', 'Energía de 1 a 5', 'Energia de 1 a 5', '能量 1 到 5'],

    // —— Profil ——
    ['Profil', 'Profile', 'Perfil', 'Perfil', '个人资料'],
    ['Soleil Vierge · Chemin 8 · Abidjan', 'Sun Virgo · Path 8 · Abidjan', 'Sol Virgo · Camino 8 · Abiyán', 'Sol Virgem · Caminho 8 · Abidjan', '太阳处女座 · 灵数 8 · 阿比让'],
    ['↺ Nouvelle personne / Remise à zéro', '↺ New person / Reset', '↺ Nueva persona / Reiniciar', '↺ Nova pessoa / Redefinir', '↺ 新用户 / 重置'],
    ['Mon chemin de vie', 'My life path', 'Mi camino de vida', 'Meu caminho de vida', '我的生命灵数'],
    ['Calculateur de menstruation', 'Period calculator', 'Calculadora de regla', 'Calculadora menstrual', '经期计算器'],
    ['Mon thème simplifié', 'My simple chart', 'Mi carta simplificada', 'Meu mapa simplificado', '我的简化星盘'],
    ['Modifier mes infos', 'Edit my info', 'Editar mis datos', 'Editar meus dados', '修改我的信息'],
    ['Intentions', 'Intentions', 'Intenciones', 'Intenções', '心愿'],
    ['Réglages', 'Settings', 'Ajustes', 'Configurações', '设置'],
    ['Notifications', 'Notifications', 'Notificaciones', 'Notificações', '通知'],
    ['Données & confidentialité', 'Data & privacy', 'Datos y privacidad', 'Dados e privacidade', '数据与隐私'],
    ['Santé & disclaimer', 'Health & disclaimer', 'Salud y aviso', 'Saúde e aviso', '健康与免责声明'],
    ['À propos', 'About', 'Acerca de', 'Sobre', '关于'],
    ['Infos cycle, Lune, astro et chemin de vie = bien-être personnel uniquement. Pas de diagnostic, pas de conseil clinique, pas de contraception / conception.', 'Cycle, Moon, astro and life-path info = personal well-being only. No diagnosis, no clinical advice, no contraception / conception.', 'Información de ciclo, Luna, astro y camino de vida = solo bienestar personal. Sin diagnóstico, sin consejo clínico, sin anticoncepción / concepción.', 'Informações de ciclo, Lua, astro e caminho de vida = apenas bem-estar pessoal. Sem diagnóstico, sem conselho clínico, sem contracepção / concepção.', '周期、月亮、占星和灵数信息仅供个人身心参考。不做诊断，不提供临床建议，不用于避孕/备孕。'],
    ['Pour ta santé : un·e professionnel·le.', 'For your health: see a professional.', 'Para tu salud: un profesional.', 'Para sua saúde: um profissional.', '健康问题请咨询专业人士。'],
    ['Accepté le 17 septembre 2026 · démo locale', 'Accepted on September 17, 2026 · local demo', 'Aceptado el 17 de septiembre de 2026 · demo local', 'Aceito em 17 de setembro de 2026 · demo local', '已于2026年9月17日接受 · 本地演示'],
    ['Fermer', 'Close', 'Cerrar', 'Fechar', '关闭'],
    ['Mes données', 'My data', 'Mis datos', 'Meus dados', '我的数据'],
    ['Tes données restent sur ce téléphone. Aucun serveur.', 'Your data stays on this phone. No server.', 'Tus datos se quedan en este teléfono. Ningún servidor.', 'Seus dados ficam neste telefone. Nenhum servidor.', '你的数据只保存在这部手机上，没有服务器。'],
    ['Exporter mes données', 'Export my data', 'Exportar mis datos', 'Exportar meus dados', '导出我的数据'],
    ['Supprimer mes données de cycle', 'Delete my cycle data', 'Borrar mis datos de ciclo', 'Apagar meus dados de ciclo', '删除我的周期数据'],
    ['Consentement : accepté le {d}', 'Consent: accepted on {d}', 'Consentimiento: aceptado el {d}', 'Consentimento: aceito em {d}', '同意状态：已于{d}同意'],
    ['Consentement : pas encore donné', 'Consent: not given yet', 'Consentimiento: aún no dado', 'Consentimento: ainda não dado', '同意状态：尚未同意'],
    ['Supprimer tes données de cycle ?\n\nDates, calculs et journal enregistrés sur ce téléphone seront effacés. Ton forfait ne change pas.', 'Delete your cycle data?\n\nDates, calculations and journal saved on this phone will be erased. Your plan does not change.', '¿Borrar tus datos de ciclo?\n\nSe borrarán las fechas, cálculos y diario guardados en este teléfono. Tu plan no cambia.', 'Apagar seus dados de ciclo?\n\nDatas, cálculos e diário salvos neste telefone serão apagados. Seu plano não muda.', '删除你的周期数据？\n\n保存在这部手机上的日期、计算结果和日志将被清除。你的套餐不受影响。'],
    ['Données de cycle supprimées', 'Cycle data deleted', 'Datos de ciclo borrados', 'Dados de ciclo apagados', '周期数据已删除'],
    ['Export prêt · fichier téléchargé', 'Export ready · file downloaded', 'Exportación lista · archivo descargado', 'Exportação pronta · arquivo baixado', '导出完成 · 文件已下载'],
    ['Version', 'Version', 'Versión', 'Versão', '版本'],

    // —— Profil complet (formulaire) ——
    ['↺ Reset', '↺ Reset', '↺ Reiniciar', '↺ Redefinir', '↺ 重置'],
    ['Toute personne · chemin · astro · chiffres & couleurs de chance · boussole douce, pas un destin.', 'Anyone · path · astro · lucky numbers & colours · a gentle compass, not a destiny.', 'Cualquier persona · camino · astro · números y colores de la suerte · brújula suave, no un destino.', 'Qualquer pessoa · caminho · astro · números e cores da sorte · bússola suave, não um destino.', '适用于任何人 · 灵数 · 占星 · 幸运数字与颜色 · 温和的指南针，而非命运。'],
    ['Démo · Aïcha', 'Demo · Aïcha', 'Demo · Aïcha', 'Demo · Aïcha', '演示 · Aïcha'],
    ['Prénom', 'First name', 'Nombre', 'Nome', '名字'],
    ['Nom', 'Last name', 'Apellido', 'Sobrenome', '姓氏'],
    ['Genre', 'Gender', 'Género', 'Gênero', '性别'],
    ['(optionnel)', '(optional)', '(opcional)', '(opcional)', '（可选）'],
    ['Non précisé', 'Not specified', 'No especificado', 'Não informado', '未说明'],
    ['Femme', 'Woman', 'Mujer', 'Mulher', '女'],
    ['Homme', 'Man', 'Hombre', 'Homem', '男'],
    ['Date de naissance', 'Date of birth', 'Fecha de nacimiento', 'Data de nascimento', '出生日期'],
    ['Heure de naissance', 'Time of birth', 'Hora de nacimiento', 'Hora de nascimento', '出生时间'],
    ['(recommandée)', '(recommended)', '(recomendada)', '(recomendada)', '（建议填写）'],
    ['Ville de naissance', 'City of birth', 'Ciudad de nacimiento', 'Cidade de nascimento', '出生城市'],
    ['Prénom + date · le reste affine la lecture (heure → note ascendant).', 'First name + date · the rest refines the reading (time → rising note).', 'Nombre + fecha · el resto afina la lectura (hora → nota del ascendente).', 'Nome + data · o resto refina a leitura (hora → nota do ascendente).', '名字 + 日期即可 · 其他信息让解读更精确（时间 → 上升星座说明）。'],
    ['Profils récents', 'Recent profiles', 'Perfiles recientes', 'Perfis recentes', '最近的档案'],
    ['Génération de ton profil complet…', 'Generating your full profile…', 'Generando tu perfil completo…', 'Gerando seu perfil completo…', '正在生成你的完整档案…'],
    ['Ex. Aïcha', 'e.g. Aïcha', 'Ej. Aïcha', 'Ex. Aïcha', '例如 Aïcha'],
    ['Ex. Koné', 'e.g. Koné', 'Ej. Koné', 'Ex. Koné', '例如 Koné'],
    ['Ex. Abidjan', 'e.g. Abidjan', 'Ej. Abiyán', 'Ex. Abidjan', '例如 阿比让'],
    ['Remise à zéro', 'Reset', 'Reiniciar', 'Redefinir', '重置'],
    ['Mode lecture', 'Reading mode', 'Modo de lectura', 'Modo de leitura', '解读模式'],
    ['La lecture détaillée est en français.', 'The detailed reading is in French.', 'La lectura detallada está en francés.', 'A leitura detalhada está em francês.', '详细解读为法语内容。'],
    ['Indique un prénom', 'Enter a first name', 'Indica un nombre', 'Informe um nome', '请填写名字'],
    ['Indique une date de naissance', 'Enter a date of birth', 'Indica una fecha de nacimiento', 'Informe uma data de nascimento', '请填写出生日期'],
    ['Profil complet généré ✦', 'Full profile generated ✦', 'Perfil completo generado ✦', 'Perfil completo gerado ✦', '完整档案已生成 ✦'],
    ['Exemple KD · Krizoua ✦', 'KD example · Krizoua ✦', 'Ejemplo KD · Krizoua ✦', 'Exemplo KD · Krizoua ✦', 'KD 示例 · Krizoua ✦'],
    ['Nouvelle personne / Remise à zéro ?\n\nLe formulaire, les résultats et le profil courant seront vidés. Les profils récents restent disponibles.', 'New person / Reset?\n\nThe form, results and current profile will be cleared. Recent profiles stay available.', '¿Nueva persona / Reiniciar?\n\nSe vaciarán el formulario, los resultados y el perfil actual. Los perfiles recientes siguen disponibles.', 'Nova pessoa / Redefinir?\n\nO formulário, os resultados e o perfil atual serão limpos. Os perfis recentes continuam disponíveis.', '新用户 / 重置？\n\n表单、结果和当前档案将被清空。最近的档案仍可使用。'],
    ['Remise à zéro · prêt pour une nouvelle personne', 'Reset · ready for a new person', 'Reiniciado · listo para una nueva persona', 'Redefinido · pronto para uma nova pessoa', '已重置 · 可以录入新用户'],
    ['Profil prêt à saisir · septembre 2026', 'Profile ready to fill · September 2026', 'Perfil listo para completar · septiembre 2026', 'Perfil pronto para preencher · setembro 2026', '档案待填写 · 2026年9月'],

    // —— Calculateur ——
    ['← Cycle', '← Cycle', '← Ciclo', '← Ciclo', '← 周期'],
    ['Ta date', 'Your date', 'Tu fecha', 'Sua data', '你的日期'],
    ['Deux infos. Puis ta date, en grand.', 'Two details. Then your date, in big.', 'Dos datos. Luego tu fecha, en grande.', 'Dois dados. Depois sua data, em destaque.', '两项信息，然后大字显示你的日期。'],
    ['Date des dernières règles', 'Date of last period', 'Fecha de la última regla', 'Data da última menstruação', '上次经期日期'],
    ['Longueur du cycle', 'Cycle length', 'Duración del ciclo', 'Duração do ciclo', '周期长度'],
    ['Durée des règles', 'Period length', 'Duración de la regla', 'Duração da menstruação', '经期长度'],
    ['Douce nuit', 'Sweet night', 'Dulce noche', 'Doce noite', '晚安'],
    ['Prochaine date', 'Next date', 'Próxima fecha', 'Próxima data', '下次日期'],
    ['Jour du cycle', 'Cycle day', 'Día del ciclo', 'Dia do ciclo', '周期第几天'],
    ['Fin douce ·', 'Gentle end ·', 'Fin suave ·', 'Fim suave ·', '预计结束 ·'],
    ['Bien-être seulement. Pas un avis médical.', 'Well-being only. Not medical advice.', 'Solo bienestar. No es consejo médico.', 'Apenas bem-estar. Não é conselho médico.', '仅供身心参考，非医疗建议。'],
    ['Jour {n} sur {c}', 'Day {n} of {c}', 'Día {n} de {c}', 'Dia {n} de {c}', '第 {n} 天 / 共 {c} 天'],
    ['Règles', 'Period', 'Regla', 'Menstruação', '经期'],
    ['Milieu de cycle', 'Mid-cycle', 'Mitad del ciclo', 'Meio do ciclo', '周期中段'],
    ['Avant le milieu', 'Before mid-cycle', 'Antes de la mitad', 'Antes do meio', '周期中段前'],
    ['Après le milieu', 'After mid-cycle', 'Después de la mitad', 'Depois do meio', '周期中段后'],
    ['Date de début dans le futur — jour non calculé', 'Start date in the future — day not calculated', 'Fecha de inicio en el futuro: día no calculado', 'Data de início no futuro — dia não calculado', '开始日期在未来——无法计算天数'],
    ['Indique le début des dernières règles', 'Enter the start of your last period', 'Indica el inicio de tu última regla', 'Informe o início da última menstruação', '请填写上次经期开始日期'],
    ['Date invalide', 'Invalid date', 'Fecha no válida', 'Data inválida', '日期无效'],
    ['Ta date est prête', 'Your date is ready', 'Tu fecha está lista', 'Sua data está pronta', '你的日期已算好'],
    ['Ta date est prête · non enregistrée', 'Your date is ready · not saved', 'Tu fecha está lista · no guardada', 'Sua data está pronta · não salva', '你的日期已算好 · 未保存'],

    // —— Forfaits (sans prix : les prix sont sur le Market) ——
    ['Astrologie', 'Astrology', 'Astrología', 'Astrologia', '占星'],
    ['Contenu verrouillé', 'Locked content', 'Contenido bloqueado', 'Conteúdo bloqueado', '内容已锁定'],
    ['Cet espace Astrologie demande un forfait actif.', 'This Astrology space needs an active plan.', 'Este espacio de Astrología requiere un plan activo.', 'Este espaço de Astrologia exige um plano ativo.', '占星空间需要有效的套餐。'],
    ['Cet espace Cycle menstruel demande un forfait actif.', 'This Menstrual cycle space needs an active plan.', 'Este espacio de Ciclo menstrual requiere un plan activo.', 'Este espaço de Ciclo menstrual exige um plano ativo.', '月经周期空间需要有效的套餐。'],
    ['Les forfaits sont proposés sur King Daveblessing Market.', 'Plans are offered on King Daveblessing Market.', 'Los planes se ofrecen en King Daveblessing Market.', 'Os planos são oferecidos no King Daveblessing Market.', '套餐在 King Daveblessing Market 上提供。'],
    ['Aucun forfait actif', 'No active plan', 'Ningún plan activo', 'Nenhum plano ativo', '暂无有效套餐'],
    ['Forfait Astrologie actif', 'Astrology plan active', 'Plan Astrología activo', 'Plano Astrologia ativo', '占星套餐已生效'],
    ['Forfait Cycle menstruel actif', 'Menstrual cycle plan active', 'Plan Ciclo menstrual activo', 'Plano Ciclo menstrual ativo', '月经周期套餐已生效'],
    ['Forfait Astro + Cycle actif', 'Astro + Cycle plan active', 'Plan Astro + Ciclo activo', 'Plano Astro + Ciclo ativo', '星象 + 周期套餐已生效'],
    ['Déverrouille Astro, le profil complet et la mission de vie.', 'Unlocks Astro, the full profile and life mission.', 'Desbloquea Astro, el perfil completo y la misión de vida.', 'Desbloqueia Astro, o perfil completo e a missão de vida.', '解锁星象、完整档案和人生使命。'],
    ['Déverrouille le cycle, le calculateur et le journal du jour.', 'Unlocks the cycle, the calculator and the daily journal.', 'Desbloquea el ciclo, la calculadora y el diario del día.', 'Desbloqueia o ciclo, a calculadora e o diário do dia.', '解锁周期、计算器和每日日志。'],
    ['Les deux espaces, dans la même application.', 'Both spaces, in the same app.', 'Los dos espacios, en la misma aplicación.', 'Os dois espaços, no mesmo aplicativo.', '两个空间，同一个应用。'],
    ['Astro + Cycle', 'Astro + Cycle', 'Astro + Ciclo', 'Astro + Ciclo', '星象 + 周期'],
    ['Choisir', 'Choose', 'Elegir', 'Escolher', '选择'],
    ['Aucun forfait n’est activé depuis cet écran.', 'No plan is activated from this screen.', 'Ningún plan se activa desde esta pantalla.', 'Nenhum plano é ativado nesta tela.', '此页面不会激活任何套餐。'],
    ['Voir le hub', 'See the hub', 'Ver el inicio', 'Ver o início', '查看主页'],
    ['Les forfaits se choisissent sur King Daveblessing Market', 'Plans are chosen on King Daveblessing Market', 'Los planes se eligen en King Daveblessing Market', 'Os planos são escolhidos no King Daveblessing Market', '请在 King Daveblessing Market 选择套餐'],

    // —— Consentement ——
    ['Tes données de cycle', 'Your cycle data', 'Tus datos de ciclo', 'Seus dados de ciclo', '你的周期数据'],
    ['Avant d’enregistrer, voici ce qui est gardé :', 'Before saving, here is what is kept:', 'Antes de guardar, esto es lo que se conserva:', 'Antes de salvar, veja o que é guardado:', '保存之前，以下是会被保存的内容：'],
    ['Tes dates de règles et la longueur de ton cycle.', 'Your period dates and cycle length.', 'Las fechas de tu regla y la duración de tu ciclo.', 'As datas da sua menstruação e a duração do seu ciclo.', '你的经期日期和周期长度。'],
    ['Ton journal du jour : humeur, sensations, énergie, note.', 'Your daily journal: mood, sensations, energy, note.', 'Tu diario del día: ánimo, sensaciones, energía, nota.', 'Seu diário do dia: humor, sensações, energia, nota.', '你的每日日志：心情、身体感受、能量、备注。'],
    ['Tout reste sur ce téléphone uniquement. Rien n’est envoyé sur un serveur.', 'Everything stays on this phone only. Nothing is sent to a server.', 'Todo se queda solo en este teléfono. Nada se envía a un servidor.', 'Tudo fica apenas neste telefone. Nada é enviado a um servidor.', '所有数据只保存在这部手机上，不会发送到任何服务器。'],
    ['Ce n’est pas un suivi médical.', 'This is not medical tracking.', 'No es un seguimiento médico.', 'Não é um acompanhamento médico.', '这不是医疗记录。'],
    ['Tu peux exporter ou supprimer ces données à tout moment dans Profil.', 'You can export or delete this data anytime in Profile.', 'Puedes exportar o borrar estos datos en cualquier momento en Perfil.', 'Você pode exportar ou apagar esses dados a qualquer momento no Perfil.', '你可以随时在个人资料中导出或删除这些数据。'],
    ['J’accepte', 'I accept', 'Acepto', 'Aceito', '我同意'],
    ['Non merci', 'No thanks', 'No, gracias', 'Não, obrigado', '不用了'],
    ['Merci · tes données restent sur ce téléphone', 'Thank you · your data stays on this phone', 'Gracias · tus datos se quedan en este teléfono', 'Obrigado · seus dados ficam neste telefone', '谢谢 · 你的数据只保存在这部手机上'],
    ['D’accord · rien n’est enregistré', 'OK · nothing is saved', 'De acuerdo · no se guarda nada', 'Tudo bem · nada é salvo', '好的 · 不会保存任何内容'],

    // —— Navigation ——
    ['Accueil', 'Home', 'Inicio', 'Início', '首页'],
    ['Journal', 'Journal', 'Diario', 'Diário', '日志'],
    ['Plus', 'More', 'Más', 'Mais', '更多'],
    ['Navigation principale', 'Main navigation', 'Navegación principal', 'Navegação principal', '主导航'],
  ];

  /* Paragraphes avec mise en forme (innerHTML), clé data-i18n-html. */
  const HTML = {
    disc2: {
      fr: 'Les informations sur le cycle, la Lune, l’astrologie et le chemin de vie sont proposées à titre <strong>informatif et de bien-être personnel</strong>.',
      en: 'Information about the cycle, the Moon, astrology and life path is offered <strong>for information and personal well-being only</strong>.',
      es: 'La información sobre el ciclo, la Luna, la astrología y el camino de vida se ofrece <strong>con fines informativos y de bienestar personal</strong>.',
      pt: 'As informações sobre o ciclo, a Lua, a astrologia e o caminho de vida são oferecidas <strong>a título informativo e de bem-estar pessoal</strong>.',
      zh: '关于周期、月亮、占星和生命灵数的信息<strong>仅供参考和个人身心健康之用</strong>。',
    },
    disc3: {
      fr: 'Elles ne constituent <strong>ni un diagnostic, ni un conseil médical, ni un moyen de contraception ou de conception</strong>.',
      en: 'It is <strong>not a diagnosis, not medical advice, and not a method of contraception or conception</strong>.',
      es: 'No constituye <strong>ni un diagnóstico, ni un consejo médico, ni un método anticonceptivo o de concepción</strong>.',
      pt: 'Não constitui <strong>diagnóstico, conselho médico, nem método contraceptivo ou de concepção</strong>.',
      zh: '这些信息<strong>不构成诊断、医疗建议，也不是避孕或备孕方法</strong>。',
    },
    q1: {
      fr: '1<sup>er</sup> quartier',
      en: '1<sup>st</sup> quarter',
      es: 'Cuarto creciente',
      pt: 'Quarto crescente',
      zh: '上弦月',
    },
  };

  const CODES = ['fr', 'en', 'es', 'pt', 'zh'];
  const DICT = Object.create(null);
  ROWS.forEach((r) => {
    const entry = {};
    CODES.forEach((c, i) => { entry[c] = r[i]; });
    DICT[r[0]] = entry;
  });

  /* —— Dates en toutes lettres (septembre 2026 dans chaque langue) —— */
  const MONTHS = {
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  };
  const WEEKDAYS = {
    fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    pt: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  };
  /* Lundi en premier. */
  const DOWS = {
    fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
    pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    zh: ['一', '二', '三', '四', '五', '六', '日'],
  };

  /**
   * formatDate(d, lang, { weekday, year, cap })
   * fr : « mercredi 23 septembre 2026 », « 1er septembre 2026 »
   */
  function formatDate(d, lang, opts) {
    opts = opts || {};
    const L = MONTHS[lang] ? lang : 'fr';
    const day = d.getDate();
    const m = MONTHS[L][d.getMonth()];
    const y = d.getFullYear();
    const wd = WEEKDAYS[L][d.getDay()];
    const withYear = opts.year !== false;
    let s;
    if (L === 'fr') {
      s = (day === 1 && opts.ordinal !== false ? '1er' : String(day)) + ' ' + m + (withYear ? ' ' + y : '');
      if (opts.weekday) s = wd + ' ' + s;
    } else if (L === 'en') {
      s = m + ' ' + day + (withYear ? ', ' + y : '');
      if (opts.weekday) s = wd + ', ' + s;
    } else if (L === 'es') {
      s = day + ' de ' + m + (withYear ? ' de ' + y : '');
      if (opts.weekday) s = wd + ', ' + s;
    } else if (L === 'pt') {
      s = day + ' de ' + m + (withYear ? ' de ' + y : '');
      if (opts.weekday) s = wd + ', ' + s;
    } else {
      s = (withYear ? y + '年' : '') + m + day + '日';
      if (opts.weekday) s = s + ' ' + wd;
    }
    if (opts.cap) s = s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  }

  window.CA_I18N = {
    LANGS: LANGS,
    CODES: CODES,
    DICT: DICT,
    HTML: HTML,
    MONTHS: MONTHS,
    WEEKDAYS: WEEKDAYS,
    DOWS: DOWS,
    formatDate: formatDate,
  };
})();
