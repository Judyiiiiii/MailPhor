(function(root){
  'use strict';
  const KEY='mailphor.language.v1';
  const entries={
    '发现值得投入的机会':'Discover what comes next',
    '根据你的背景整理、比较与跟进，不错过重要的下一步。':'A clearer way to discover, compare and follow through.',
    '为你推荐':'For you','全部机会':'All opportunities','我的收藏':'Saved','已申请 / 报名':'Applications','已申请 / 已报名':'Applied / registered','已忽略':'Hidden',
    '背景与偏好':'Profile & preferences','邮件处理记录':'Processing history','体验 Demo':'Explore demo','个人机会工作台':'Your opportunity workspace','保存在本机 · Local-first':'Stored on this device · Local-first',
    '页面数据读取时间（非邮箱同步）':'List refreshed (not mailbox sync)','邮箱连接与最近同步':'Mailbox & sync',
    '同步一轮':'Sync once','开启定时检查':'Enable periodic sync','停止定时检查':'Stop periodic sync',
    '同步会读取已配置邮箱，并将选定邮件正文发送到配置的 AI 服务。默认每轮 5 封；重新分析队列优先。停止定时检查不会立即中断当前批次。电脑和程序需保持运行。':'Sync reads the configured mailbox and sends selected message text to your AI provider. Default: five messages per batch; queued reanalysis first. Stopping prevents the next batch; keep this app and computer running.',
    'My Profile / 我的背景与偏好（可跳过）':'My profile & preferences (optional)',
    '仅保存在当前浏览器，不发送给 AI。可随时修改；更新后重新排序，不重读邮件。换浏览器或清理网站数据会丢失个人设置。':'Stored in this browser, not sent to AI. Edit at any time to rerank saved opportunities without rereading mail. Changing browsers or clearing site data removes access to these settings.',
    'Major / 专业':'Major','Year / 年级':'Year','暂不填写':'Not now','Skills / 技能（逗号分隔）':'Skills (comma-separated)','GPA（选填，与原文同一计分尺度）':'GPA (optional; use the source scale)',
    'Goals / 当前目标（多选）':'Current goals (select any)','Interests / 兴趣方向（多选）':'Interests (select any)','每周可投入时间':'Available time each week','地区、线上/线下偏好':'Location / online preference','费用接受度':'Budget preference','推荐风格':'Discovery style',
    '优先明确相关':'Focus on clear matches','愿意探索新方向':'Open to exploring','保存画像并更新推荐':'Save & update recommendations','填入我的已知背景（待保存）':'Prefill known background (review first)','跳过 / 稍后设置':'Skip for now',
    '技术与硬件 AI':'Technology, hardware & AI','学术研究':'Academic research','职业发展':'Career development','学生组织':'Student organisations','体育健康':'Sports & wellness','文化兴趣':'Culture & interests','人脉与导师交流':'Networking & mentorship','组织经历':'Organisation experience','运动健康':'Sports & wellness','兴趣探索':'Explore new interests',
    'Internship / 实习':'Internships','Research / 科研':'Research','Projects / 项目':'Projects','Study / 升学交流':'Study & exchange','Networking / 人脉':'Networking',
    '筛选与排序':'Filter & sort','查看':'View','推荐（隐藏已忽略）':'For you (excluding hidden)','优先级':'Priority','全部子类':'All event types','活动类型':'Event type','排序':'Sort by','全部':'All',
    '优先关注':'Prioritise','值得考虑':'Consider','待评估':'Not assessed','低相关':'Lower relevance','推荐优先':'Recommended first','截止日期（已标准化日期优先）':'Deadline (standardised dates first)','最新收录':'Recently added',
    'Career / 职业发展':'Career','Technical / 技术实践':'Technical','Academic / 学术':'Academic','Industry / 行业':'Industry','Student Organisations / 学生组织':'Student organisations','Sports & Wellness / 体育健康':'Sports & wellness','Culture / 文化兴趣':'Culture & interests','其他':'Other',
    'All / 全部':'All','Jobs & Internships / 岗位实习':'Jobs & internships','Projects & Competitions / 项目与比赛':'Projects & competitions','Scholarships & Funding / 奖学金与资助':'Scholarships & funding','Events & Communities / 活动与社群':'Events & communities','Exchange / 交换交流':'Exchange & study','Networking / 人脉交流':'Networking & mentorship',
    '刷新机会列表（不读取邮箱）':'Refresh list','你的机会清单':'Your opportunities','推荐依据：':'Why this appears: ',
    '收藏':'Save','取消收藏':'Unsave','忽略':'Hide','恢复显示':'Unhide','未行动':'Not started','准备中':'Preparing','已完成':'Completed','兴趣反馈':'Your interest','感兴趣':'Interested','不感兴趣':'Not interested',
    'Core Highlight / 核心重点':'At a glance','Checklist / 准备清单':'Checklist','原文申请 ↗':'Open application ↗','Copy Prompt for AI':'Copy context for AI','Copy Push Summary':'Copy summary',
    '资格：':'Eligibility: ','未发现明确资格要求':'No explicit requirements found','存在明确不符合项':'Known requirement mismatch','待确认':'Needs confirmation',
    '基础规则匹配，非 AI 深度资格审核':'Rule-based matching, not an AI eligibility review','。推荐等级与截止紧迫度独立；不保证录取。':'. Priority and deadline urgency are separate; acceptance is not guaranteed.',
    '类别与所选目标相关':'This category relates to a selected goal','内容与你选择的兴趣方向相关':'Related to a selected interest','内容与你的专业方向相关；不代表满足全部资格':'Related to your major; eligibility is not guaranteed',
    '按你的探索偏好保留此机会':'Included because you are open to exploring','当前画像未发现明确关联，仍可在全部机会中查看':'No clear profile match; still available in All opportunities','你标记了感兴趣':'You marked this as interesting','你标记了不感兴趣':'You marked this as not interesting',
    '尚未设置画像，不推测你的兴趣与资格':'No profile yet; interests and eligibility are not assumed','需要确认年级门槛':'Confirm the year requirement','已知年级匹配；其余资格仍需核对':'Known year requirement matches; check other requirements','已知 GPA 门槛匹配；仍需核对原文':'Known GPA threshold matches; verify the source','原文有资格要求，尚需人工核对':'Source includes requirements that need review','需核对毕业、学历或工作经验要求，不能仅凭 Year 2 判断符合':'Check graduation, degree and work experience requirements; Year 2 alone does not establish eligibility',
    '可投入时间需与原文安排对照':'Compare availability with the schedule','地区及工作许可条件需确认':'Confirm location and work permission','费用预算需与原文核对':'Compare budget with source costs',
    '已保存在当前浏览器。':'Saved in this browser.','已保存到独立 Demo 空间，不影响真实画像与操作。':'Saved to the separate demo space; personal settings are unchanged.',
    '已填入已知背景，兴趣未替你选择；点击保存后生效。':'Known background prefilled; interests are yours to choose. Save to apply.',
    '尚未设置画像：你可以先浏览全部机会，推荐会标为待评估。':'No profile yet. Browse all opportunities; priority remains unassessed.',
    '画像尚未保存：当前优先级为待评估；打开“我的背景与偏好”设置后生效。':'No saved profile. Open My profile to enable recommendations.',
    '专业未填':'Major not set','年级未填':'Year not set','技能未填':'Skills not set','。推荐在本地更新；资格以原文为准。':'. Recommendations update locally; verify eligibility in the source.',
    '画像已生效':'Profile active','当前排序：':'Sort: ','全部已收录机会：':'All saved opportunities: ','同等级按匹配依据多少、再按已知截止日期排序。':'Within each tier: matching evidence, then known deadline.',
    ' 当前卡片等级相同，排序可能变化不明显；系统不会为制造差异强行分级。':' These cards share a tier; their order may change little. Different tiers are not forced.',
    'Deadline / 截止：':'Deadline: ','Unknown':'Unknown','查看详情':'View details','类型：':'Type: ','尚未细分':'Not classified','详细信息':'Details','No details / 暂无详细字段。':'No additional details.',
    '来源：':'Source: ','来源性质：':'Source type: ','未知邮件':'Unknown message','外部邮件转发（不代表学校官方招聘）':'Forwarded external mail (not an official university posting)','平台或官方性质尚未确认，请核对原邮件':'Source type unconfirmed; check the original email',
    '旧卡片：尚未提取原文证据':'Older card: source evidence not yet extracted','有原文片段，待人工核对':'Source excerpt available; verify manually','缺少可核对的原文证据':'No verified source quote',
    '没有原文证据片段，请核对源邮件。':'No source quote available; check the original email.','截止日期依据：':'Deadline evidence: ','原文未确认申请截止日期':'No confirmed application deadline','打开原文申请链接 ↗':'Open source application link ↗','查看邮件正文节选':'Read source excerpt',
    '本次提取未发现明确准备事项，请核对原邮件。':'No explicit preparation steps were extracted; verify the source.','这张卡片尚未提取准备清单，需要重新分析原邮件。':'Checklist not extracted yet. Reanalyse the source message.',
    '正文节选不保证覆盖附件或图片中的信息，请核对原邮件。':'The excerpt may omit attachments or image text. Check the original email.','此卡片的正文完整性尚未确认，请核对原邮件及附件。':'Text completeness is unconfirmed. Check the email and attachments.','正文可能不完整：达到读取或分析长度上限。附件与图片文字未完整解析。':'Text may be incomplete due to reading limits. Attachments and image text are not fully parsed.',
    'DEMO · 这里展示虚构机会，画像和操作独立保存，不混入你的真实数据。':'DEMO · Synthetic opportunities and separate preferences. Personal data is unchanged.','返回个人工作台 →':'Return to personal workspace →','虚构 Demo，不可申请':'Synthetic demo; not open for applications',
    '暂无记录。下一轮真实邮件处理后生成；不会自动回填历史邮件。':'No records yet. Records are created on the next real processing run; history is not backfilled.',
    '尚无记录。下一轮真实邮件处理后生成；不会自动回填历史邮件。':'No records yet. Records are created on the next real processing run; history is not backfilled.',
    '判断理由：':'Reason: ','处理方式：':'Method: ','提取机会：':'Extracted opportunity: ','查看 AI 请求诊断':'AI request diagnostics','核对读取到的正文':'Review captured email text','加入下轮重新分析':'Queue for reanalysis','已加入队列，等待同步':'Queued; waiting for sync','刷新记录（不调用 AI）':'Refresh records (no AI call)','查看诊断展示示例（模拟，不调用 AI）':'Preview diagnostics (simulated; no AI call)',
    '处理状态':'Processing status','未提取机会 · 重点复核':'No opportunity extracted — review','未提取机会 · 需要复核':'No opportunity extracted — review','已提取':'Extracted','重复':'Duplicate','暂缓，不代表无关':'Deferred, not irrelevant','失败，不代表无关':'Failed, not irrelevant','暂缓':'Deferred','失败':'Failed','疑似漏选':'Possible omission','疑似漏选 · 待人工复核':'Possible omission — review',
    '← 返回机会列表':'← Back to opportunities','← 机会工作台':'← Opportunity workspace','≡ 邮件处理记录':'Processing history',
    '明确报名模板（未调用 AI）':'Explicit signup template (no AI call)','AI 分析':'AI analysis','历史记录未标注':'Not recorded for this older entry',
    '此记录未保存诊断信息，不能追溯具体模型失败原因。':'Diagnostics were not saved for this entry; the exact failure cannot be reconstructed.','本次使用模板规则，没有 AI 请求。':'Template rules used; no AI request was made.','未读取到正文，请核对原邮件。':'No captured text; check the original email.',
    '本地个人数据格式不正确，未覆盖原数据':'Local personal data is invalid; originals were not overwritten','个人数据无法读取，未覆盖原数据：':'Cannot read personal data; originals preserved: ','保存失败，未标记成功：':'Save failed; not marked as saved: ',
    'Demo 不连接邮箱，同步按钮不可用。':'Demo does not connect to mail; sync is disabled.','Demo 模式：虚构样例，不连接邮箱、不调用 AI。正式模式会在这里显示实际同步结果。':'Demo uses synthetic data, without mailbox or AI access. Personal mode shows real sync results here.',
    '尚无同步统计。刷新列表不会读取邮箱；需通过 once 或 watch 运行同步。':'No sync statistics yet. Refresh does not read mail; use Sync once or periodic sync.',
    '无法读取同步状态，请查看终端；不能据此判断同步成功。':'Unable to read sync status. Check the terminal; success is unconfirmed.',
    '同步控制状态无法读取；如刚更新过程序，请重启服务。':'Unable to read sync controls. Restart the local service if it was recently updated.',
    '当前没有网页启动的后台同步。':'No background sync started from this page.','定时检查已开启。':'Periodic sync is enabled.','正在同步一轮。':'One sync batch is running.','停止请求已收到，等待当前批次结束。':'Stop requested; waiting for the current batch to finish.',
    '原文申请':'Source application','原文内容':'Original content','已保存摘要保留原语言；切换界面不会自动调用AI翻译。':'Saved summaries and checklist items keep their original language. Switching the interface does not call AI for translation.',
    '搜索岗位、项目、机构或关键词…':'Search roles, projects, organisations…','例如 4 小时，或暂不确定':'e.g. 4 hours, or undecided','例如 Hong Kong，线上也可':'e.g. Hong Kong; online is fine','例如仅免费，或视情况':'e.g. free only, or flexible',
    '跳到机会列表':'Skip to opportunities','机会导航':'Opportunity navigation','搜索机会':'Search opportunities','邮箱同步状态尚未读取。':'Mailbox sync status has not loaded yet.',
    '用于检查漏选。仅包含此功能上线后实际交给 AI 处理的邮件；历史处理、来源规则排除、Outlook 未转发的邮件不在此列表。正文是节选，请对照原邮箱。':'Review possible omissions. Only messages attempted since processing records were introduced appear here. Previously processed messages, source-filter exclusions and mail not forwarded by Outlook are not included. Captured text is an excerpt; check your mailbox.',
    '未记录理由':'No reason recorded','请求模型：':'Requested model: ','实际模型：':'Actual model: ','结束原因：':'Finish reason: ','耗时：':'Elapsed: ','回复长度：':'Response length: ','错误类型：':'Error type: ','说明：':'Details: ',
    '模拟示例，非真实邮件 · ':'Simulated examples, not real mail · ','[模拟]':'[Simulated]','旧记录无诊断':'Older entry without diagnostics','模板提取':'Template extraction','AI 正常返回':'AI returned successfully','回复截断':'Truncated response','网络超时':'Network timeout','Technical Workshop / 技术实践':'Technical workshop','Academic / 学术交流':'Academic exchange','Industry / 行业分享':'Industry insight','Culture & Interests / 文化兴趣':'Culture & interests','Other / 其他':'Other'
  };
  const ordered=Object.keys(entries).sort((a,b)=>b.length-a.length);
  function translate(text,language){
    if(language!=='en')return text;
    if(entries[text])return entries[text];
    if(entries[text.trim()])return text.replace(text.trim(),entries[text.trim()]);
    let value=text;
    for(const key of ordered){if(key.length>=3)value=value.split(key).join(entries[key]);}
    value=value.replace(/(\d+) 个机会/g,'$1 opportunities').replace(/共 (\d+) 条记录，当前显示 (\d+) 条。/g,'$1 records; showing $2.').replace(/当前 Year (\d+)/g,'current Year $1').replace(/要求 Year (\d+)\+/g,'Requires Year $1+').replace(/原文要求 GPA ([\d.]+)，你的 GPA 未填写/g,'Source requires GPA $1; your GPA is not set').replace(/GPA 低于原文 ([\d.]+) 门槛/g,'GPA is below the stated $1 threshold').replace(/内容涉及你的技能：/g,'Involves your skills: ').replace(/；不等于资格已符合/g,'; this does not establish eligibility').replace(/当前显示/g,'Showing');
    return value;
  }
  let language='zh';
  try{language=localStorage.getItem(KEY)==='en'?'en':'zh';}catch{}
  const originals=new WeakMap();
  let paintedEnglish=false;
  function originalContent(node){return node.parentElement?.closest('[data-original],.title,.organization,.summary,.highlight,.todo-text,blockquote,pre:not([data-interface])');}
  function paint(){
    if(typeof document==='undefined')return;
    document.documentElement.lang=language==='en'?'en':'zh-Hans';
    if(language==='zh'&&!paintedEnglish)return;
    if(language==='en')paintedEnglish=true;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;
    while(node=walker.nextNode()){
      if(!node.nodeValue.trim()||node.parentElement?.closest('script,style')||originalContent(node))continue;
      let saved=originals.get(node);
      if(!saved||node.nodeValue!==saved.painted)saved={original:node.nodeValue};
      const output=translate(saved.original,language);
      saved.painted=output;originals.set(node,saved);
      if(node.nodeValue!==output)node.nodeValue=output;
    }
    document.querySelectorAll('[placeholder]').forEach(input=>{
      if(!input.dataset.originalPlaceholder)input.dataset.originalPlaceholder=input.placeholder;
      input.placeholder=translate(input.dataset.originalPlaceholder,language);
    });
    document.querySelectorAll('[aria-label]').forEach(input=>{
      if(!input.dataset.originalAria)input.dataset.originalAria=input.getAttribute('aria-label');
      input.setAttribute('aria-label',translate(input.dataset.originalAria,language));
    });
    const selector=document.querySelector('#language-switch');if(selector)selector.value=language;
  }
  function setLanguage(next){
    language=next==='en'?'en':'zh';
    try{localStorage.setItem(KEY,language);}catch{}
    paint();
    if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('mailphor-language',{detail:language}));
  }
  function boot(){
    const select=document.querySelector('#language-switch');if(select)select.onchange=()=>setLanguage(select.value);
    paint();
    let scheduled=false;
    const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;observer.disconnect();paint();observer.observe(document.body,{childList:true,subtree:true,characterData:true});});});
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  const api={translate,getLanguage:()=>language,setLanguage,paint,boot};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else{root.MailPhorI18n=api;document.addEventListener('DOMContentLoaded',boot,{once:true});}
})(typeof globalThis!=='undefined'?globalThis:this);
