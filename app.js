document.addEventListener('DOMContentLoaded', () => {
  // --- 状態管理 ---
  const state = {
    currentStep: 1,
    answers: {
      role: '',
      painPoint: '',
      priority: ''
    }
  };

  // --- 診断クイズのデータとロジック ---
  const toolsInfo = {
    spark: {
      name: 'Gemini Spark',
      desc: '24時間365日、あなたのスケジュール管理やメール処理を自動でサポートする専属アシスタント。',
      usecaseTitle: '💡 おすすめの活用方法',
      usecaseDesc: '「毎朝の未読メールから重要度の高いものをまとめて」「今日の空き時間でミーティングを設定して」と伝えるだけで、カレンダーやGmailと自律的に連携して処理を完了してくれます。'
    },
    gemini: {
      name: 'Gemini 3.5 Flash / Omni',
      desc: '超高速な処理速度と、テキスト・音声・画像に対応する強力なマルチモーダルAI。',
      usecaseTitle: '💡 おすすめの活用方法',
      usecaseDesc: '100ページを超える業界のPDFレポートや競合企業の決算資料をドラッグ＆ドロップし、「要点を3つのスライド構成にまとめて」と頼むことで、リサーチと構成案作成を秒速で完了させます。'
    },
    docs: {
      name: 'Docs Live',
      desc: 'Googleドキュメント内で、あなたの文脈やスタイルを理解してリアルタイムに共同執筆するAI。',
      usecaseTitle: '💡 おすすめの活用方法',
      usecaseDesc: '「新商品のキャンペーン企画書の骨子を作成して」と入力し、AIと会話しながらリアルタイムで推敲・加筆を進めることで、ドキュメント作成の時間を大幅に削減します。'
    },
    youtube: {
      name: 'Ask YouTube',
      desc: '長尺の動画やセミナーから、欲しい情報だけをピンポイントで引き出す対話型動画検索。',
      usecaseTitle: '💡 おすすめの活用方法',
      usecaseDesc: '海外の最新技術発表や競合の解説動画のURLを入力し、「この動画で話されている最新動向の結論は何か？」「該当する具体的な発言はどの部分か？」と質問するだけで、動画全体を見る手間を省きます。'
    }
  };

  const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    result: document.getElementById('step-result')
  };

  // オプションボタンのイベントリスナー
  document.querySelectorAll('.quiz-step .option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const currentStepEl = btn.closest('.quiz-step');
      const stepNum = parseInt(currentStepEl.dataset.step);
      const val = btn.dataset.value;

      // 答えの保存
      if (stepNum === 1) state.answers.role = val;
      if (stepNum === 2) state.answers.painPoint = val;
      if (stepNum === 3) state.answers.priority = val;

      goToStep(stepNum + 1);
    });
  });

  // ステップ移動処理
  function goToStep(nextStep) {
    // 現在のステップを非表示に
    const currentStepEl = steps[state.currentStep] || steps['result'];
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
    }

    // 次のステップの準備
    state.currentStep = nextStep;

    if (nextStep <= 3) {
      steps[nextStep].classList.add('active');
    } else {
      // 結果の判定と表示
      showResult();
    }
  }

  // 結果の判定
  function showResult() {
    let recommendedKey = 'spark'; // デフォルト

    const { painPoint, priority } = state.answers;

    // 診断ロジック
    if (painPoint === 'email') {
      recommendedKey = 'spark';
    } else if (painPoint === 'document') {
      recommendedKey = 'docs';
    } else if (painPoint === 'research') {
      if (priority === 'speed') {
        recommendedKey = 'gemini';
      } else {
        recommendedKey = 'youtube';
      }
    } else if (painPoint === 'ideas') {
      recommendedKey = 'gemini';
    }

    const tool = toolsInfo[recommendedKey];

    // DOMへの結果反映
    document.getElementById('result-tool-name').textContent = tool.name;
    document.getElementById('result-tool-desc').textContent = tool.desc;
    document.getElementById('result-usecase-title').textContent = tool.usecaseTitle;
    document.getElementById('result-usecase-desc').textContent = tool.usecaseDesc;

    steps.result.classList.add('active');
  }

  // 再診断ボタン
  const restartBtn = document.getElementById('btn-restart-quiz');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.currentStep = 1;
      state.answers = { role: '', painPoint: '', priority: '' };
      
      // クラスのクリーンアップ
      steps.result.classList.remove('active');
      steps[1].classList.add('active');
    });
  }

  // --- FAQアコーディオン ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerEl = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // 他の開いているアコーディオンを閉じる（オプション）
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        answerEl.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      }
    });
  });

  // --- スクロールアニメーション (Intersection Observer) ---
  const reveals = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // 一度表示されたら監視を終了
      }
    });
  }, observerOptions);

  reveals.forEach(el => revealObserver.observe(el));

  // --- AIモデル性能比較グラフ（ツールチップ制御） ---
  const chartDots = document.querySelectorAll('.chart-dot');
  const tooltip = document.getElementById('chart-tooltip');

  chartDots.forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      const model = dot.getAttribute('data-model');
      const speed = dot.getAttribute('data-speed');
      const intel = dot.getAttribute('data-intel');
      const desc = dot.getAttribute('data-desc');

      document.getElementById('tooltip-model').textContent = model;
      document.getElementById('tooltip-speed').textContent = speed;
      document.getElementById('tooltip-intel').textContent = intel;
      document.getElementById('tooltip-desc').textContent = desc;

      // 位置計算
      const container = document.getElementById('perf-chart-container');
      const containerRect = container.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();

      tooltip.classList.add('active');

      const leftPos = (dotRect.left - containerRect.left) + (dotRect.width / 2) - (tooltip.offsetWidth / 2);
      const topPos = (dotRect.top - containerRect.top) - tooltip.offsetHeight - 12;

      tooltip.style.left = `${leftPos}px`;
      tooltip.style.top = `${topPos}px`;
    });

    dot.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
    });
  });

  // --- 料金プラン（タブ切り替え制御） ---
  const pricingTabs = document.querySelectorAll('.pricing-tab-btn');
  const pricingContents = document.querySelectorAll('.pricing-content');

  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      // タブのactive状態の更新
      pricingTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // コンテンツのactive状態の更新
      pricingContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // --- ハンバーガーメニュー制御 ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      // メニューが開いているときはスクロールをロック
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // リンクをクリックしたときにメニューを閉じる
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
});

// ==========================================================================
// AutoManual AI 用の JavaScript ロジック (グローバルスコープ)
// ==========================================================================
let apiKey = ""; // 実行環境で注入されるか、localStorageから読み込まれます

const SUPPORTED_LANGS = {
    'ja': '日本語',
    'en': 'English',
    'zh': '中文 (簡体字)',
    'ko': '한국어',
    'vi': 'Tiếng Việt',
    'es': 'Español',
    'fr': 'Français',
    'id': 'Bahasa Indonesia',
    'th': 'ภาษาไทย',
    'pt': 'Português'
};

let currentLang = 'ja';
let availableLangs = new Set(['ja']);
let manualData = { 'ja': { title: 'マニュアル', subtitle: '説明動画' } };

let steps = []; 
let referenceFiles = []; 
let currentVideoName = "manual";
let currentVideoFile = null; 
let extractingStepId = null; 
let draggedItemIndex = null; 

let editor = {
    stepId: null,
    baseCanvas: null,
    baseCtx: null,
    drawCanvas: null,
    drawCtx: null,
    mode: 'pen',
    color: '#ff0000',
    isDrawing: false,
    startX: 0,
    startY: 0,
    savedImageData: null
};

let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let recordingTimeout;
let extractAudioCtx = null;
let extractMediaSource = null;
let extractAudioDest = null;

document.addEventListener("DOMContentLoaded", () => {
    initLangSelector();
    lucide.createIcons();
    initImageEditor();
    
    // APIキーのロードと保存UIの処理
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        apiKey = savedKey;
        const input = document.getElementById('api-key-input');
        if (input) input.value = savedKey;
    }

    const saveBtn = document.getElementById('save-api-key-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const input = document.getElementById('api-key-input');
            if (input) {
                const key = input.value.trim();
                localStorage.setItem('gemini_api_key', key);
                apiKey = key;
                showMessage("設定保存", "APIキーをブラウザに保存しました。");
            }
        });
    }

    const toggleBtn = document.getElementById('toggle-api-key-visibility');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = document.getElementById('api-key-input');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleBtn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
                } else {
                    input.type = 'password';
                    toggleBtn.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
                }
                lucide.createIcons();
            }
        });
    }
    
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropZone.addEventListener(eventName, preventDefaults, false);
      });
      function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
      ['dragenter', 'dragover'].forEach(eventName => {
          dropZone.addEventListener(eventName, () => dropZone.classList.add('bg-blue-50', 'border-blue-500'), false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
          dropZone.addEventListener(eventName, () => dropZone.classList.remove('bg-blue-50', 'border-blue-500'), false);
      });
      dropZone.addEventListener('drop', handleDrop, false);
    }
});

function initLangSelector() {
    const selector = document.getElementById('lang-selector');
    if (selector) {
      selector.innerHTML = '';
      for (const [code, name] of Object.entries(SUPPORTED_LANGS)) {
          selector.innerHTML += `<option value="${code}">${name}</option>`;
      }
    }
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
        processVideo(files[0]);
    } else {
        showMessage("エラー", "動画ファイルを選択してください。");
    }
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processVideo(file);
    }
}

async function processVideo(file) {
    if (!apiKey || apiKey.trim() === "") {
        showMessage("APIキー未設定", "動画の解析にはGemini APIキーが必要です。「Gemini APIキー」入力欄に正しいキーを入力し、保存してから再度お試しください。");
        return;
    }
    currentVideoName = file.name.split('.')[0] || "manual";
    manualData['ja'].title = currentVideoName;
    currentVideoFile = file;
    showView('loading-view');

    try {
        updateProgress("動画から解析用フレームを抽出中...", 10);
        const analysisFrames = await extractFramesForAnalysis(file, 50);

        updateProgress("AIが動画全体の流れから手順と説明文を解析中...", 40);
        const aiSteps = await analyzeVideoForStepsLocal(analysisFrames);
        
        if (!aiSteps || aiSteps.length === 0) throw new Error("AIがシーンを抽出できませんでした。");

        const timestamps = aiSteps.map(s => s.time);

        updateProgress(`AIが指定したシーン(${timestamps.length}枚)の画像を抽出中...`, 60);
        const frames = await extractFramesAtTimestamps(file, timestamps, (current, total, time) => {
            const descEl = document.getElementById('loading-desc');
            if (descEl) descEl.textContent = `AIが指定したシーンの画像を抽出中... (${current}/${total}枚完了) - ${time}秒時点`;
        });

        updateProgress("マニュアルデータを構築中...", 80);
        steps = [];
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const originalStep = aiSteps.find(s => s.time === frame.originalTime);
            const description = originalStep ? originalStep.description : "";
            
            steps.push({
                id: Date.now() + i,
                type: 'image',
                source: frame.dataUrl,
                texts: { 'ja': description }, 
                videoVolume: 1.0,
                ttsVolume: 1.0
            });
        }

        updateProgress("マニュアル全体のタイトルをAIで生成中...", 95);
        const stepsTextForTitle = steps.map(s => s.texts['ja']).join('\n');
        manualData['ja'].title = await generateManualTitle(stepsTextForTitle);

        updateProgress("マニュアル作成完了！", 100);
        setTimeout(() => {
            showView('editor-view');
            switchLanguage('ja'); 
            renderReferences();
        }, 500);

    } catch (error) {
        console.error("Video processing error:", error);
        showMessage("エラー", error.message || "動画の解析中にエラーが発生しました。");
        showView('upload-view');
    }
}

function switchLanguage(lang) {
    currentLang = lang;
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = lang;
    
    let hasTranslation = false;
    if (steps.length > 0 && steps[0].texts[lang]) {
        hasTranslation = true;
    }
    
    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn) {
      if (lang !== 'ja' && !hasTranslation) {
          translateBtn.classList.remove('hidden');
      } else {
          translateBtn.classList.add('hidden');
      }
    }
    
    renderSteps();
}

async function translateAllSteps() {
    if (currentLang === 'ja') return;
    showMessage("翻訳中", `${SUPPORTED_LANGS[currentLang]} にAIが一括翻訳しています...`, true);
    
    const requestData = {
        title: manualData['ja'].title,
        subtitle: manualData['ja'].subtitle,
        steps: steps.map(s => s.texts['ja'] || '')
    };
    
    const prompt = `以下のJSON形式のデータを ${SUPPORTED_LANGS[currentLang]} に翻訳してください。出力は必ず元の構造を保ったJSON形式のみとしてください。\n\n${JSON.stringify(requestData)}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    };
    
    try {
        const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, payload);
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("翻訳結果が空です");
        
        let parsed = JSON.parse(text);
        if (parsed.title) {
            manualData[currentLang] = { title: parsed.title, subtitle: parsed.subtitle || 'Tutorial Video' };
        }
        if (parsed.steps && Array.isArray(parsed.steps)) {
            parsed.steps.forEach((t, i) => {
                if (steps[i]) steps[i].texts[currentLang] = t;
            });
        }
        
        availableLangs.add(currentLang);
        const translateBtn = document.getElementById('translate-btn');
        if (translateBtn) translateBtn.classList.add('hidden');
        renderSteps();
        closeMessage();
    } catch (e) {
        console.error("Translate error:", e);
        closeMessage();
        showMessage("エラー", "翻訳に失敗しました。");
    }
}

async function rewriteStepText(stepId, mode) {
    const step = steps.find(s => s.id === stepId);
    const currentText = step?.texts[currentLang];
    if (!step || !currentText) return;
    
    showMessage("AI推敲中", "AIが文章を書き直しています...", true);
    
    const modeText = mode === 'detailed' ? 'もっと詳しく具体的に（初心者向けに丁寧に）' : 'もっと短く簡潔に（要点だけを短く）';
    const prompt = `以下のマニュアルの操作手順の文章を、「${modeText}」書き直してください。元の意味や操作内容は変えないでください。言語は ${SUPPORTED_LANGS[currentLang]} で出力してください。出力は書き直したテキストのみとしてください。\n\n【元の文章】\n${currentText}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
    };
    
    try {
        const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, payload);
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if(text) {
            step.texts[currentLang] = text.trim();
            renderSteps();
        }
        closeMessage();
    } catch (e) {
        console.error("Rewrite error:", e);
        closeMessage();
        showMessage("エラー", "書き直しに失敗しました。");
    }
}

async function extractFramesForAnalysis(videoFile, maxFrames) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;
        video.playsInline = true;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = [];
        
        video.onloadeddata = async () => {
            const duration = video.duration;
            const interval = Math.max(duration / maxFrames, 0.5); 
            
            const scale = Math.min(512 / video.videoWidth, 1);
            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;
            
            for (let time = 0; time <= duration; time += interval) {
                video.currentTime = time;
                await new Promise((res) => { video.onseeked = res; });
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
                frames.push({ time: Number(time.toFixed(1)), dataUrl: dataUrl });
            }
            
            URL.revokeObjectURL(video.src);
            resolve(frames);
        };
        
        video.onerror = () => reject(new Error("動画の読み込みに失敗しました"));
        video.load();
    });
}

async function analyzeVideoForStepsLocal(frames) {
    const prompt = `提供された複数の画像は、操作手順を記録した動画から抽出した時系列のフレームです。各画像の直前に「タイムスタンプ: X秒」と記載しています。
初心者向けの分かりやすいマニュアルを作成するために、以下の指示に従ってJSON形式で出力してください。

1. **ステップの抽出**: 画面の大きな遷移、主要なボタンのクリック、重要な文字入力など、操作の区切りとなる重要なシーン（タイムスタンプ）を抽出してください。細かすぎるマウスの移動などは省き、意味のある手順のまとまりごとに抽出してください。
2. **丁寧で詳細な説明文**: 各シーンの説明文は、「画面のどの部分にある」「どんな要素を」「どのように操作するのか」を具体的に記述してください。また、その操作によって「どのような結果になるのか」、あるいは「操作の目的や注意点」も補足するなど、1ステップあたり3〜5文程度で、初心者にも分かりやすく充実した説明文を作成してください。
3. **出力形式**: 以下のようなJSON配列のみを出力してください。

[
  { "time": 1.5, "description": "ログイン画面が表示されます。画面中央の入力フォームに、登録済みのユーザーIDとパスワードをそれぞれ入力します。パスワードは伏字で表示されるので入力間違いに注意してください。" },
  { "time": 4.0, "description": "入力が完了したら、フォーム下部にある青い「ログイン」ボタンをクリックします。認証が完了すると自動的にダッシュボード画面へ遷移しますので、しばらくお待ちください。" },
  { "time": 8.2, "description": "ダッシュボード画面が表示されました。ここでは全体の状況を確認することができます。画面左側のメニュー一覧から「新規作成」の項目をクリックして、作成画面を開きましょう。" }
]`;
    
    const parts = [{ text: prompt }];
    frames.forEach(frame => {
        parts.push({ text: `タイムスタンプ: ${frame.time}秒` });
        const base64Data = frame.dataUrl.split(',')[1];
        parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
    });

    const payload = {
        contents: [{ role: "user", parts: parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    };

    const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, payload);
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    
    try {
        let parsed = JSON.parse(text);
        if (!Array.isArray(parsed) && typeof parsed === 'object') {
            const keys = Object.keys(parsed);
            for(const key of keys) {
                if(Array.isArray(parsed[key])) { parsed = parsed[key]; break; }
            }
        }
        
        if (Array.isArray(parsed)) {
            return parsed.map(item => ({
                time: Number(item.time) || 0,
                description: item.description || item.desc || item.text || ""
            }));
        }
        return null;
    } catch (e) {
        console.error("JSON parse error:", e, text);
        return null;
    }
}

async function generateManualTitle(stepsText) {
    const prompt = `以下のマニュアルの操作手順から、このマニュアル全体の適切なタイトルを推測し、15文字以内で作成してください。出力はタイトルのみとしてください。\n\n${stepsText}`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
    };
    try {
        const response = await fetchWithRetry(url => `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, payload);
        let text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if(text) {
            text = text.replace(/["'「」『』\n]/g, '').trim();
            if(text.length > 20) text = text.substring(0, 20);
            return text;
        }
    } catch(e) { console.error("Title generation failed:", e); }
    return currentVideoName;
}

async function extractFramesAtTimestamps(videoFile, timestamps, onProgress) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;
        video.playsInline = true;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = [];
        
        video.onloadedmetadata = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;
            
            let targetTimes = timestamps
                .filter(t => typeof t === 'number' && !isNaN(t) && t >= 0 && t <= duration)
                .map(t => ({
                    originalTime: t,
                    targetTime: t < 0.5 ? Math.min(1.0, duration) : t
                }));

            const uniqueTargets = [];
            const seen = new Set();
            for (const item of targetTimes) {
                if (!seen.has(item.targetTime)) {
                    seen.add(item.targetTime);
                    uniqueTargets.push(item);
                }
            }
            uniqueTargets.sort((a, b) => a.targetTime - b.targetTime);

            for (let i = 0; i < uniqueTargets.length; i++) {
                const { originalTime, targetTime } = uniqueTargets[i];
                const time = targetTime;
                
                try {
                    if (video.currentTime !== time) {
                        video.currentTime = time;
                        await new Promise((res) => {
                            const onSeeked = () => {
                                video.removeEventListener('seeked', onSeeked);
                                clearTimeout(timeout);
                                res();
                            };
                            video.addEventListener('seeked', onSeeked);
                            const timeout = setTimeout(() => {
                                video.removeEventListener('seeked', onSeeked);
                                res();
                            }, 10000);
                        });
                    }

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push({ time: video.currentTime, originalTime: originalTime, dataUrl: dataUrl });
                    
                    if (onProgress) onProgress(i + 1, uniqueTargets.length, time);
                } catch (err) { console.error(`フレーム抽出エラー (${time}秒):`, err); }
            }
            
            URL.revokeObjectURL(video.src);
            resolve(frames);
        };
        
        video.onerror = () => reject(new Error("動画の読み込みに失敗しました"));
        video.load();
    });
}

function handleReferenceUpload(event) {
    const files = Array.from(event.target.files);
    referenceFiles.push(...files);
    renderReferences();
    event.target.value = '';
}

function removeReference(index) {
    referenceFiles.splice(index, 1);
    renderReferences();
}

function renderReferences() {
    const container = document.getElementById('references-container');
    if (!container) return;
    container.innerHTML = '';
    if (referenceFiles.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 italic">参考資料は添付されていません。必要に応じてPDFやExcelファイルなどを追加してください。</p>';
        return;
    }
    referenceFiles.forEach((file, index) => {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        container.innerHTML += `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div class="flex items-center gap-2 overflow-hidden">
                    <i data-lucide="file-text" class="w-4 h-4 text-slate-500 flex-shrink-0"></i>
                    <span class="font-medium text-slate-700 truncate">${escapeHtml(file.name)}</span>
                    <span class="text-slate-400">(${sizeMb} MB)</span>
                </div>
                <button onclick="removeReference(${index})" class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors" title="この資料を削除">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        `;
    });
    lucide.createIcons();
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function initImageEditor() {
    editor.baseCanvas = document.getElementById('base-canvas');
    if (!editor.baseCanvas) return;
    editor.baseCtx = editor.baseCanvas.getContext('2d');
    editor.drawCanvas = document.getElementById('drawing-canvas');
    editor.drawCtx = editor.drawCanvas.getContext('2d');

    const startHandler = (e) => startDrawing(e);
    const moveHandler = (e) => draw(e);
    const endHandler = (e) => stopDrawing(e);

    editor.drawCanvas.addEventListener('mousedown', startHandler);
    editor.drawCanvas.addEventListener('mousemove', moveHandler);
    editor.drawCanvas.addEventListener('mouseup', endHandler);
    editor.drawCanvas.addEventListener('mouseout', endHandler);
    editor.drawCanvas.addEventListener('touchstart', startHandler, {passive: false});
    editor.drawCanvas.addEventListener('touchmove', moveHandler, {passive: false});
    editor.drawCanvas.addEventListener('touchend', endHandler);
}

function openImageEditor(stepId) {
    const step = steps.find(s => s.id === stepId);
    if (!step || !step.source) return;

    editor.stepId = stepId;
    const modal = document.getElementById('image-editor-modal');
    modal.classList.remove('hidden');

    const img = new Image();
    img.onload = () => {
        editor.baseCanvas.width = img.width;
        editor.baseCanvas.height = img.height;
        editor.drawCanvas.width = img.width;
        editor.drawCanvas.height = img.height;
        editor.baseCtx.drawImage(img, 0, 0);
        editor.drawCtx.clearRect(0, 0, img.width, img.height);
        updateCtxSettings();
        editor.savedImageData = editor.drawCtx.getImageData(0, 0, img.width, img.height);
    };
    img.src = step.source;
}

function updateCtxSettings() {
    if (!editor.drawCtx) return;
    editor.drawCtx.strokeStyle = editor.color;
    editor.drawCtx.lineWidth = 6;
    editor.drawCtx.lineCap = 'round';
    editor.drawCtx.lineJoin = 'round';
}

function getMousePos(evt) {
    const rect = editor.drawCanvas.getBoundingClientRect();
    const scaleX = editor.drawCanvas.width / rect.width;
    const scaleY = editor.drawCanvas.height / rect.height;
    let clientX = evt.clientX;
    let clientY = evt.clientY;
    if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function startDrawing(e) {
    e.preventDefault();
    editor.isDrawing = true;
    const pos = getMousePos(e);
    editor.startX = pos.x;
    editor.startY = pos.y;
    editor.savedImageData = editor.drawCtx.getImageData(0, 0, editor.drawCanvas.width, editor.drawCanvas.height);
    if (editor.mode === 'pen') {
        editor.drawCtx.beginPath();
        editor.drawCtx.moveTo(editor.startX, editor.startY);
    }
}

function draw(e) {
    if (!editor.isDrawing) return;
    e.preventDefault();
    const pos = getMousePos(e);
    updateCtxSettings();
    if (editor.mode === 'pen') {
        editor.drawCtx.lineTo(pos.x, pos.y);
        editor.drawCtx.stroke();
    } else if (editor.mode === 'rect') {
        editor.drawCtx.putImageData(editor.savedImageData, 0, 0);
        editor.drawCtx.beginPath();
        editor.drawCtx.rect(editor.startX, editor.startY, pos.x - editor.startX, pos.y - editor.startY);
        editor.drawCtx.stroke();
    }
}

function stopDrawing(e) { editor.isDrawing = false; }

function setDrawMode(mode) {
    editor.mode = mode;
    const penEl = document.getElementById('tool-pen');
    const rectEl = document.getElementById('tool-rect');
    if (penEl && rectEl) {
      penEl.classList.toggle('bg-blue-100', mode === 'pen');
      penEl.classList.toggle('text-blue-600', mode === 'pen');
      penEl.classList.toggle('text-slate-600', mode !== 'pen');
      rectEl.classList.toggle('bg-blue-100', mode === 'rect');
      rectEl.classList.toggle('text-blue-600', mode === 'rect');
      rectEl.classList.toggle('text-slate-600', mode !== 'rect');
    }
}

function setDrawColor(color) {
    editor.color = color;
    const picker = document.getElementById('color-picker');
    if (picker) picker.value = color;
    updateCtxSettings();
}

function clearCanvasDrawings() {
    if(!editor.drawCanvas) return;
    editor.drawCtx.clearRect(0, 0, editor.drawCanvas.width, editor.drawCanvas.height);
}

function closeImageEditor() {
    const modal = document.getElementById('image-editor-modal');
    if (modal) modal.classList.add('hidden');
    editor.stepId = null;
}

function saveEditedImage() {
    if (!editor.stepId) return;
    editor.baseCtx.drawImage(editor.drawCanvas, 0, 0);
    const step = steps.find(s => s.id === editor.stepId);
    if (step) {
        step.source = editor.baseCanvas.toDataURL('image/jpeg', 0.9);
        renderSteps();
    }
    closeImageEditor();
}

async function generateDescriptionForStep(stepId) {
    const step = steps.find(s => s.id === stepId);
    if (!step || !step.source) return;

    if (step.type === 'video') {
        showMessage("通知", "動画からの自動説明文生成は現在サポートしていません。手動で入力してください。");
        return;
    }

    showMessage("AI生成中", "画像から説明文を考えています...", true);

    try {
        const newText = await generateTextFromImage(step.source, stepId);
        step.texts[currentLang] = newText;
        availableLangs.add(currentLang);
        renderSteps();
        closeMessage();
    } catch (e) {
        console.error(e);
        closeMessage();
        showMessage("エラー", "説明文の生成に失敗しました。");
    }
}

async function generateTextFromImage(base64Image, targetStepId = null) {
    const base64Data = base64Image.split(',')[1];
    let contextText = "";
    if (targetStepId) {
        const otherSteps = steps.filter(s => s.id !== targetStepId && s.texts[currentLang] && s.texts[currentLang].trim() !== "");
        if (otherSteps.length > 0) {
            contextText = `\n\n参考として、同じマニュアル内の他のステップでは以下のような説明文が書かれています。表現のトーン＆マナーや書式をこれらに合わせてください：\n`;
            otherSteps.slice(0, 5).forEach((s) => { contextText += `- ${s.texts[currentLang]}\n`; });
        }
    }

    const prompt = `あなたは優秀なマニュアル作成アシスタントです。提供された画像は、ソフトウェアまたは機器の操作手順を記録した動画の1フレーム、またはスクリーンショットです。
この画像から推測される具体的な操作手順を、マニュアルの1ステップとして簡潔かつ丁寧に記述してください。
「画面のどの部分の」「何を」「どうするのか」が分かるように具体的に記述し、2〜4文程度の丁寧な説明文にしてください。
必ず ${SUPPORTED_LANGS[currentLang]} で出力してください。${contextText}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }],
        generationConfig: { temperature: 0.2 }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    try {
        const response = await fetchWithRetry(url, payload);
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? text.trim() : "（画像を解析して説明文を生成できませんでした。手動で入力してください。）";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

async function generateTTS(text) {
    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
        },
        model: "gemini-2.5-flash-preview-tts"
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    try {
        const response = await fetchWithRetry(url, payload);
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        console.error("TTS API Error:", error);
        return null;
    }
}

function base64ToAudioBuffer(base64, audioCtx) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const int16Array = new Int16Array(bytes.buffer);
    const sampleRate = 24000; 
    const audioBuffer = audioCtx.createBuffer(1, int16Array.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < int16Array.length; i++) channelData[i] = int16Array[i] / 32768.0;
    return audioBuffer;
}

async function fetchWithRetry(url, payload, retries = 5) {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delays[i]));
        }
    }
}

function updateStepVolume(id, type, value) {
    const step = steps.find(s => s.id === id);
    if (step) {
        if (type === 'video') step.videoVolume = parseFloat(value);
        if (type === 'tts') step.ttsVolume = parseFloat(value);
    }
}

function renderSteps() {
    const container = document.getElementById('steps-container');
    if (!container) return;
    container.innerHTML = '';

    if (steps.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p class="text-slate-500">ステップがありません。「ステップ追加」ボタンから追加してください。</p>
            </div>
        `;
        return;
    }

    steps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        stepEl.className = "bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md group";
        
        stepEl.addEventListener('dragstart', (e) => {
            draggedItemIndex = index;
            setTimeout(() => stepEl.classList.add('opacity-40', 'border-blue-400', 'border-dashed'), 0);
        });
        stepEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedItemIndex !== index) stepEl.classList.add('border-blue-500', 'border-2');
        });
        stepEl.addEventListener('dragleave', (e) => { stepEl.classList.remove('border-blue-500', 'border-2'); });
        stepEl.addEventListener('drop', (e) => {
            e.preventDefault();
            stepEl.classList.remove('border-blue-500', 'border-2');
            if (draggedItemIndex !== null && draggedItemIndex !== index) {
                const item = steps.splice(draggedItemIndex, 1)[0];
                steps.splice(index, 0, item);
                renderSteps();
            }
        });
        stepEl.addEventListener('dragend', () => {
            stepEl.classList.remove('opacity-40', 'border-blue-400', 'border-dashed');
            draggedItemIndex = null;
            stepEl.draggable = false;
        });
        
        let mediaHtml = `<div class="w-full h-full min-h-[200px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                 <i data-lucide="image" class="w-10 h-10 mb-2 opacity-50"></i>
                 <span class="text-sm">画像/動画なし</span>
               </div>`;
        
        if (step.source) {
            if (step.type === 'video') {
                mediaHtml = `<video src="${step.source}" controls playsinline class="w-full h-full object-contain bg-slate-100 z-0"></video>`;
            } else {
                mediaHtml = `<img src="${step.source}" class="w-full h-full object-contain bg-slate-100 pointer-events-none" alt="Step ${index + 1} Image">`;
            }
        }

        const currentText = step.texts[currentLang] || '';

        stepEl.innerHTML = `
            <div class="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 relative bg-slate-50 min-h-[200px] overflow-hidden group/media">
                ${mediaHtml}
                <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/media:opacity-100 transition-opacity z-10">
                    <label class="cursor-pointer bg-white text-slate-600 hover:text-blue-600 p-2 rounded-lg shadow-md border border-slate-200 transition-colors" title="ファイルから画像/動画を選択">
                        <i data-lucide="upload" class="w-4 h-4"></i>
                        <input type="file" class="hidden" accept="image/*,video/mp4,video/webm" onchange="updateStepImage(event, ${step.id})">
                    </label>
                    <button onclick="openVideoExtractModal(${step.id})" class="cursor-pointer bg-white text-slate-600 hover:text-purple-600 p-2 rounded-lg shadow-md border border-slate-200 transition-colors" title="動画からフレーム/動画を切り出し">
                        <i data-lucide="scissors" class="w-4 h-4"></i>
                    </button>
                    ${step.source && step.type !== 'video' ? `
                    <button onclick="openImageEditor(${step.id})" class="cursor-pointer bg-white text-slate-600 hover:text-green-600 p-2 rounded-lg shadow-md border border-slate-200 transition-colors" title="画像に図形などを描画">
                        <i data-lucide="pen-tool" class="w-4 h-4"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="w-full md:w-7/12 p-5 flex flex-col">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="drag-handle cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1 -ml-2" title="ドラッグして並び替え">
                            <i data-lucide="grip-vertical" class="w-5 h-5 pointer-events-none"></i>
                        </div>
                        <span class="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm">${index + 1}</span>
                        <h3 class="font-bold text-slate-700">操作手順 ${index + 1}</h3>
                        ${step.type === 'video' ? `<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium flex items-center gap-1"><i data-lucide="video" class="w-3 h-3"></i>動画</span>` : ''}
                    </div>
                    <div class="flex gap-2">
                        ${step.source && step.type !== 'video' ? `
                        <button onclick="generateDescriptionForStep(${step.id})" class="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="AIで説明文を自動生成">
                            <i data-lucide="wand-2" class="w-5 h-5"></i>
                        </button>
                        ` : ''}
                        <button onclick="deleteStep(${step.id})" class="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors" title="このステップを削除">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
                <textarea 
                    oninput="updateStepText(${step.id}, this.value)" 
                    class="flex-grow w-full border border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none bg-slate-50 focus:bg-white" 
                    rows="5" 
                    placeholder="この言語（${SUPPORTED_LANGS[currentLang]}）での操作内容を入力してください...">${escapeHtml(currentText)}</textarea>
                    
                <!-- AI 推敲ボタン -->
                <div class="flex justify-end gap-3 mt-2">
                    <button onclick="rewriteStepText(${step.id}, 'detailed')" class="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"><i data-lucide="sparkles" class="w-3 h-3"></i> 詳しくする</button>
                    <button onclick="rewriteStepText(${step.id}, 'concise')" class="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"><i data-lucide="minimize-2" class="w-3 h-3"></i> 簡潔にする</button>
                </div>
                    
                <!-- 動画の場合の音量コントロールUI -->
                ${step.type === 'video' ? `
                <div id="volume-control-${step.id}" class="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200 transition-opacity ${!currentText || currentText.trim() === '' ? 'opacity-50 pointer-events-none' : ''}">
                    <p class="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><i data-lucide="volume-2" class="w-3.5 h-3.5"></i> 動画出力時の音量バランス</p>
                    <div class="flex items-center gap-4">
                        <div class="flex-1">
                            <label class="text-xs text-slate-500 mb-1 block">動画元の音声</label>
                            <input type="range" min="0" max="1" step="0.1" value="${step.videoVolume !== undefined ? step.videoVolume : 1.0}" onchange="updateStepVolume(${step.id}, 'video', this.value)" class="w-full accent-blue-600">
                        </div>
                        <div class="flex-1">
                            <label class="text-xs text-slate-500 mb-1 block">AI音声 (TTS)</label>
                            <input type="range" min="0" max="1" step="0.1" value="${step.ttsVolume !== undefined ? step.ttsVolume : 1.0}" onchange="updateStepVolume(${step.id}, 'tts', this.value)" class="w-full accent-purple-600">
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        container.appendChild(stepEl);

        const dragHandle = stepEl.querySelector('.drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', () => { stepEl.draggable = true; });
            dragHandle.addEventListener('mouseup', () => { stepEl.draggable = false; });
            dragHandle.addEventListener('mouseleave', () => { stepEl.draggable = false; });
        }
    });

    lucide.createIcons();
}

function addStep() {
    steps.push({
        id: Date.now(),
        type: 'image',
        source: '',
        texts: {},
        videoVolume: 1.0,
        ttsVolume: 1.0
    });
    renderSteps();
    const container = document.getElementById('automanual');
    if (container) {
      window.scrollTo({ top: container.offsetTop + container.offsetHeight, behavior: 'smooth' });
    }
}

function deleteStep(id) {
    steps = steps.filter(step => step.id !== id);
    renderSteps();
}

function updateStepText(id, newText) {
    const step = steps.find(s => s.id === id);
    if (step) {
        step.texts[currentLang] = newText;
        availableLangs.add(currentLang);

        if (step.type === 'video') {
            const volumeControl = document.getElementById(`volume-control-${id}`);
            if (volumeControl) {
                if (!newText || newText.trim() === '') {
                    volumeControl.classList.add('opacity-50', 'pointer-events-none');
                } else {
                    volumeControl.classList.remove('opacity-50', 'pointer-events-none');
                }
            }
        }
    }
}

function updateStepImage(event, id) {
    const file = event.target.files[0];
    if (file) {
        const isVideo = file.type.startsWith('video/');
        if (isVideo && file.size > 10 * 1024 * 1024) {
            showMessage("エラー", "動画サイズが大きすぎます。10MB以下の短い動画を選択してください。");
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const step = steps.find(s => s.id === id);
            if (step) {
                step.type = isVideo ? 'video' : 'image';
                step.source = e.target.result;
                if (isVideo) {
                    step.videoVolume = 1.0;
                    step.ttsVolume = 1.0;
                }
                renderSteps();
            }
        };
        reader.readAsDataURL(file);
    }
}

function openVideoExtractModal(stepId) {
    if (!currentVideoFile) {
        showMessage("エラー", "元の動画データがありません。動画をアップロードし直してください。");
        return;
    }
    
    extractingStepId = stepId;
    const modal = document.getElementById('video-extract-modal');
    const video = document.getElementById('extract-video-player');
    
    if (isRecording) stopRecording();
    if (video && !video.src) video.src = URL.createObjectURL(currentVideoFile);
    
    if (modal) modal.classList.remove('hidden');
}

function closeVideoExtractModal() {
    const modal = document.getElementById('video-extract-modal');
    const video = document.getElementById('extract-video-player');
    
    if (isRecording) {
        clearTimeout(recordingTimeout);
        stopRecording();
    }
    
    if (video) video.pause();
    if (modal) modal.classList.add('hidden');
    extractingStepId = null;
}

function captureFrameFromVideo() {
    if (!extractingStepId) return;
    const video = document.getElementById('extract-video-player');
    if (!video || video.readyState < 2) return; 

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const step = steps.find(s => s.id === extractingStepId);
    if (step) {
        step.type = 'image';
        step.source = dataUrl;
        renderSteps();
    }
    closeVideoExtractModal();
}

function toggleRecording() {
    const btn = document.getElementById('record-btn');
    const indicator = document.getElementById('recording-indicator');
    if (!btn) return;
    
    if (!isRecording) {
        startRecording();
        btn.innerHTML = `<i data-lucide="square" class="w-4 h-4"></i> 録画停止（最大10秒）`;
        btn.classList.replace('bg-red-600', 'bg-slate-600');
        btn.classList.replace('hover:bg-red-700', 'hover:bg-slate-700');
        if (indicator) indicator.classList.remove('hidden');
        lucide.createIcons();
        
        recordingTimeout = setTimeout(() => {
            if (isRecording) toggleRecording();
        }, 10000);
    } else {
        clearTimeout(recordingTimeout);
        stopRecording();
        btn.innerHTML = `<i data-lucide="video" class="w-4 h-4"></i> ここから録画（最大10秒）`;
        btn.classList.replace('bg-slate-600', 'bg-red-600');
        btn.classList.replace('hover:bg-slate-700', 'hover:bg-red-700');
        if (indicator) indicator.classList.add('hidden');
        lucide.createIcons();
    }
}

function startRecording() {
    const video = document.getElementById('extract-video-player');
    if (!video) return;
    video.muted = false; 

    if (!extractAudioCtx) {
        extractAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        try {
            extractMediaSource = extractAudioCtx.createMediaElementSource(video);
            extractAudioDest = extractAudioCtx.createMediaStreamDestination();
            extractMediaSource.connect(extractAudioDest);
            extractMediaSource.connect(extractAudioCtx.destination);
        } catch(e) { console.warn("Audio Context Setup warning:", e); }
    }

    const canvas = document.createElement('canvas');
    const scale = Math.min(800 / video.videoWidth, 1);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    
    recordedChunks = [];
    isRecording = true;
    video.play();
    
    function drawFrame() {
        if(!isRecording) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
    }
    drawFrame();
    
    const canvasStream = canvas.captureStream(30);
    let combinedStream = canvasStream;
    if (extractAudioDest && extractAudioDest.stream.getAudioTracks().length > 0) {
        combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...extractAudioDest.stream.getAudioTracks()
        ]);
    }

    mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = function() {
            const step = steps.find(s => s.id === extractingStepId);
            if (step) {
                step.type = 'video';
                step.source = reader.result;
                step.videoVolume = 1.0;
                step.ttsVolume = 1.0;
                renderSteps();
            }
            closeVideoExtractModal();
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
}

function stopRecording() {
    isRecording = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    const video = document.getElementById('extract-video-player');
    if (video) video.pause();
}

function openVideoExportModal() {
    if (steps.length === 0) {
        showMessage("通知", "出力するマニュアルデータがありません。");
        return;
    }
    
    const container = document.getElementById('export-langs-container');
    if (!container) return;
    container.innerHTML = '';
    
    const validLangs = Array.from(availableLangs).filter(lang => 
        steps.some(s => s.texts[lang] && s.texts[lang].trim() !== '')
    );
    
    if(validLangs.length === 0) {
        showMessage("通知", "出力可能な言語データがありません。説明文を入力してください。");
        return;
    }
    
    validLangs.forEach(lang => {
        const isChecked = lang === currentLang ? 'checked' : '';
        container.innerHTML += `
            <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" value="${lang}" class="export-lang-cb w-4 h-4 text-purple-600 rounded focus:ring-purple-500" ${isChecked}>
                <span class="text-sm font-medium text-slate-700">${SUPPORTED_LANGS[lang]}</span>
            </label>
        `;
    });
    
    const modal = document.getElementById('video-export-modal');
    const content = document.getElementById('video-export-modal-content');
    if (modal && content) {
      modal.classList.remove('hidden');
      setTimeout(() => {
          modal.classList.remove('opacity-0');
          content.classList.remove('scale-95');
      }, 10);
    }
}

function closeVideoExportModal() {
    const modal = document.getElementById('video-export-modal');
    const content = document.getElementById('video-export-modal-content');
    if (modal && content) {
      modal.classList.add('opacity-0');
      content.classList.add('scale-95');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

async function executeVideoExportMulti() {
    const checkboxes = document.querySelectorAll('.export-lang-cb:checked');
    const selectedLangs = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedLangs.length === 0) {
        alert("出力する言語を少なくとも1つ選択してください。");
        return;
    }
    
    closeVideoExportModal();
    showView('loading-view');
    
    try {
        const generatedBlobs = {};
        
        for (let langIdx = 0; langIdx < selectedLangs.length; langIdx++) {
            const lang = selectedLangs[langIdx];
            const langName = SUPPORTED_LANGS[lang];
            
            const titleTitleEl = document.getElementById('loading-title');
            if (titleTitleEl) titleTitleEl.textContent = `動画を生成中 (${langIdx + 1}/${selectedLangs.length})`;
            
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const dest = audioCtx.createMediaStreamDestination();

            const titleData = manualData[lang] || manualData['ja'];
            const manualTitle = titleData.title;
            const manualSubtitle = titleData.subtitle;

            updateProgress(`[${langName}] AI音声 (TTS) を準備中... (タイトル)`, 5);
            let titleAudioBuffer = null;
            try {
                const titleText = `${manualTitle}。 ${manualSubtitle}`;
                const titleBase64Audio = await generateTTS(titleText);
                if (titleBase64Audio) {
                    titleAudioBuffer = base64ToAudioBuffer(titleBase64Audio, audioCtx);
                }
            } catch (e) { console.error(`Title TTS failed:`, e); }

            for (let i = 0; i < steps.length; i++) {
                const progress = 10 + Math.floor((i / steps.length) * 20);
                updateProgress(`[${langName}] AI音声 (TTS) を準備中... (${i+1}/${steps.length})`, progress);
                
                const step = steps[i];
                const text = step.texts[lang] || step.texts['ja'];
                if (text && text.trim() !== "") {
                    try {
                        const stepPrefix = lang === 'ja' ? `操作手順 ${i+1}。　　\n\n` : `Step ${i+1}. \n\n`;
                        const ttsText = `${stepPrefix}${text}`;
                        const base64Audio = await generateTTS(ttsText);
                        if (base64Audio) {
                            if (!step.audioBuffers) step.audioBuffers = {};
                            step.audioBuffers[lang] = base64ToAudioBuffer(base64Audio, audioCtx);
                        }
                    } catch (e) { console.error(`Step ${i+1} TTS failed:`, e); }
                }
            }

            updateProgress(`[${langName}] スライドを録画しています...`, 30);

            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');
            
            const videoStream = canvas.captureStream(30);
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
            ]);
            
            let mimeType = 'video/webm;codecs=vp8,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
            
            const recorder = new MediaRecorder(combinedStream, { mimeType: mimeType });
            const chunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            
            const recordingPromise = new Promise(resolve => {
                recorder.onstop = () => {
                     const blob = new Blob(chunks, { type: mimeType });
                     resolve({ blob, mimeType });
                };
            });
            
            recorder.start();

            updateProgress(`[${langName}] 録画中... タイトル`, 30);
            await playAndRecordTitleMulti(manualTitle, manualSubtitle, canvas, ctx, audioCtx, dest, titleAudioBuffer);
            
            for (let i = 0; i < steps.length; i++) {
                const progress = 30 + Math.floor((i / steps.length) * 70);
                updateProgress(`[${langName}] 録画中... 手順 ${i+1}`, progress);
                await playAndRecordStepMulti(steps[i], i, lang, canvas, ctx, audioCtx, dest);
            }
            
            recorder.stop();
            const { blob: finalBlob, mimeType: finalMime } = await recordingPromise;
            generatedBlobs[lang] = { blob: finalBlob, ext: finalMime.includes('mp4') ? 'mp4' : 'webm' };
            
            await audioCtx.close();
        }
        
        updateProgress("録画完了！保存処理を行っています...", 99);
        
        if (selectedLangs.length === 1) {
            const lang = selectedLangs[0];
            const { blob, ext } = generatedBlobs[lang];
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoName}_slideshow_${lang}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            const zip = new JSZip();
            for (const lang of selectedLangs) {
                const { blob, ext } = generatedBlobs[lang];
                zip.file(`${currentVideoName}_slideshow_${lang}.${ext}`, blob);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoName}_slideshow_multi.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        showView('editor-view');
    } catch (error) {
        console.error("Video Export Error:", error);
        showView('editor-view');
        showMessage("エラー", "動画の出力中にエラーが発生しました。");
    }
}

async function playAndRecordTitleMulti(title, subtitle, canvas, ctx, audioCtx, dest, titleAudioBuffer) {
    return new Promise((resolve) => {
        let ttsSource = null;
        let ttsDuration = 0;
        const fadeTime = 0.5; 
        const startTime = audioCtx.currentTime;
        
        if (titleAudioBuffer) {
            ttsSource = audioCtx.createBufferSource();
            ttsSource.buffer = titleAudioBuffer;
            ttsSource.connect(dest);
            ttsDuration = titleAudioBuffer.duration;
            ttsSource.start(startTime + fadeTime);
        }

        const minDuration = 3.0; 
        const totalDuration = Math.max(ttsDuration + fadeTime * 2 + 1.0, minDuration); 

        function drawLoop() {
            const now = audioCtx.currentTime;
            const elapsed = now - startTime;

            if (elapsed >= totalDuration) {
                if (ttsSource) {
                    try { ttsSource.stop(); } catch(e) {}
                    ttsSource.disconnect();
                }
                resolve();
                return;
            }
            
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let alpha = 1.0;
            if (elapsed < fadeTime) alpha = elapsed / fadeTime;
            else if (elapsed > totalDuration - fadeTime) alpha = (totalDuration - elapsed) / fadeTime;
            ctx.globalAlpha = alpha;

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.font = 'bold 48px "Noto Sans JP", sans-serif';
            ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);
            
            ctx.font = 'bold 36px "Noto Sans JP", sans-serif';
            ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 40);

            ctx.globalAlpha = 1.0; 
            requestAnimationFrame(drawLoop);
        }
        drawLoop();
    });
}

async function playAndRecordStepMulti(step, index, lang, canvas, ctx, audioCtx, dest) {
    return new Promise(async (resolve) => {
        let ttsSource = null;
        let ttsDuration = 0;
        const fadeTime = 0.5; 
        const startTime = audioCtx.currentTime;
        
        const audioBuffer = step.audioBuffers?.[lang];
        if (audioBuffer) {
            ttsSource = audioCtx.createBufferSource();
            ttsSource.buffer = audioBuffer;
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = (step.type === 'video' && step.ttsVolume !== undefined) ? step.ttsVolume : 1.0;
            ttsSource.connect(gainNode);
            gainNode.connect(dest);
            ttsDuration = audioBuffer.duration;
            ttsSource.start(startTime + fadeTime);
        }

        const minDuration = 3.0; 
        let videoDuration = 0;
        let videoEl = null;
        let mediaSource = null;
        let videoGain = null;
        let videoStarted = false;

        if (step.type === 'video' && step.source) {
            videoEl = document.createElement('video');
            videoEl.src = step.source;
            videoEl.muted = false; 
            videoEl.crossOrigin = "anonymous";
            
            await new Promise(r => {
                videoEl.onloadedmetadata = r;
                videoEl.load();
            });

            videoDuration = videoEl.duration;
            
            mediaSource = audioCtx.createMediaElementSource(videoEl);
            videoGain = audioCtx.createGain();
            videoGain.gain.value = step.videoVolume !== undefined ? step.videoVolume : 1.0;
            mediaSource.connect(videoGain);
            videoGain.connect(dest);
            
            if (ttsDuration > videoDuration) videoEl.loop = true;
        }
        
        const totalDuration = Math.max(ttsDuration, videoDuration, minDuration) + fadeTime * 2;
        
        let img = null;
        if (step.type !== 'video' && step.source) {
            img = new Image();
            img.src = step.source;
            await new Promise(r => img.onload = r);
        }

        function drawLoop() {
            const now = audioCtx.currentTime;
            const elapsed = now - startTime;

            if (elapsed >= totalDuration) {
                if (videoEl) {
                    videoEl.pause();
                    if (mediaSource) mediaSource.disconnect();
                }
                if (ttsSource) {
                    try { ttsSource.stop(); } catch(e) {}
                    ttsSource.disconnect();
                }
                resolve();
                return;
            }

            if (elapsed >= fadeTime && !videoStarted && videoEl) {
                videoStarted = true;
                videoEl.play();
            }
            
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let alpha = 1.0;
            if (elapsed < fadeTime) alpha = elapsed / fadeTime;
            else if (elapsed > totalDuration - fadeTime) alpha = (totalDuration - elapsed) / fadeTime;
            ctx.globalAlpha = alpha;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (videoEl) drawImageToCanvasHalf(videoEl, canvas, ctx);
            else if (img) drawImageToCanvasHalf(img, canvas, ctx);
            else {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '24px "Noto Sans JP", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('画像/動画なし', canvas.width / 4, canvas.height / 2);
            }

            drawStepTextMulti(step, index, lang, canvas, ctx);
            
            ctx.globalAlpha = 1.0; 
            requestAnimationFrame(drawLoop);
        }
        drawLoop();
    });
}

function drawImageToCanvasHalf(media, canvas, ctx) {
    const padding = 60;
    const availableWidth = canvas.width / 2 - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    
    const mediaWidth = media.videoWidth || media.width;
    const mediaHeight = media.videoHeight || media.height;
    
    const scale = Math.min(availableWidth / mediaWidth, availableHeight / mediaHeight);
    const drawWidth = mediaWidth * scale;
    const drawHeight = mediaHeight * scale;
    const x = padding + (availableWidth - drawWidth) / 2;
    const y = padding + (availableHeight - drawHeight) / 2;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(media, x, y, drawWidth, drawHeight);
    ctx.shadowColor = 'transparent';
}

function drawStepTextMulti(step, index, lang, canvas, ctx) {
    const padding = 60;
    const x = canvas.width / 2 + padding;
    const y = 120;
    const maxWidth = canvas.width / 2 - padding * 2;
    
    ctx.fillStyle = '#eff6ff';
    ctx.beginPath();
    ctx.arc(x + 24, y - 6, 24, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 24px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(index + 1, x + 24, y - 4);
    
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 36px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const prefix = lang === 'ja' ? `手順 ${index + 1}` : `Step ${index + 1}`;
    ctx.fillText(prefix, x + 64, y - 24);
    
    ctx.fillStyle = '#475569';
    ctx.font = '24px "Noto Sans JP", sans-serif';
    ctx.textBaseline = 'top';
    
    const text = step.texts[lang] || step.texts['ja'] || '';
    if (!text) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('（No Description）', x, y + 60);
        return;
    }
    
    let line = '';
    let lineY = y + 60;
    const lineHeight = 42;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n') {
            ctx.fillText(line, x, lineY);
            line = '';
            lineY += lineHeight;
            continue;
        }
        
        const testLine = line + char;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line.length > 0) {
            ctx.fillText(line, x, lineY);
            line = char;
            lineY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line.length > 0) ctx.fillText(line, x, lineY);
}

function generateFinalFinalHTML(mode, base64Refs = []) {
    let referencesHtml = '';
    let embeddedScript = '';

    if (referenceFiles.length > 0) {
        let listItems = '';
        if (mode === 'zip') {
            listItems = referenceFiles.map(file => {
                const mime = file.type;
                const viewableMimes = ['application/pdf', 'text/plain'];
                const isViewable = viewableMimes.includes(mime) || mime.startsWith('image/') || mime.startsWith('video/');
                return `
                <a href="./references/${encodeURIComponent(file.name)}" ${isViewable ? 'target="_blank" rel="noopener noreferrer"' : `download="${escapeHtml(file.name)}"`} style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #0284c7; text-decoration: none; font-size: 14px; font-weight: 500;">
                    📎 ${escapeHtml(file.name)}
                </a>`;
            }).join('');
        } else {
            listItems = base64Refs.map((ref, idx) => `
                <button onclick="handleEmbeddedRefClick(${idx})" style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #0284c7; cursor: pointer; font-size: 14px; font-weight: 500; text-align: left;">
                    📎 ${escapeHtml(ref.name)}
                </button>
            `).join('');

            const safeDataString = JSON.stringify(base64Refs).replace(/<\//g, "<\\/");
            embeddedScript = `
            <script>
                const embeddedRefs = ${safeDataString};
                function dataURLtoBlob(dataurl) {
                    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
                    return new Blob([u8arr], {type:mime});
                }
                function handleEmbeddedRefClick(index) {
                    const ref = embeddedRefs[index];
                    const mime = ref.mimeType;
                    const isViewable = ['application/pdf', 'text/plain'].includes(mime) || mime.startsWith('image/') || mime.startsWith('video/');
                    if (isViewable) {
                        const blob = dataURLtoBlob(ref.dataUrl);
                        const blobUrl = URL.createObjectURL(blob);
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                            newWindow.document.write('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>' + ref.name + '</title><style>body{margin:0;padding:0;background-color:#1e293b;display:flex;justify-content:center;align-items:center;height:100vh;} iframe{width:100%;height:100%;border:none;}</style></head><body>');
                            if (mime.startsWith('video/')) newWindow.document.write('<video src="' + blobUrl + '" controls autoplay style="max-width:100%;max-height:100%;box-shadow:0 10px 25px rgba(0,0,0,0.5);"></video>');
                            else if (mime.startsWith('image/')) newWindow.document.write('<img src="' + blobUrl + '" style="max-width:100%;max-height:100%;object-fit:contain;" />');
                            else newWindow.document.write('<iframe src="' + blobUrl + '"></iframe>');
                            newWindow.document.write('</body></html>');
                            newWindow.document.close();
                        } else alert('ポップアップがブロックされました。');
                    } else {
                        const a = document.createElement('a');
                        a.href = ref.dataUrl; a.download = ref.name;
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    }
                }
            </script>
            `;
        }

        referencesHtml = `
            <div style="margin-bottom: 30px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; break-inside: avoid; box-sizing: border-box;">
                <h2 style="margin: 0 0 12px 0; color: #334155; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Downloads</h2>
                <div>${listItems}</div>
            </div>
        `;
    }

    const stepsHtml = steps.map((step, index) => {
        let mediaHtml = `<div style="color: #94a3b8; font-size: 14px; text-align: center; padding-top: 100px;">No Media</div>`;
        if (step.source) {
            if (step.type === 'video') mediaHtml = `<video src="${step.source}" controls playsinline style="max-width: 100%; max-height: 380px; width: auto; height: auto; object-fit: contain; margin: 0 auto; display: inline-block; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></video>`;
            else mediaHtml = `<img src="${step.source}" style="max-width: 100%; max-height: 380px; width: auto; height: auto; object-fit: contain; margin: 0 auto; display: inline-block; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" alt="Step ${index + 1}">`;
        }
        const text = step.texts[currentLang] || step.texts['ja'] || '';
        const prefix = currentLang === 'ja' ? `手順 ${index + 1}` : `Step ${index + 1}`;

        return `
        <div style="display: block; width: 100%; margin-bottom: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; break-inside: avoid; box-sizing: border-box;">
            <div style="float: left; width: 55%; box-sizing: border-box; border-right: 1px solid #e2e8f0; background: #f8fafc; padding: 20px; text-align: center; min-height: 250px;">
                ${mediaHtml}
            </div>
            <div style="float: left; width: 45%; box-sizing: border-box; padding: 25px;">
                <div style="margin-bottom: 15px;">
                    <span style="background: #eff6ff; color: #1d4ed8; font-weight: bold; width: 32px; height: 32px; border-radius: 16px; display: inline-block; text-align: center; line-height: 32px; margin-right: 12px; font-size: 14px; vertical-align: middle;">${index + 1}</span>
                    <h3 style="margin: 0; color: #334155; font-size: 18px; display: inline-block; vertical-align: middle;">${prefix}</h3>
                </div>
                <p style="white-space: pre-wrap; line-height: 1.7; color: #475569; font-size: 15px; margin: 0; word-break: break-all;">${escapeHtml(text) || '（No Description）'}</p>
            </div>
            <div style="clear: both;"></div>
        </div>
        `;
    }).join('');

    const titleObj = manualData[currentLang] || manualData['ja'];

    return `<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(titleObj.title)}</title>
</head>
<body style="background: #f1f5f9; padding: 40px 20px; margin: 0;">
    <div style="background: white; padding: 50px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); max-width: 1200px; margin: 0 auto;">
        <div style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; width: 1080px; margin: 0 auto; padding: 0;">
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #eff6ff; page-break-after: avoid; break-after: avoid;">
                <h1 style="color: #1e3a8a; font-size: 28px; margin: 0 0 10px 0;">${escapeHtml(titleObj.title)}</h1>
                <p style="color: #64748b; font-size: 14px; margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
            ${referencesHtml}
            ${stepsHtml}
        </div>
    </div>
    ${embeddedScript}
</body>
</html>`;
}

async function exportHTML() {
    if (steps.length === 0) {
        showMessage("通知", "出力するマニュアルデータがありません。");
        return;
    }

    let totalSizeBytes = referenceFiles.reduce((sum, f) => sum + f.size, 0);
    steps.forEach(s => {
        if (s.source) {
            const base64Length = s.source.length - (s.source.indexOf(',') + 1);
            const padding = (s.source.charAt(s.source.length - 2) === '=') ? 2 : ((s.source.charAt(s.source.length - 1) === '=') ? 1 : 0);
            totalSizeBytes += (base64Length * 0.75) - padding;
        }
    });

    const thresholdBytes = 10 * 1024 * 1024; 

    if (totalSizeBytes > thresholdBytes) {
        showMessage("通知", "添付データのサイズ合計が10MBを超えているため、ZIP形式で出力します。少々お待ちください...", true);
        try {
            const zip = new JSZip();
            const htmlContent = generateFinalFinalHTML('zip');
            zip.file(`${currentVideoName}_manual_${currentLang}.html`, htmlContent);

            if (referenceFiles.length > 0) {
                const refFolder = zip.folder("references");
                for (const file of referenceFiles) refFolder.file(file.name, file);
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoName}_manual_${currentLang}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeMessage();
        } catch (e) {
            console.error("ZIP Error:", e);
            closeMessage();
            showMessage("エラー", "ZIPファイルの生成に失敗しました。");
        }
    } else {
        showMessage("生成中", "単一HTMLファイルを生成しています...", true);
        try {
            const base64Refs = [];
            for (const file of referenceFiles) {
                const b64 = await fileToBase64(file);
                base64Refs.push({ name: file.name, mimeType: file.type, dataUrl: b64 });
            }
            const htmlContent = generateFinalFinalHTML('base64', base64Refs);
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoName}_manual_${currentLang}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeMessage();
        } catch (e) {
            console.error("HTML Error:", e);
            closeMessage();
            showMessage("エラー", "HTMLファイルの生成に失敗しました。");
        }
    }
}

function showView(viewId) {
    ['upload-view', 'loading-view', 'editor-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('hidden');
          if (id === 'loading-view') {
              el.classList.remove('flex');
          }
        }
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('hidden');
      if (viewId === 'loading-view') {
          target.classList.add('flex');
      }
    }
}

function updateProgress(text, percentage) {
    const desc = document.getElementById('loading-desc');
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    if (desc) desc.textContent = text;
    if (bar) bar.style.width = `${percentage}%`;
    if (txt) txt.textContent = `${Math.round(percentage)}%`;
}

function showMessage(title, text, hideButton = false) {
    const modal = document.getElementById('message-modal');
    const content = document.getElementById('message-modal-content');
    if (!modal || !content) return;
    
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    
    const btn = content.querySelector('button');
    if (btn) btn.style.display = hideButton ? 'none' : 'inline-block';

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeMessage() {
    const modal = document.getElementById('message-modal');
    const content = document.getElementById('message-modal-content');
    if (!modal || !content) return;
    
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); 
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// グローバルスコープへ露出させる（HTMLのonclick属性から呼び出せるようにする）
window.handleVideoUpload = handleVideoUpload;
window.switchLanguage = switchLanguage;
window.translateAllSteps = translateAllSteps;
window.rewriteStepText = rewriteStepText;
window.openImageEditor = openImageEditor;
window.clearCanvasDrawings = clearCanvasDrawings;
window.closeImageEditor = closeImageEditor;
window.saveEditedImage = saveEditedImage;
window.generateDescriptionForStep = generateDescriptionForStep;
window.updateStepImage = updateStepImage;
window.openVideoExtractModal = openVideoExtractModal;
window.closeVideoExtractModal = closeVideoExtractModal;
window.captureFrameFromVideo = captureFrameFromVideo;
window.toggleRecording = toggleRecording;
window.closeVideoExportModal = closeVideoExportModal;
window.executeVideoExportMulti = executeVideoExportMulti;
window.exportHTML = exportHTML;
window.closeMessage = closeMessage;
window.removeReference = removeReference;
window.handleReferenceUpload = handleReferenceUpload;
window.openVideoExportModal = openVideoExportModal;
window.addStep = addStep;
window.deleteStep = deleteStep;
window.updateStepText = updateStepText;
window.updateStepVolume = updateStepVolume;
window.setDrawMode = setDrawMode;
window.setDrawColor = setDrawColor;

// --- スライダー制御ロジック ---
function initSliders() {
  const sliders = [
    {
      id: 'agent',
      containerId: 'agent-slider-container',
      wrapperId: 'agent-slider-wrapper',
      dotsId: 'agent-slider-dots',
      prevId: 'agent-slider-prev',
      nextId: 'agent-slider-next',
      currentIndex: 0,
      slideCount: 3,
      autoPlayInterval: 0
    },
    {
      id: 'clipper',
      containerId: 'clipper-slider-container',
      wrapperId: 'clipper-slider-wrapper',
      dotsId: 'clipper-slider-dots',
      prevId: 'clipper-slider-prev',
      nextId: 'clipper-slider-next',
      currentIndex: 0,
      slideCount: 4,
      autoPlayInterval: 0
    }
  ];

  sliders.forEach(slider => {
    const container = document.getElementById(slider.containerId);
    const wrapper = document.getElementById(slider.wrapperId);
    const dotsContainer = document.getElementById(slider.dotsId);
    const prevBtn = document.getElementById(slider.prevId);
    const nextBtn = document.getElementById(slider.nextId);

    if (!container || !wrapper) return;

    const slides = wrapper.querySelectorAll('.slide-card');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    let timer = null;

    function showSlide(index) {
      if (index < 0) {
        slider.currentIndex = slider.slideCount - 1;
      } else if (index >= slider.slideCount) {
        slider.currentIndex = 0;
      } else {
        slider.currentIndex = index;
      }

      wrapper.style.transform = `translateX(-${slider.currentIndex * 100}%)`;

      slides.forEach((slide, i) => {
        if (i === slider.currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, i) => {
        if (i === slider.currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(slider.currentIndex - 1);
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(slider.currentIndex + 1);
        resetAutoPlay();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        resetAutoPlay();
      });
    });

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 50;
      if (touchStartX - touchEndX > threshold) {
        showSlide(slider.currentIndex + 1);
        resetAutoPlay();
      } else if (touchEndX - touchStartX > threshold) {
        showSlide(slider.currentIndex - 1);
        resetAutoPlay();
      }
    }

    function startAutoPlay() {
      if (slider.autoPlayInterval > 0) {
        timer = setInterval(() => {
          showSlide(slider.currentIndex + 1);
        }, slider.autoPlayInterval);
      }
    }

    function stopAutoPlay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetAutoPlay() {
      if (slider.autoPlayInterval > 0) {
        stopAutoPlay();
        startAutoPlay();
      }
    }

    if (slider.autoPlayInterval > 0) {
      container.addEventListener('mouseenter', stopAutoPlay);
      container.addEventListener('mouseleave', startAutoPlay);
    }

    showSlide(0);
    if (slider.autoPlayInterval > 0) {
      startAutoPlay();
    }
  });
}

document.addEventListener('DOMContentLoaded', initSliders);


