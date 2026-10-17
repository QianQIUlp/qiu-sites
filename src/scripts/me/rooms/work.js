// 拆开看看 ("Beneath the surface"): real projects, opened into their motives, decisions and limits.
// A sculpture (work-specimen.js, Three.js) is cut by a section the visitor moves; it loads only when
// the room comes into view, and gives a short guided tour on the first arrival.
import {t as localize} from '../language.js';
import {$, clamp} from '../room-kit.js';

// All interaction state stays in this visit.
function dragRange(stage, input, axis, distance) {
  let drag;
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button,a,input')) return;
    drag = {id: event.pointerId, position: event[axis], value: +input.value};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    input.value = clamp(drag.value + (event[axis] - drag.position) * distance(), +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
  const release = event => {
    if (drag?.id !== event.pointerId) return;
    drag = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('keydown', event => {
    if (event.target.closest('button,a,input')) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    input.value = clamp(+input.value + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1) * (+input.max / 20), +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
}

const room = {
  place: 'work',
  mount(ctx) {
    const projects = {
      verisilo: {
        name: 'VeriSilo', repo: 'VeriSilo',
        layers: [localize("多个网站身份，为什么要挤在同一个浏览器环境里？", "Why should different online identities share a single browser environment?"), localize("每个 Silo 使用独立的浏览器数据目录；Companion 由用户主动触发观察，把证据与解释留在本地。", "Each Silo has a separate browser data directory. You choose when Companion observes; its evidence and explanations stay local."), localize("隔离浏览器环境，不承诺绝对匿名。加密保险库保护应用元数据，不等于加密全部浏览器数据。", "Browser separation does not promise anonymity. The encrypted vault protects app metadata, not all browser data.")]
      },
      meal: {
        name: 'MealCircuit', repo: 'meal-circuit',
        layers: [localize("一餐的照片、当天的状态、后来的更正，能不能接成一段持续的记录？", "Can meal photos, daily check-ins and later corrections become one continuing record?"), localize("把本地事实整理成上下文，用结构约束检查返回结果；更正追加进历史，保留判断如何变化。", "Local records become context; returned results are checked against a schema. Corrections are appended so changes in judgment remain visible."), localize("应用不直接调用外部模型 API；同步默认关闭。记录帮助回看，不提供医学诊断。", "The app does not call external model APIs. Sync is off by default. Records support reflection, not medical diagnosis.")]
      },
      crew: {
        name: 'Crewlight', repo: 'Crewlight',
        layers: [localize("几个编码助手同时工作时，怎样知道谁正需要我的注意，而不用翻遍每个窗口？", "When several coding agents are working, how can I see who needs me without checking every window?"), localize("通过适配器汇总本地状态事件，让桌面伴随窗口、Dashboard 与 CLI 呈现同一组信号。", "Adapters collect local status events. The desktop companion, dashboard and CLI show the same signals."), localize("只读观察，不替助手执行任务；不保存提示词、对话正文或工具输入输出。", "Observation is read-only. It does not act for agents or store prompts, conversations, or tool inputs and outputs.")]
      },
      hadoop: {
        name: 'Hadoop Lab', repo: 'docker-hadoop-cluster',
        layers: [localize("一堂 Hadoop 实验，能不能从观察系统开始，而不是先消耗在安装与端口上？", "Could a Hadoop lesson start with observing the system, without losing the hour to setup and ports?"), localize("同一镜像支持单机六进程与三节点模式；七组实验串起运行、健康信号、故障与恢复。", "One image supports six daemons on one node or a three-node cluster. Seven labs connect operation, health signals, failure and recovery."), localize("面向本地教学与实验。默认端口绑定本机，不包装成具备高可用与安全认证的生产集群。", "For local teaching and experiments. Ports bind to localhost; this is not a production cluster with high availability or authentication.")]
      }
    };
    const spread = $('#work-spread'), sculpture = $('.work-sculpture');
    let specimen = null, specimenPromise = null, workVisible = false;
    async function ensureSpecimen() {
      if (!specimenPromise) specimenPromise = import('./work-specimen.js').then(({createWorkSpecimen}) => {
        specimen = createWorkSpecimen($('#work-specimen'));
        specimen.setVisible(workVisible || workActive);
        chooseProject(projectKey);
        return specimen;
      }).catch(error => {
        sculpture.classList.add('specimen-unavailable');console.error('Work specimen:',error);
        specimenPromise = null;
      });
      return specimenPromise;
    }
    new IntersectionObserver(entries => {
      workVisible = entries[0].isIntersecting;
      if (workVisible) ensureSpecimen();
      specimen?.setVisible(workVisible);
    }, {root: ctx.room}).observe(sculpture);
    const specimenNotes = {
      verisilo: ['01', 'SEPARATE BY DESIGN', localize("先有边界，再有各自的空间。", "Separate spaces begin with boundaries.")],
      meal: ['02', 'A RECORD THAT RETURNS', localize("每一次更正，都回到同一段记录。", "Every correction returns to the same record.")],
      crew: ['03', 'SIGNALS, NOT CONTROL', localize("看见各处的动静，把控制留在原处。", "See the signals. Leave control in place.")],
      hadoop: ['04', 'LEARN BY TAKING APART', localize("连起来，再从故障里理解它。", "Connect it. Learn through failure.")]
    };
    const depthLabels = [localize("它从一个问题开始", "It starts with a question"), localize("把判断落实成做法", "A decision becomes a method"), localize("把边界也摆在这里", "The limits belong here, too")];
    let projectKey = 'verisilo', displayedWork = '';
    function updateWork() {
      const value = +spread.value, depth = value < 34 ? 0 : value < 67 ? 1 : 2;
      specimen?.setDepth(value / 100);
      const reading = String(Math.round(value)).padStart(3, '0');
      if ($('#cut-reading').textContent !== reading) $('#cut-reading').textContent = reading;
      if (displayedWork === `${projectKey}:${depth}`) return;
      displayedWork = `${projectKey}:${depth}`;
      $('#work-detail-label').textContent = depthLabels[depth];
      $('#work-detail-copy').textContent = projects[projectKey].layers[depth];
      document.querySelectorAll('[data-depth]').forEach(button => button.setAttribute('aria-pressed', String(Math.round(+button.dataset.depth / 50) === depth)));
    }
    function chooseProject(key) {
      projectKey = key;
      const project = projects[key];
      $('#surface-name').textContent = project.name;
      const [index, figure, principle] = specimenNotes[key];
      $('#specimen-index').textContent = index;
      $('#specimen-figure').textContent = `FIG. ${index} — ${figure}`;
      $('#specimen-principle').textContent = principle;
      specimen?.setProject(key, project.name, +index);
      $('#project-source').href = `https://github.com/QianQIUlp/${project.repo}`;
      document.querySelectorAll('[data-project]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.project === key)));
      updateWork();
    }
    // A single, interruptible tour. Each selection restarts it; ordinary room returns do not.
    const playButton = $('#work-play'), playLabel = $('#work-play-label'), playStep = $('#work-play-step');
    const tour = [[0,0],[1400,0],[4100,50],[5900,50],[8600,100],[10600,100],[13000,42],[13400,42]];
    const duration = tour[tour.length - 1][0];
    let showState = 'ready', showFrame = 0, elapsed = 0, lastShowTime = 0, workActive = ctx.active === 'work', enteredWork = false, showRequest = 0;
    function playUI(state) {
      showState = state;
      const playing = state === 'playing';
      const labels = {ready:[localize("完整演示", "Full tour"),localize("播放完整演示", "Play the full tour")],playing:[localize("暂停演示", "Pause tour"),localize("暂停完整演示", "Pause the full tour")],paused:[localize("继续演示", "Resume tour"),localize("继续完整演示", "Resume the full tour")],finished:[localize("再看一遍", "Watch again"),localize("重播完整演示", "Replay the full tour")]};
      playLabel.textContent = labels[state][0];
      playButton.setAttribute('aria-label', labels[state][1]);
      playButton.setAttribute('aria-pressed', String(playing));
      playButton.dataset.state = state;
      $('#work-play-icon').setAttribute('d', playing ? 'M13 12H16V24H13ZM21 12H24V24H21Z' : 'M15 11.5 25 18 15 24.5Z');
    }
    function cueShow() {
      if (!showFrame && workActive && showState === 'playing' && !document.hidden) showFrame = requestAnimationFrame(tickShow);
    }
    function tickShow(now) {
      showFrame = 0;
      if (showState !== 'playing' || !workActive || document.hidden) return;
      if (lastShowTime) elapsed += Math.min(now - lastShowTime, 80);
      lastShowTime = now;
      const time = clamp(elapsed, 0, duration), progress = time / duration;
      let next = tour.findIndex(point => point[0] >= time);
      if (next < 1) next = 1;
      const [start, from] = tour[next - 1], [end, to] = tour[next];
      const t = clamp((time - start) / (end - start), 0, 1), ease = t * t * (3 - 2 * t);
      spread.value = from + (to - from) * ease;
      updateWork();specimen?.setPresentation(progress);
      playButton.style.setProperty('--show-progress', progress);
      const phase = time >= 10600 ? localize("收回切面", "Returning to the surface") : +spread.value < 34 ? localize("01 / 起因", "01 / WHY") : +spread.value < 67 ? localize("02 / 做法", "02 / HOW") : localize("03 / 边界", "03 / LIMITS");
      if (playStep.textContent !== phase) playStep.textContent = phase;
      if (elapsed >= duration) {
        playUI('finished');playStep.textContent = localize("已完整展示", "Tour complete");specimen?.setPresentation(null);return;
      }
      cueShow();
    }
    async function startShow(delay = 0) {
      const request = ++showRequest;
      await ensureSpecimen();
      if (request !== showRequest || !workActive) return;
      enteredWork = true;
      cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;elapsed = -delay;
      spread.value = 0;updateWork();specimen?.setPresentation(0);
      playButton.style.setProperty('--show-progress', 0);
      playUI('playing');playStep.textContent = localize("01 / 起因", "01 / WHY");cueShow();
    }
    function pauseShow() {
      if (showState !== 'playing') return;
      cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;playUI('paused');
    }
    function takeOver() {
      showRequest++;
      cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;elapsed = 0;
      playUI('ready');playStep.textContent = localize("起因 · 做法 · 边界", "Why · How · Limits");
      playButton.style.setProperty('--show-progress', 0);specimen?.setPresentation(null);
    }
    playButton.addEventListener('click', () => {
      if (showState === 'playing') pauseShow();
      else if (showState === 'paused') {lastShowTime = 0;playUI('playing');cueShow();}
      else startShow();
    });
    document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
      chooseProject(button.dataset.project);startShow();
    }));
    const cut = () => document.dispatchEvent(new CustomEvent('found', {detail: 'work-cut'}));
    document.querySelectorAll('[data-depth]').forEach(button => button.addEventListener('click', () => {
      takeOver();spread.value = button.dataset.depth;updateWork();cut();
    }));
    spread.addEventListener('pointerdown', takeOver);
    spread.addEventListener('input', () => {takeOver();updateWork();cut();});
    sculpture.addEventListener('pointerdown', event => {if (event.button === 0 && !event.target.closest('button,a,input')) takeOver();});
    sculpture.addEventListener('keydown', event => {if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) && !event.target.closest('button,a,input')) takeOver();});
    room.enter = () => {workActive = true; if (!enteredWork) startShow(500);};
    room.leave = () => {workActive = false; showRequest++; pauseShow();};
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;}
      else if (workActive) cueShow();
    });
    dragRange(sculpture, spread, 'clientY', () => 180 / sculpture.getBoundingClientRect().height);
    chooseProject(projectKey);
  },
};
export default room;
