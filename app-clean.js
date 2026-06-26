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

  // --- 投影モード（プロジェクター用）制御 ---
  const projectorToggleBtn = document.getElementById('btn-projector-toggle');
  if (projectorToggleBtn) {
    projectorToggleBtn.addEventListener('click', () => {
      const isProjectorMode = document.body.classList.toggle('projector-mode');
      
      // ボタンのアイコンとテキストをトグル
      const iconEl = projectorToggleBtn.querySelector('i') || projectorToggleBtn.querySelector('svg');
      const textEl = projectorToggleBtn.querySelector('span');
      
      if (iconEl) {
        if (isProjectorMode) {
          iconEl.setAttribute('data-lucide', 'moon');
          textEl.textContent = '通常モード';
        } else {
          iconEl.setAttribute('data-lucide', 'sun');
          textEl.textContent = '投影モード';
        }
      }
      
      // Lucideアイコンの再描画
      lucide.createIcons();
    });
  }

  // --- NotebookLM 使い方ガイド（タブ切り替え制御） ---
  const guideTabs = document.querySelectorAll('.guide-tab-btn');
  const guideContents = document.querySelectorAll('.guide-content');

  if (guideTabs.length > 0 && guideContents.length > 0) {
    guideTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');

        // タブのactive状態の更新
        guideTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // コンテンツのactive状態の更新
        guideContents.forEach(content => {
          if (content.id === targetId) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
        
        // Lucideアイコンの再描画
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    });
  }

  // --- プロンプトコピー制御 ---
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    const originalHTML = btn.innerHTML;
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textarea = document.getElementById(targetId);
      if (textarea) {
        navigator.clipboard.writeText(textarea.value).then(() => {
          btn.classList.add('copied');
          btn.innerHTML = '<i data-lucide="check"></i> <span>コピーしました！</span>';
          if (window.lucide) window.lucide.createIcons();

          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      }
    });
  });
});
