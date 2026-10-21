(function (root) {
  'use strict';
  const KEY = 'mailphor.personal.v1';
  const ranks = {high:0,consider:1,pending:2,low:3};
  const labels = {high:'优先关注',consider:'值得考虑',pending:'待评估',low:'低相关'};
  const interests = {technical:['embedded','robotics','python','c++','hardware','ai','技术','硬件'],academic:['research','seminar','academic','科研','学术'],career:['internship','career','engineer','实习','岗位'],student_organisation:['society','club','eehs','社团','学生组织'],sports_wellness:['marathon','sport','wellness','体育','运动','马拉松'],culture_interests:['art','music','culture','艺术','文化'],networking:['networking','mentoring','alumni','校友','导师']};
  const goals = {internship:['internship'],research:['internship','competition','event'],project:['competition'],study:['exchange','scholarship'],networking:['networking'],organisation:['event'],wellness:['event'],explore:['exchange','event']};
  function read(storage,key=KEY) {
    const raw = storage.getItem(key);
    if (!raw) return {version:1,profile:null,actions:{}};
    const state = JSON.parse(raw);
    if (!state || state.version !== 1 || typeof state.actions !== 'object' || !state.actions || Array.isArray(state.actions)) throw Error('本地个人数据格式不正确，未覆盖原数据');
    return state;
  }
  function save(storage,state,key=KEY) { storage.setItem(key,JSON.stringify(state)); }
  function actionFor(state,id) { return state.actions[id] || {favorite:false,ignored:false,status:'none',checked:{},feedback:''}; }
  function updateAction(state,id,patch) { return {...state,actions:{...state.actions,[id]:{...actionFor(state,id),...patch}}}; }
  function words(value) { return String(value || '').toLowerCase(); }
  function contains(text,term) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp('(^|[^a-z0-9])'+escaped+'($|[^a-z0-9])','i').test(text);
  }
  function evaluate(item,profile,action={}) {
    const reasons=[], checks=[], gaps=[];
    const detail = item.details && typeof item.details==='object' && !Array.isArray(item.details) ? item.details : {};
    const eligibility = Object.entries(detail).filter(([key])=>/eligib|require|gpa|experience/i.test(key)).map(([,value])=>String(value)).join(' ');
    let qualification = eligibility ? '待确认' : '未发现明确资格要求';
    const requirements = words(eligibility);
    const year = requirements.match(/\byear\s*(\d)\s*(?:\+|or above|and above|以上)/i);
    const gpa = requirements.match(/\b(?:c?gpa)\s*(?:of\s*)?(?:>=|≥|at least|minimum|:)?\s*(\d(?:\.\d+)?)/i);
    if (year) {
      if (!profile?.year) checks.push('需要确认年级门槛');
      else if (Number(profile.year)<Number(year[1])) gaps.push(`要求 Year ${year[1]}+，当前 Year ${profile.year}`);
      else checks.push('已知年级匹配；其余资格仍需核对');
    }
    if (gpa) {
      if (profile?.gpa === '' || profile?.gpa == null) checks.push(`原文要求 GPA ${gpa[1]}，你的 GPA 未填写`);
      else if (Number(profile.gpa)<Number(gpa[1])) gaps.push(`GPA 低于原文 ${gpa[1]} 门槛`);
      else checks.push('已知 GPA 门槛匹配；仍需核对原文');
    }
    if (/\b(?:fresh graduat|graduates? only|bachelor.?s degree|\d+\s*(?:-|–|to)?\s*\d*\s*years?.{0,12}experience)/i.test(requirements)) checks.push('需核对毕业、学历或工作经验要求，不能仅凭 Year 2 判断符合');
    if (eligibility && !checks.length && !gaps.length) checks.push('原文有资格要求，尚需人工核对');
    if (gaps.length) qualification='存在明确不符合项';
    let level='pending';
    let strength=0;
    if (profile) {
      const text=words([item.title,item.summary,item.subcategory,...Object.values(detail),...(Array.isArray(item.tags)?item.tags:[])].join(' '));
      let score=0;
      for (const goal of profile.goals || []) {
        if ((goals[goal] || []).includes(item.category)) {
          if (goal==='organisation' && item.subcategory!=='student_organisation') continue;
          if (goal==='wellness' && item.subcategory!=='sports_wellness') continue;
          if (goal==='research' && !/research|科研|academic|学术/.test(text)) continue;
          score+=1;reasons.push('类别与所选目标相关');break;
        }
      }
      const matches=(profile.interests||[]).filter(interest=>item.subcategory===interest || item.category===interest || (interests[interest]||[]).some(term=>contains(text,term)));
      if(matches.length){score+=2;reasons.push('内容与你选择的兴趣方向相关');}
      const skills=(profile.skills||[]).filter(skill=>contains(text,words(skill)));
      if(skills.length){score+=1;reasons.push('内容涉及你的技能：'+skills.join('、')+'；不等于资格已符合');}
      const major=words(profile.major);
      const eeMajor=/electr(?:onic|ical)|\beee?\b|电子|電[子機]|电气/.test(major);
      const majorMatch=major && (contains(text,major) || eeMajor && ['electrical engineering','electronic engineering','electronics','embedded','eehs','电气','电子','電機'].some(term=>contains(text,term)));
      if(majorMatch){score+=1;reasons.push('内容与你的专业方向相关；不代表满足全部资格');}
      if(action.feedback==='interested'){score+=2;reasons.push('你标记了感兴趣');}
      level=score>=3?'high':score>0?'consider':profile.exploration==='open'?'consider':'low';
      if(!reasons.length)reasons.push(level==='consider'?'按你的探索偏好保留此机会':'当前画像未发现明确关联，仍可在全部机会中查看');
      if(gaps.length || action.feedback==='not_interested')level='low';
      if(action.feedback==='not_interested')reasons.push('你标记了不感兴趣');
      strength=score;
    } else reasons.push('尚未设置画像，不推测你的兴趣与资格');
    if(profile?.availability)checks.push('可投入时间需与原文安排对照');
    if(profile?.location)checks.push('地区及工作许可条件需确认');
    if(profile?.budget)checks.push('费用预算需与原文核对');
    return {level,label:labels[level],rank:ranks[level],strength,reasons,qualification,checks,gaps,method:'基础规则匹配，非 AI 深度资格审核'};
  }
  function deadlineValue(item) {
    const match=String(item.deadline||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return Infinity;
    const value=Date.parse(match[0]+'T00:00:00Z');
    return Number.isNaN(value)||new Date(value).toISOString().slice(0,10)!==match[0]?Infinity:value;
  }
  function comparePriority(a,b,profile,actions={}){
    const first=evaluate(a,profile,actions[a.id]||{}),second=evaluate(b,profile,actions[b.id]||{});
    return first.rank-second.rank || second.strength-first.strength || (deadlineValue(a)-deadlineValue(b) || 0);
  }
  const api={KEY,read,save,actionFor,updateAction,evaluate,deadlineValue,comparePriority};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.MailPhorPersonal=api;
})(typeof globalThis!=='undefined'?globalThis:this);
