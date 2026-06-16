/* 差旅报告 需求原型 SPA —— 脱敏示例数据；版式贴合原页面 */
(function () {
  "use strict";

  var C = {
    air:'#5b8ff9', hotel:'#fac858', train:'#b39ddb', car:'#3fc8c2',
    meal:'#ff7d7d', other:'#8b7fd6', blue:'#5b8ff9', orange:'#fac858',
    teal:'#3fc8c2', purple:'#8b7fd6'
  };

  /* ---------- 组件 ---------- */
  function donut(segs, legend, tips){
    var acc=0;
    var stops=segs.map(function(s){var a=acc;acc+=s.pct;return s.color+' '+a+'% '+acc+'%';}).join(',');
    var hasTip=!!(tips&&tips.length);
    var leg=legend.map(function(l,i){
      var attr=(hasTip&&tips[i]!=null)?(' class="has-tip" data-tip="'+tips[i]+'"'):'';
      return '<div'+attr+'><span class="dot" style="background:'+l.color+'"></span>'+l.label+'</div>';
    }).join('');
    var dCls='donut'+(hasTip?' has-donut-tip':'');
    var dData=hasTip?(' data-segs="'+segs.map(function(s){return s.pct;}).join(',')+'" data-tips="'+tips.join('~~')+'"'):'';
    return '<div class="donut-wrap"><div class="'+dCls+'" style="background:conic-gradient('+stops+')"'+dData+'></div><div class="legend">'+leg+'</div></div>';
  }
  function trendBars(vals, max, unit, yoyArr){
    var steps=5, yl=[];
    for(var i=steps;i>=0;i--){ yl.push((max/steps*i)+unit); }
    var data=vals.map(function(v,idx){return {label:'2026-'+(idx+1), val:v+unit, h:Math.round(v/max*190)};});
    var ys=yl.map(function(t,i){return '<div style="top:'+(i/(yl.length-1)*100)+'%">'+t+'</div>';}).join('');
    var bs=data.map(function(d){return '<div class="bar-col"><div class="bar-val">'+d.val+'</div><div class="bar" style="height:'+d.h+'px"></div></div>';}).join('');
    var xs=data.map(function(d,i){
      var yo='';
      if(yoyArr && yoyArr[i]!=null){
        var r=yoyArr[i], g=vals[i]-vals[i]/(1+r);
        yo='<div class="x-yoy">同比 '+deltaSpan(g,unit,2)+' <span class="x-yoy-rate">'+yoy(r*100)+'</span></div>';
      }
      return '<span>'+d.label+yo+'</span>';
    }).join('');
    return '<div class="chart"><div class="y-axis">'+ys+'</div><div class="bars">'+bs+'</div></div><div class="x-labels">'+xs+'</div>';
  }
  function stackBars(items, max, unit, legend){
    var steps=5, yl=[];
    for(var i=steps;i>=0;i--){ yl.push((max/steps*i)+unit); }
    var ys=yl.map(function(t,i){return '<div style="top:'+(i/(yl.length-1)*100)+'%">'+t+'</div>';}).join('');
    var bs=items.map(function(d){
      var segs=d.segs.map(function(s){return '<div class="bar-seg" style="height:'+Math.round(s.v/max*190)+'px;background:'+s.color+'"></div>';}).join('');
      var total=d.segs.reduce(function(a,s){return a+s.v;},0);
      return '<div class="bar-col"><div class="bar-val">'+(Math.round(total*100)/100)+unit+'</div><div class="bar-stack">'+segs+'</div></div>';
    }).join('');
    var xs=items.map(function(d){return '<span>'+d.label+'</span>';}).join('');
    var leg='<div class="legend-row">'+legend.map(function(l){return '<div><span class="dot" style="background:'+l.color+'"></span>'+l.label+'</div>';}).join('')+'</div>';
    return leg+'<div class="chart"><div class="y-axis">'+ys+'</div><div class="bars">'+bs+'</div></div><div class="x-labels">'+xs+'</div>';
  }
  function lineChart(labels, series){
    var W=100, H=42, n=labels.length, gmax=0;
    series.forEach(function(s){ s.vals.forEach(function(v){ if(v>gmax) gmax=v; }); }); if(!gmax) gmax=1;
    var body=series.map(function(s){
      var pts=s.vals.map(function(v,i){ var x=(n<=1)?4:(i/(n-1))*(W-8)+4; var y=H-4-(v/gmax)*(H-9); return x.toFixed(1)+','+y.toFixed(1); });
      var dots=pts.map(function(p){var c=p.split(','); return '<circle cx="'+c[0]+'" cy="'+c[1]+'" r="0.7" fill="'+s.color+'"/>';}).join('');
      return '<polyline fill="none" stroke="'+s.color+'" stroke-width="0.8" points="'+pts.join(' ')+'"/>'+dots;
    }).join('');
    var leg=series.map(function(s){return '<span style="display:inline-flex;align-items:center;gap:5px;margin:0 12px"><span style="width:16px;height:3px;background:'+s.color+';display:inline-block;border-radius:2px"></span>'+s.name+'</span>';}).join('');
    var xs=labels.map(function(l){return '<span style="flex:1;text-align:center">'+l+'</span>';}).join('');
    return '<div style="font-size:12px;color:#606266;text-align:center;margin-bottom:6px">'+leg+'</div>'
      + '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" style="width:100%;height:180px;display:block;border-bottom:1px solid #f0f0f0">'+body+'</svg>'
      + '<div style="display:flex;padding-top:4px;font-size:12px;color:#909399">'+xs+'</div>';
  }
  /* ---------- 通用图表/表格组件 ---------- */
  function nf(n,d){ d=(d==null?2:d); return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}); }
  /* 分类纵向柱状图（柱顶标值，支持横向滚动） items:[{label,val,disp}] */
  function vbar(items, opts){
    opts=opts||{}; var color=opts.color||'#8c9eea', unit=opts.unit||'';
    var max=opts.max||(Math.max.apply(null,items.map(function(d){return Math.abs(d.val);}))||1); max=max*1.18;
    var steps=4, yl=[]; for(var i=steps;i>=0;i--){ yl.push((Math.round(max/steps*i*100)/100)+unit); }
    var ys=yl.map(function(t,i){return '<div style="top:'+(i/(yl.length-1)*100)+'%">'+t+'</div>';}).join('');
    var bw=opts.barw||26, cw=bw+20, W=items.length*cw+50;
    var bs=items.map(function(d){
      var h=Math.max(2,Math.round(Math.abs(d.val)/max*168));
      var cls='bar'+(d.tip?' has-tip':'')+(d.drill!=null?' drill':'');
      var attrs=(d.tip?' data-tip="'+d.tip+'"':'')+(d.drill!=null?' data-drill="'+d.drill+'"'+(d.cnt!=null?' data-cnt="'+d.cnt+'"':''):'');
      var cur=(d.tip||d.drill!=null)?';cursor:pointer':'';
      return '<div class="bar-col" style="min-width:'+cw+'px"><div class="bar-val">'+(d.disp!=null?d.disp:(d.val+unit))+'</div><div class="'+cls+'" style="height:'+h+'px;width:'+bw+'px;background:'+color+cur+'"'+attrs+'></div></div>';
    }).join('');
    var yoyUnit=opts.yoyUnit||'';
    var xs=items.map(function(d){
      var yo='';
      if(d.yoy!=null){ var g=d.val-d.val/(1+d.yoy); yo='<div class="x-yoy">同比 '+deltaSpan(g,yoyUnit,0)+' <span class="x-yoy-rate">'+yoy(d.yoy*100)+'</span></div>'; }
      return '<span style="min-width:'+cw+'px;font-size:11px">'+d.label+yo+'</span>';
    }).join('');
    return '<div class="tbl-wrap"><div class="chart" style="min-width:'+W+'px"><div class="y-axis">'+ys+'</div><div class="bars">'+bs+'</div></div>'
      + '<div class="x-labels" style="min-width:'+W+'px">'+xs+'</div></div>';
  }
  /* 千分位金额（两位小数，脱离 locale 依赖） */
  function fmtAmt(v){ var s=(Math.round(v*100)/100).toFixed(2).split('.'); return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+s[1]; }
  /* 热门 TOP15：柱状（悬停 tooltip 含同比）+ 明细表（含同比列）—— 需求12② */
  function hotTop(title, rows){
    var bars=rows.map(function(r){ var avg=r.amt/r.nt;
      // data-tip 用 || 分段：名称 | 消费金额 | 预订间夜 | 间夜均价 | 同比（悬浮浮层按段渲染）
      var tip=r.n+'||消费金额：'+fmtAmt(r.amt)+'元||预订间夜：'+r.nt+'||间夜均价：'+fmtAmt(avg)+'元||同比：'+(r.yoy>=0?'+':'')+r.yoy.toFixed(1)+'%';
      return {label:r.n, val:r.amt, disp:fmtAmt(r.amt), tip:tip};
    });
    return '<div class="sec-title mt">'+title+' <span class="new-tag">同比 新增</span></div>'
      + '<div class="hint">悬停柱子查看 消费金额 / 预订间夜 / 间夜均价 / <b>同比</b>。</div>'
      + vbar(bars,{color:C.blue,barw:24});
  }
  /* 柱状图自定义悬停浮层（仿真实系统 tooltip） */
  function bindBarTip(root){
    if(!root) return;
    var bars=root.querySelectorAll('.bar.has-tip'); if(!bars.length) return;
    var tip=document.getElementById('barTip');
    if(!tip){ tip=document.createElement('div'); tip.id='barTip'; tip.className='chart-tip'; document.body.appendChild(tip); }
    bars.forEach(function(b){
      b.addEventListener('mouseenter',function(){
        var parts=(b.getAttribute('data-tip')||'').split('||');
        var html='<div class="ct-title">'+parts[0]+'</div>';
        for(var i=1;i<parts.length;i++){
          var st=''; if(parts[i].indexOf('同比：')===0){ st=parts[i].indexOf('-')>-1?'color:#f5222d':'color:#52c41a'; }
          html+='<div class="ct-row" style="'+st+'">'+parts[i]+'</div>';
        }
        tip.innerHTML=html; tip.style.display='block';
      });
      b.addEventListener('mousemove',function(e){
        var x=e.clientX+14, y=e.clientY+14;
        if(x+200>window.innerWidth) x=e.clientX-200;
        tip.style.left=x+'px'; tip.style.top=y+'px';
      });
      b.addEventListener('mouseleave',function(){ tip.style.display='none'; });
    });
  }
  /* 环形图悬停浮层（仿真实系统 tooltip，含同比）——需求18：分布环形图 tooltip 增加同比 */
  function bindDonutTip(root){
    if(!root) return;
    var tip=document.getElementById('barTip');
    if(!tip){ tip=document.createElement('div'); tip.id='barTip'; tip.className='chart-tip'; document.body.appendChild(tip); }
    function show(str,e){
      if(!str){ tip.style.display='none'; return; }
      var parts=str.split('||'), html='<div class="ct-title">'+parts[0]+'</div>';
      for(var i=1;i<parts.length;i++){
        var st=''; if(parts[i].indexOf('同比')===0){ st=parts[i].indexOf('-')>-1?'color:#f5222d':'color:#52c41a'; }
        html+='<div class="ct-row" style="'+st+'">'+parts[i]+'</div>';
      }
      tip.innerHTML=html; tip.style.display='block';
      var x=e.clientX+14, y=e.clientY+14; if(x+220>window.innerWidth) x=e.clientX-220;
      tip.style.left=x+'px'; tip.style.top=y+'px';
    }
    root.querySelectorAll('.donut.has-donut-tip').forEach(function(d){
      var segs=(d.getAttribute('data-segs')||'').split(',').map(Number);
      var tips=(d.getAttribute('data-tips')||'').split('~~');
      d.style.cursor='pointer';
      d.addEventListener('mousemove',function(e){
        var r=d.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
        var dx=e.clientX-cx, dy=e.clientY-cy, dist=Math.sqrt(dx*dx+dy*dy);
        var outer=r.width/2, inner=outer-r.width*(36/140);
        if(dist>outer||dist<inner){ tip.style.display='none'; return; }
        var ang=Math.atan2(dx,-dy)*180/Math.PI; if(ang<0) ang+=360;
        var pct=ang/360*100, acc=0, idx=segs.length-1;
        for(var i=0;i<segs.length;i++){ if(pct<acc+segs[i]){ idx=i; break; } acc+=segs[i]; }
        show(tips[idx], e);
      });
      d.addEventListener('mouseleave',function(){ tip.style.display='none'; });
    });
    root.querySelectorAll('.legend .has-tip').forEach(function(li){
      li.style.cursor='pointer';
      li.addEventListener('mousemove',function(e){ show(li.getAttribute('data-tip'), e); });
      li.addEventListener('mouseleave',function(){ tip.style.display='none'; });
    });
  }
  /* 轻量 toast 提示 */
  function toast(msg){
    var t=document.getElementById('toast');
    if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent='✓ '+msg; t.style.display='block';
    clearTimeout(t._tm); t._tm=setTimeout(function(){ t.style.display='none'; }, 2800);
  }
  /* 需求11：用车明细下穿 —— 由时间段柱子 / 场景行点击，生成订单明细（含成本中心 + 导出，遵循全局导出原则） */
  function carDetail(dimName, srcLabel, dimType, key, cnt){
    var ppl=['王敏','李强','张磊','刘洋','杨帆','赵丽'];
    var emp=['20160721222940752334','20160615092159473114','20200512192146904199','20190218162611176186','20210111091730098126','20230308123009041000'];
    var settle=['示例企业集团总部','华东核算中心','华南核算中心','西南核算中心','华北核算中心','华中核算中心'];
    var cc=['销售一部','市场推广部','技术研发部','客户服务中心','财务部','采购部'];
    var dept=['华东销售中心','品牌市场部','平台研发组','客服一部','资金结算部','集中采购部'];
    var travel=['因公','因公','因公','因公','因公','因私'];
    var sup=['滴滴出行','曹操出行','阳光出行','首汽约车','T3出行','神州专车'];
    var ctype=['实时用车','预约用车','接送机','实时用车','接送站','实时用车'];
    var vtype=['经济型','舒适型','商务型','经济型','豪华型','舒适型'];
    var scn=['21:30以后市内用车','出差','市内因公出行','客满通宵班次上班用车','会议会展'];
    var tslot=['0-6','22-24','6-8','8-10','18-20','12-14'];
    var clock=['03:24','23:18','07:48','08:51','19:05','13:15'];
    var tclock=['03:31','23:25','07:55','08:58','19:12','13:22'];
    var addrFrom=['成都市金牛区茶店子','成都市武侯区桐梓林','成都双流国际机场T2','成都高新区天府软件园','成都东站','成都市锦江区春熙路'];
    var addrTo=['成都市金牛区某写字楼','成都市新都区某园区','成都市武侯区某酒店','成都天府新区某中心','成都市金堂县某厂区','成都市温江区某基地'];
    var amts=[37.63,67.67,49.39,27.47,90.93,42.10];
    var kms=[8.2,21.5,12.0,6.4,18.7,9.3];
    var over=[0,0,12,0,35,0];
    var anom=['—','—','上车地址偏离','—','里程异常','—'];
    var N=6, rows='';
    for(var i=0;i<N;i++){
      var oid='26'+(50510+i*1373+key.length*17)+'013';
      var ooid='YP'+(80213000+i*1777+key.length*23);
      var seg=(dimType==='time')?key:tslot[(i+key.length)%tslot.length];
      var sc =(dimType==='scene')?key:scn[i%scn.length];
      var dd='2026-03-'+(10+i<10?'0'+(10+i):(10+i));
      var dur=Math.round(kms[i%6]*2.6);
      rows+=trow([oid, ooid, ppl[i%6], emp[i%6], '四川示例企业集团有限公司', settle[i%6], cc[i%6], dept[i%6], travel[i%6],
        sup[i%6], ctype[i%6], vtype[i%6], sc, seg, addrFrom[i%6], addrTo[i%6], dd+' '+clock[i%6], dd+' '+tclock[i%6],
        kms[i%6].toFixed(1), dur, fmtAmt(amts[i%6])+'元', fmtAmt(over[i%6])+'元', anom[i%6]]);
    }
    return '<div class="drill-head"><b>📋 订单明细 · '+dimName+'「'+key+'」</b>'
      + '<span class="drill-sub">下穿自「'+srcLabel+'」 · 约 '+cnt.toLocaleString()+' 笔（示例展示前 '+N+' 笔）</span>'
      + '<span class="drill-close" title="收起">✕</span></div>'
      + '<div class="callout">🔒 遵循<b>全局导出原则</b>：所有用车数据统一下穿到此<b>用车订单明细（口径同 CarConsumptionDetail 用车消费明细表）</b>，含<b>成本中心 / 核算单元 / 部门 / 公司</b>等组织字段；导出<b>受数据权限约束</b>；量级控制：必选时间范围、单次导出行数/时间上限、必要筛选项，超限提示缩小范围。</div>'
      + '<div style="margin:10px 0"><span class="export-btn js-export">⤓ 导出明细（Excel）</span></div>'
      + tableW(thead(['销售订单号','出票订单号','出行人','员工编号','所属公司','核算单元','成本中心','部门','因公/因私','用车供应商','用车类型','用车车型','用车场景','时间段','上车地址','下车地址','使用时间','交易完成时间','行驶里程(km)','行驶用时(min)','消费金额','超标支付金额','异常原因'])+rows)
      + '<div class="hint">* 示例脱敏数据；字段对齐用车消费明细表（CarConsumptionDetail）。实际下穿后由三方 BI（衡石）自带导出能力生成，限定条件以压测结果为准。</div>';
  }
  /* 底部"穿透用"明细面板（持久存在，点击后填充内容） */
  function drillPanel(id, title, hint){
    return '<div class="drill-box" id="'+id+'"><div class="drill-title">'+title+' <span class="opt-tag">穿透用</span></div>'
      + '<div class="drill-content" data-hint="'+hint+'"><div class="drill-empty">'+hint+'</div></div></div>';
  }
  /* 需求3：节约明细（按笔）—— 由潜在节省明细行点击下穿 */
  function saveDetail(line, typeName, cnt){
    var ppl=['张磊','李强','王敏','刘洋','陈静','杨帆'];
    var emp=['20200512192146904199','20160615092159473114','20160721222940752334','20190218162611176186','20180903112233445566','20210111091730098126'];
    var cc=['销售一部','市场推广部','技术研发部','客户服务中心','财务部','采购部'];
    var airRoute=['上海-北京','成都-深圳','北京-广州','上海-成都','深圳-上海','成都-杭州'];
    var hotelName=['全季(上海徐家汇)','上海静安诺富特','成都宽窄巷子城际','北京希尔顿','香港海景嘉福洲际','深圳亚朵'];
    var src=(line==='air')?['协议出票节省','差标管控节省','GP机票节省','协议退改节省','协议出票节省','差标管控节省']
                          :['协议价节省','差标管控节省','取消节省','协议价节省','差标管控节省','协议价节省'];
    var oprice=[2180,1560,2640,1980,2420,1760], sprice=[1850,1320,2210,1690,2090,1500];
    var dates=['2026-03-15','2026-03-28','2026-04-12','2026-04-25','2026-05-08','2026-05-20'];
    var colPlace=(line==='air')?'航线':'酒店名称';
    var N=6, rows='';
    for(var i=0;i<N;i++){
      var oid='260'+(3150012+i*131017+typeName.length*7);
      var place=(line==='air')?airRoute[i%6]:hotelName[i%6];
      var sv=oprice[i%6]-sprice[i%6];
      rows+=trow([oid, ppl[i%6], emp[i%6], cc[i%6], dates[i%6], place, fmtAmt(oprice[i%6])+'元', fmtAmt(sprice[i%6])+'元', fmtAmt(sv)+'元', src[i%6], typeName]);
    }
    return '<div class="drill-head"><b>📋 节约明细（按笔）· '+typeName+'</b>'
      + '<span class="drill-sub">下穿自「潜在节省明细」 · 约 '+cnt.toLocaleString()+' 笔（示例展示前 '+N+' 笔）</span>'
      + '<span class="drill-close" title="收起">✕</span></div>'
      + '<div class="callout">🔒 遵循<b>全局导出原则</b>：节约明细统一下穿到<b>消费报表（'+(line==='air'?'机票':'酒店')+'）</b>核对原始订单；<b>明细逐笔加总 = 报告节约总额</b>；导出<b>受数据权限约束</b> + 量级控制（必选时间范围、行数/时间上限）。</div>'
      + '<div style="margin:10px 0"><span class="export-btn js-export">⤓ 导出明细（Excel）</span></div>'
      + tableW(thead(['订单号','出行人','员工编号','成本中心','出行时间',colPlace,'原价','成交价','节约金额','节约来源','潜在节省类型'])+rows)
      + '<div class="hint">* 示例脱敏数据；字段口径同需求3。实际下穿后由三方 BI（衡石）自带导出能力生成，限定条件以压测结果为准。</div>';
  }
  function fillPanel(panel, html){
    if(!panel) return;
    var content=panel.querySelector('.drill-content'); if(!content) return;
    var hint=content.getAttribute('data-hint')||'';
    content.innerHTML=html;
    var cl=content.querySelector('.drill-close'); if(cl) cl.addEventListener('click',function(){ content.innerHTML='<div class="drill-empty">'+hint+'</div>'; });
    var ex=content.querySelector('.js-export'); if(ex) ex.addEventListener('click',function(){ toast('已触发导出（示例）：受数据权限约束 + 量级控制，文件将进入「下载管理」'); });
    if(panel.scrollIntoView) panel.scrollIntoView({behavior:'smooth', block:'center'});
  }
  /* ---------- 跳转「消费与节省明细」并带入查询条件 ---------- */
  var DETAIL_JUMP=null;
  var JUMP_DATE='2026年1月01日 — 2026年6月08日';
  function gotoDetail(line, from, conds){ DETAIL_JUMP={line:line, from:from, conds:conds||[]}; go('detail-'+line); }
  function jrow(line, from, conds, cells){
    var dc=conds.map(function(c){return c[0]+'::'+c[1];}).concat(['交易时间::'+JUMP_DATE]).join('~~');
    return '<tr class="js-jump" data-line="'+line+'" data-from="'+from+'" data-conds="'+dc+'">'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';
  }
  function jumpBanner(line){
    if(!DETAIL_JUMP || DETAIL_JUMP.line!==line) return '';
    var chips=DETAIL_JUMP.conds.map(function(c){return '<span class="jump-chip">'+c.k+'：<b>'+c.v+'</b></span>';}).join('');
    return '<div class="jump-note">↳ 由「'+DETAIL_JUMP.from+'」跳转带入查询条件：'+(chips||'<i>全部</i>')+'<span class="jump-clear">清除带入条件</span></div>';
  }
  function bindJump(root){
    if(!root) return;
    root.querySelectorAll('.js-jump').forEach(function(el){
      el.style.cursor='pointer';
      el.addEventListener('click',function(e){ e.stopPropagation();
        var conds=[]; (el.getAttribute('data-conds')||'').split('~~').forEach(function(p){ if(!p) return; var kv=p.split('::'); conds.push({k:kv[0],v:kv[1]||''}); });
        gotoDetail(el.getAttribute('data-line'), el.getAttribute('data-from')||'', conds);
      });
    });
    var clr=root.querySelector('.jump-clear');
    if(clr) clr.addEventListener('click',function(){ var nt=root.querySelector('.jump-note'); if(nt&&nt.parentNode) nt.parentNode.removeChild(nt); toast('已清除带入的查询条件'); });
  }
  function bindCarDrill(root){
    if(!root) return;
    root.querySelectorAll('.bar.drill[data-drill]').forEach(function(b){
      b.addEventListener('click',function(){ gotoDetail('car','用车时间段分布',[{k:'用车时间段',v:b.getAttribute('data-drill')},{k:'交易时间',v:JUMP_DATE}]); });
    });
    root.querySelectorAll('tr.drill-row[data-drill]').forEach(function(tr){
      tr.addEventListener('click',function(){ gotoDetail('car','用车场景消费情况',[{k:'用车场景类型',v:tr.getAttribute('data-drill')},{k:'交易时间',v:JUMP_DATE}]); });
    });
    root.querySelectorAll('tr.drill-row-save[data-drill]').forEach(function(tr){
      var line=tr.getAttribute('data-line');
      tr.addEventListener('click',function(){ gotoDetail(line, (line==='air'?'机票':'酒店')+'潜在节省明细',[{k:'潜在节省类型',v:tr.getAttribute('data-drill')},{k:'交易时间',v:JUMP_DATE}]); });
    });
  }
  /* 分组纵向柱状图（贵司 / 商旅 双系列） */
  function gbar(cats, sA, sB, opts){
    opts=opts||{}; var all=sA.vals.concat(sB.vals); var max=opts.max||(Math.max.apply(null,all)||1); max=max*1.18;
    var steps=4, yl=[]; for(var i=steps;i>=0;i--){ yl.push((Math.round(max/steps*i*100)/100)+(opts.unit||'')); }
    var ys=yl.map(function(t,i){return '<div style="top:'+(i/(yl.length-1)*100)+'%">'+t+'</div>';}).join('');
    var leg='<div class="legend-row">'+[sA,sB].map(function(s){return '<div><span class="dot" style="background:'+s.color+'"></span>'+s.name+'</div>';}).join('')+'</div>';
    var bs=cats.map(function(c,idx){
      var ha=Math.max(2,Math.round(sA.vals[idx]/max*168)), hb=Math.max(2,Math.round(sB.vals[idx]/max*168));
      return '<div class="bar-col"><div style="display:flex;gap:3px;align-items:flex-end">'
        +'<div class="bar" style="height:'+ha+'px;width:15px;background:'+sA.color+'"></div>'
        +'<div class="bar" style="height:'+hb+'px;width:15px;background:'+sB.color+'"></div></div></div>';
    }).join('');
    var xs=cats.map(function(c){return '<span style="font-size:11px">'+c+'</span>';}).join('');
    return leg+'<div class="chart"><div class="y-axis">'+ys+'</div><div class="bars">'+bs+'</div></div><div class="x-labels">'+xs+'</div>';
  }
  /* 横向堆叠条（北上广深星级 / 混付支付） rows:[{name,segs:[{v,color,disp}]}] */
  function hbarStack(rows, legend){
    var leg='<div class="legend-row" style="justify-content:flex-start;margin-bottom:10px">'+legend.map(function(l){return '<div><span class="dot" style="background:'+l.color+'"></span>'+l.label+'</div>';}).join('')+'</div>';
    var body=rows.map(function(r){
      var tot=r.segs.reduce(function(a,s){return a+s.v;},0)||1;
      var segs=r.segs.map(function(s){return '<div class="hbar-seg" style="width:'+(s.v/tot*100)+'%;background:'+s.color+'">'+((s.v/tot>0.09&&s.disp)?s.disp:'')+'</div>';}).join('');
      return '<div class="hbar-row"><div class="hbar-name">'+r.name+'</div><div class="hbar-track">'+segs+'</div></div>';
    }).join('');
    return leg+body;
  }
  /* 气泡图（直辖市/省会入住占比） items:[{label,pct}] */
  function bubble(items){
    var cols=['#5b8ff9','#5ad8a6','#5d7092','#f6bd16','#e8684a','#6dc8ec','#9270ca','#ff9d4d','#269a99','#ff99c3','#fac858','#b39ddb'];
    return '<div class="bubble-wrap">'+items.map(function(d,i){
      var sz=Math.max(42,Math.round(Math.sqrt(d.pct)*26)); var c=cols[i%cols.length];
      return '<div class="bubble" style="width:'+sz+'px;height:'+sz+'px;background:'+c+';font-size:'+(sz>72?12:10)+'px"><b>'+d.label+'</b><span>'+d.pct+'%</span></div>';
    }).join('')+'</div>';
  }
  /* 堆叠纵向柱状图（可横向滚动） items:[{label,segs:[{v,color}]}] */
  function svbar(items, legend, opts){
    opts=opts||{}; var unit=opts.unit||'';
    var max=opts.max||(Math.max.apply(null,items.map(function(d){return d.segs.reduce(function(a,s){return a+s.v;},0);}))||1); max=max*1.18;
    var steps=4, yl=[]; for(var i=steps;i>=0;i--){ yl.push((Math.round(max/steps*i*100)/100)+unit); }
    var ys=yl.map(function(t,i){return '<div style="top:'+(i/(yl.length-1)*100)+'%">'+t+'</div>';}).join('');
    var bw=opts.barw||26, cw=bw+20, W=items.length*cw+50;
    var bs=items.map(function(d){
      var tot=d.segs.reduce(function(a,s){return a+s.v;},0);
      var segs=d.segs.map(function(s){return '<div style="width:100%;height:'+Math.max(0,Math.round(s.v/max*168))+'px;background:'+s.color+'"></div>';}).join('');
      return '<div class="bar-col" style="min-width:'+cw+'px"><div class="bar-val">'+(opts.fmt?opts.fmt(tot):(Math.round(tot*100)/100))+unit+'</div><div style="width:'+bw+'px;display:flex;flex-direction:column-reverse;border-radius:2px 2px 0 0;overflow:hidden">'+segs+'</div></div>';
    }).join('');
    var xs=items.map(function(d){return '<span style="min-width:'+cw+'px;font-size:11px">'+d.label+'</span>';}).join('');
    var leg='<div class="legend-row">'+legend.map(function(l){return '<div><span class="dot" style="background:'+l.color+'"></span>'+l.label+'</div>';}).join('')+'</div>';
    return leg+'<div class="tbl-wrap"><div class="chart" style="min-width:'+W+'px"><div class="y-axis">'+ys+'</div><div class="bars">'+bs+'</div></div><div class="x-labels" style="min-width:'+W+'px">'+xs+'</div></div>';
  }
  function kpis(list){ return '<div class="kpi-grid">'+list.map(function(p){return '<div class="kpi"><div class="k">'+p.k+'</div><div class="v'+(p.sm?' sm':'')+(p.cls?(' '+p.cls):'')+'">'+p.v+'</div></div>';}).join('')+'</div>'; }
  function infoCards(list){ return '<div class="row">'+list.map(function(c){
    return '<div class="info-card" style="flex:1;min-width:170px"><div class="sec-title" style="margin-bottom:8px">'+c.title+'</div>'
      + c.rows.map(function(r){return '<div style="display:flex;justify-content:space-between;margin:7px 0"><span style="color:#909399">'+r.k+'</span><b>'+r.v+'</b></div>';}).join('')+'</div>';
  }).join('')+'</div>'; }
  function scene(title, lines){ return '<div class="scene-note"><b>'+title+'</b><br>'+lines.join('<br>')+'</div>'; }
  function thead(cells){ return '<tr>'+cells.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr>'; }
  function trow(cells, bold){ return '<tr'+(bold?' style="font-weight:600;background:#fafafa"':'')+'>'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>'; }
  /* 可下穿明细的表行（点击触发 bindCarDrill） */
  function drillRow(key, cnt, cells){ return '<tr class="drill-row" data-drill="'+key+'" data-cnt="'+cnt+'">'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>'; }
  function drillRowSave(key, line, cnt, cells){ return '<tr class="drill-row-save" data-drill="'+key+'" data-line="'+line+'" data-cnt="'+cnt+'">'+cells.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>'; }
  function tableW(inner){ return '<div class="tbl-wrap"><table class="tbl">'+inner+'</table></div>'; }
  function moreBar(n,pages){ return '<div class="more-bar">共 '+n+' 条数据 <span class="pager"><s>&lt;</s><b>1</b><s>2</s><s>3</s>'+(pages>3?'<s>…</s><s>'+pages+'</s>':'')+'<s>&gt;</s></span> 前往 1 /'+pages+' 页</div>'; }
  /* 维度切换表（公司 / 核算主体 / 成本中心 或 员工 / 成本中心 / 核算主体） bodies 与 tabs 等长 */
  function dimTable(tabs, bodies){
    var t=tabs.map(function(x,i){return '<span class="'+(i===0?'active':'')+'" data-i="'+i+'">'+x+'</span>';}).join('');
    var b=bodies.map(function(h,i){return '<div class="dim-pane" data-i="'+i+'" style="display:'+(i===0?'block':'none')+'">'+h+'</div>';}).join('');
    return '<div class="dim-table"><div class="dim-tabs">'+t+'</div>'+b+'</div>';
  }
  function bindDimTable(root){ if(!root) return; root.querySelectorAll('.dim-table').forEach(function(dt){
    dt.querySelectorAll('.dim-tabs span').forEach(function(s){ s.addEventListener('click',function(){
      dt.querySelectorAll('.dim-tabs span').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
      var i=s.getAttribute('data-i');
      dt.querySelectorAll(':scope > .dim-pane').forEach(function(p){ p.style.display=(p.getAttribute('data-i')===i)?'block':'none'; });
    }); }); }); }
  /* 总览页 消费金额 ⇄ 订单量 切换 */
  function bindOvToggle(root){ if(!root) return; root.querySelectorAll('.ov-toggle').forEach(function(box){
    box.querySelectorAll(':scope > .pg-tabs span').forEach(function(s){ s.addEventListener('click',function(){
      box.querySelectorAll(':scope > .pg-tabs span').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
      var v=s.getAttribute('data-view');
      box.querySelectorAll(':scope > .ov-pane').forEach(function(p){ p.style.display=(p.getAttribute('data-view')===v)?'block':'none'; });
    }); }); }); }
  /* 同比涨跌着色 */
  function yoy(v){ if(v==null||v==='-') return '-'; var c=(v<0)?'#f5222d':'#52c41a'; return '<span style="color:'+c+'">'+(v>0?'+':'')+v.toFixed(1)+'%</span>'; }
  /* 需求18：同比/环比 —— 直接列入趋势表（不单独卡片） */
  var YOY_R=[0.139,0.082,0.115,0.092,0.078,-0.05]; // 月度同比率（示意）
  function deltaSpan(v,unit,dec){ var c=(v<0)?'#f5222d':'#52c41a'; return '<span style="color:'+c+'">'+(v>=0?'+':'')+nf(v,dec)+unit+'</span>'; }
  /* 需求18：返回某月的 [同比增长值, 同比, 环比] 三个单元格（直接并入明细表，不单独成表） */
  /* 仅返回 [同比, 环比]（不要同比增长值） */
  function yoyTriple(cur,i){
    var r=YOY_R[i];
    return [yoy(r*100)];
  }
  function yoyTripleTotal(cur){
    var sc=0,sp=0; for(var i=0;i<cur.length;i++){ sc+=cur[i]; sp+=cur[i]/(1+YOY_R[i]); }
    var yr=sp?((sc-sp)/sp*100):0; return [yoy(yr)];
  }
  /* 各总览页主指标月度值（用于明细表同比/环比列） */
  var MD_ALL=[1294900,840000,1050000,915600,770700,443300];
  var MD_AIR=[199115,30467,160830,106279,105460,6650];
  var MD_AIR_DOM=[139330,30685,57833,67999,30461,15390];
  var MD_AIR_INT=[59785,-218,102997,38280,74999];
  var MD_AIR_XY=[9259,4140,3530,5090,197];
  var MD_AIR_FXY=[189856,26327,157300,101189,105263,15390];
  var MD_HOTEL=[115234.70,45899.40,64445.97,81470.25,27867,9726.13];
  var MD_HT_DOM=[91565,36472,51216,64736,22143,7730];
  var MD_HT_INT=[23670,9427,13230,16734,5724,1996];
  var MD_HT_XY=[23692,9437,13250,16750,5729,2000];
  var MD_HT_FXY=[91543,36462,51196,64720,22138,7726];
  var MD_TRAIN=[13644.50,5568,18214.50,18908,11101,7095];
  var MD_CAR=[176477.49,123400.54,180381.48,143147.36,85312.10];
  var MD_CAR_RT=[172955.17,118500.56,176564.76,138698.46,116515.60,57108.21];
  var MD_CAR_YY=[2905.97,4716.96,3318.69,3250.02,2358.34,1045.77];
  var MD_CAR_JSJ=[616.35,183.02,465.48,908.02,640.44];
  var MD_CAR_JSZ=[32.55,290.86,48.70];
  function yoyOneTable(label,unit,cur,dec){
    dec=(dec==null)?0:dec; var labels=['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'];
    var sc=0,sp=0,rows='';
    for(var i=0;i<cur.length;i++){
      var c=cur[i], r=YOY_R[i], p=c/(1+r), yv=c-p, yr=r*100;
      var mom=(i>0&&cur[i-1])?((c-cur[i-1])/cur[i-1]*100):null;
      sc+=c; sp+=p;
      rows+=trow([labels[i], nf(c,dec)+unit, nf(p,dec)+unit, deltaSpan(yv,unit,dec), yoy(yr)]);
    }
    var tyv=sc-sp, tyr=sp?(tyv/sp*100):0;
    rows+=trow(['合计', nf(sc,dec)+unit, nf(sp,dec)+unit, deltaSpan(tyv,unit,dec), yoy(tyr)],true);
    return tableW(thead(['统计时间','本期'+label,'上年同期','同比 <span class="new-tag">需求18</span>'])+rows);
  }
  function yoyTable(metrics){
    var tabs=metrics.map(function(m,i){return '<span class="'+(i===0?'active':'')+'" data-i="'+i+'">'+m.label+'</span>';}).join('');
    var panes=metrics.map(function(m,i){return '<div class="yoyt-pane" data-i="'+i+'" style="display:'+(i===0?'block':'none')+'">'+yoyOneTable(m.label,m.unit||'',m.cur,m.dec)+'</div>';}).join('');
    return '<div class="sec-title mt">同比 / 环比对比 <span class="new-tag">需求18 新增</span></div>'
      + '<div class="callout">同比增长值 / 同比 / 环比<b>直接列入趋势表</b>（不再单独卡片展示）；消费金额 ⇄ 数量 口径联动，口径同需求19。</div>'
      + '<div class="yoyt">'+(metrics.length>1?'<div class="cmp-metric" style="margin-bottom:14px">'+tabs+'</div>':'')+panes+'</div>';
  }
  function bindYoyTable(root){ if(!root) return; root.querySelectorAll('.yoyt').forEach(function(box){
    box.querySelectorAll('.cmp-metric span').forEach(function(s){ s.addEventListener('click',function(){
      box.querySelectorAll('.cmp-metric span').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
      var i=s.getAttribute('data-i');
      box.querySelectorAll('.yoyt-pane').forEach(function(p){ p.style.display=(p.getAttribute('data-i')===i)?'block':'none'; });
    }); }); }); }
  /* 上线必备 H：指标口径 ⓘ 提示（含义/公式/来源/适用范围） */
  function itip(o){ return '<span class="itip">ⓘ<span class="tip">'
    + (o.def?('<b>含义</b>：'+o.def+'<br>'):'')
    + (o.formula?('<b>公式</b>：'+o.formula+'<br>'):'')
    + (o.src?('<b>来源</b>：'+o.src+'<br>'):'')
    + (o.scope?('<b>适用范围</b>：'+o.scope):'')
    + '</span></span>'; }
  /* 组织维度（核算主体 / 成本中心）固定权重，保证各列拆分后精确等于合计 */
  var ORG = {
    '核算主体':{ names:['示例企业集团有限公司','华东核算中心','华南核算中心','西南核算中心','华北核算中心','华中核算中心','成都核算中心'], w:[0.30,0.22,0.16,0.13,0.10,0.06,0.03] },
    '成本中心':{ names:['销售一部','销售二部','市场推广部','技术研发部','客户服务中心','采购部','财务部','人力资源部'], w:[0.22,0.18,0.14,0.12,0.11,0.09,0.08,0.06] }
  };
  function splitBy(w,total){ var out=[],acc=0; for(var i=0;i<w.length;i++){ if(i===w.length-1) out.push(Math.round((total-acc)*100)/100); else { var v=Math.round(total*w[i]*100)/100; out.push(v); acc+=v; } } return out; }
  /* 按组织维度把各列总额拆分成行（精确对账）。
     headers: [维度名, 列1, 列2 ...]；totals: 与 headers[1..] 平行的列合计；
     opts: { dec:[每列小数位], suf:[每列后缀如'%'], tail:[{h,val,tot}] 各行常量列, yoy:[每行同比], yoyTot } */
  function orgDist(dim, headers, totals, opts){
    opts=opts||{}; var o=ORG[dim], n=o.names.length;
    var dist=totals.map(function(t){return splitBy(o.w,t);});
    var dec=opts.dec||totals.map(function(){return 0;});
    var suf=opts.suf||totals.map(function(){return '';});
    var tail=opts.tail||[];
    var H=headers.concat(tail.map(function(t){return t.h;})); if(opts.yoy) H=H.concat(['同比']);
    var rows='';
    for(var r=0;r<n;r++){
      var c=[o.names[r]];
      for(var k=0;k<totals.length;k++) c.push(nf(dist[k][r],dec[k])+suf[k]);
      tail.forEach(function(t){ c.push(t.val); });
      if(opts.yoy) c.push(yoy(opts.yoy[r]));
      rows+=trow(c);
    }
    var tot=['合计'];
    for(var k2=0;k2<totals.length;k2++) tot.push(nf(totals[k2],dec[k2])+suf[k2]);
    tail.forEach(function(t){ tot.push(t.tot!=null?t.tot:t.val); });
    if(opts.yoy) tot.push(yoy(opts.yoyTot!=null?opts.yoyTot:0));
    rows+=trow(tot,true);
    return tableW(thead(H)+rows);
  }

  /* 需求20 服务商总览表（总额+各业务线 金额/占比/同比） */
  var SVC = [
    {n:'差旅壹号', amt:452.8, cnt:26120, ayoy:18.5, cyoy:17.2, air:{amt:256.8,yoy:16.0}, hotel:{amt:89.0,yoy:22.0}, train:{amt:12.0,yoy:12.0}, car:{amt:95.0,yoy:24.0}},
    {n:'同程商旅', amt:284.4, cnt:17162, ayoy:6.2, cyoy:5.8, air:{amt:158.4,yoy:5.0}, hotel:{amt:56.0,yoy:8.0}, train:{amt:8.0,yoy:3.0}, car:{amt:62.0,yoy:9.0}},
    {n:'携程商旅', amt:205.5, cnt:10720, ayoy:-3.5, cyoy:-4.0, air:{amt:121.5,yoy:-4.0}, hotel:{amt:38.0,yoy:-2.0}, train:{amt:5.0,yoy:-6.0}, car:{amt:41.0,yoy:-1.0}},
    {n:'美团商旅', amt:121.2, cnt:4885, ayoy:11.0, cyoy:10.2, air:{amt:78.2,yoy:9.0}, hotel:{amt:22.0,yoy:14.0}, train:{amt:3.0,yoy:7.0}, car:{amt:18.0,yoy:13.0}}
  ];
  function svcYoy(v){ var c=(v<0)?'#f5222d':'#52c41a'; return '<span style="color:'+c+'">'+(v>0?'+':'')+v.toFixed(1)+'%</span>'; }
  function svcTotalsTable(){
    var R=SVC, S=function(f){return R.reduce(function(a,r){return a+f(r);},0);};
    var sA=S(function(r){return r.amt;}), sC=S(function(r){return r.cnt;});
    var sL={air:S(function(r){return r.air.amt;}),hotel:S(function(r){return r.hotel.amt;}),train:S(function(r){return r.train.amt;}),car:S(function(r){return r.car.amt;})};
    var wA=R.reduce(function(a,r){return a+r.amt*r.ayoy;},0)/(sA||1);
    var wC=R.reduce(function(a,r){return a+r.cnt*r.cyoy;},0)/(sC||1);
    var wL=function(k){return R.reduce(function(a,r){return a+r[k].amt*r[k].yoy;},0)/(sL[k]||1);};
    function cells(v,pct,yoy,isCnt){ return '<td style="text-align:right">'+(isCnt?v.toLocaleString():v.toFixed(1)+'万')+'</td><td style="text-align:right">'+pct.toFixed(1)+'%</td><td style="text-align:right">'+svcYoy(yoy)+'</td>'; }
    var head='<tr><th rowspan="2">服务商</th><th colspan="3">总金额</th><th colspan="3">总产品数</th><th colspan="3">机票</th><th colspan="3">酒店</th><th colspan="3">火车</th><th colspan="3">用车</th></tr>'
      +'<tr><th style="text-align:right">金额</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th>'
      +'<th style="text-align:right">条数</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th>'
      +'<th style="text-align:right">金额</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th>'
      +'<th style="text-align:right">金额</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th>'
      +'<th style="text-align:right">金额</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th>'
      +'<th style="text-align:right">金额</th><th style="text-align:right">占比</th><th style="text-align:right">同比</th></tr>';
    var body=R.map(function(r){
      return '<tr><td>'+r.n+'</td>'+cells(r.amt,r.amt/sA*100,r.ayoy)+cells(r.cnt,r.cnt/sC*100,r.cyoy,true)
        +cells(r.air.amt,r.air.amt/sL.air*100,r.air.yoy)+cells(r.hotel.amt,r.hotel.amt/sL.hotel*100,r.hotel.yoy)
        +cells(r.train.amt,r.train.amt/sL.train*100,r.train.yoy)+cells(r.car.amt,r.car.amt/sL.car*100,r.car.yoy)+'</tr>';
    }).join('');
    var foot='<tr style="font-weight:600;background:#fafafa"><td>合计</td>'+cells(sA,100,wA)+cells(sC,100,wC,true)
      +cells(sL.air,100,wL('air'))+cells(sL.hotel,100,wL('hotel'))+cells(sL.train,100,wL('train'))+cells(sL.car,100,wL('car'))+'</tr>';
    return '<div style="overflow-x:auto"><table class="tbl">'+head+body+foot+'</table></div>';
  }
  function statList(pairs){
    return '<div class="stat-list">'+pairs.map(function(p){return '<div><span class="lbl">'+p.k+'</span><b>'+p.v+'</b></div>';}).join('')+'</div>';
  }
  function pcard(icon,name,val){ return '<div class="pcard"><div class="icon">'+icon+'</div><div><div class="pname">'+name+'</div><div class="pval">'+val+'</div></div></div>'; }
  function card(title, body){ return '<div class="card"><div class="sec-title">'+title+'</div>'+body+'</div>'; }
  function bigv(v){ return '<div class="big-amount">'+v+'</div>'; }
  function subs(lines){ return '<div class="sub">'+lines.map(function(l){return '<div>'+l+'</div>';}).join('')+'</div>'; }
  function seg(options, active){ return '<div class="toggle-tabs">'+options.map(function(o,i){return '<span class="'+(i===active?'active':'')+'">'+o+'</span>';}).join('')+'</div>'; }
  function ssField(label, options, note){
    var opts=options.map(function(o,i){return '<div class="ss-opt'+(i===0?' sel':'')+'" data-v="'+o+'">'+o+'</div>';}).join('');
    return '<div class="filter-item"><label>'+label+' <span class="new-tag">需求5 新增</span></label>'
      + '<div class="ss-wrap"><div class="ctrl ss-toggle" style="min-width:120px"><span class="ss-label">'+options[0]+'</span><span class="caret">∨</span></div>'
      + '<div class="ss-panel">'+opts+'</div></div>'
      + (note?'<span style="color:#909399;font-size:12px">'+note+'</span>':'')
      + '</div>';
  }
  function overStandardTable(line, cnt, rate, pay, yoyV){
    var r=parseFloat(String(rate))||0, nr=Math.round((100-r)*10)/10;
    return '<div class="sec-title mt">混合支付情况（'+line+'） <span class="new-tag">需求7 新增</span></div>'
      + '<div class="row"><div style="flex:1;min-width:280px">'
      +   donut([{pct:r,color:'#f5222d'},{pct:100-r,color:C.teal}],[{color:'#f5222d',label:'混合支付('+rate+')'},{color:C.teal,label:'非混合支付('+nr+'%)'}])
      + '</div><div style="flex:1.4;min-width:360px">'
      +   '<table class="tbl"><tr><th>业务线</th><th>混合支付明细数</th><th>混合支付率</th><th>同比</th></tr>'
      +     '<tr><td>'+line+'</td><td>'+cnt+'</td><td>'+rate+'</td><td>'+yoy(yoyV==null?0:yoyV)+'</td></tr></table>'
      +   '<div style="color:#909399;font-size:12px;margin-top:8px">🔒 个人支付金额 <b>'+pay+'</b>（敏感数据，可见粒度按"敏感数据决策"配置）；<b>本模块可按企业开关配置</b>。</div>'
      + '</div></div>';
  }
  function reqbox(list){
    return '<div class="reqbox"><h4>📌 本页需求改动</h4><ul>'+list.map(function(r){
      var tag=r.tag?('<span class="'+(r.tag==='新增'?'new-tag':'opt-tag')+'">'+r.tag+'</span> '):'';
      return '<li>'+tag+r.t+(r.id?' <span class="id">#'+r.id+'</span>':'')+'</li>';
    }).join('')+'</ul></div>';
  }
  /* ---------- 需求19：企业/核算主体/部门对比（同屏横向对比 + 消费/数量双口径） ---------- */
  var LINE_RATIO = { air:{amt:0.42,cnt:0.10}, hotel:{amt:0.26,cnt:0.06}, train:{amt:0.10,cnt:0.05}, car:{amt:0.22,cnt:0.79} };
  var CMP = {
    '企业':[{n:'示例科技有限公司',amt:1280,cnt:21540},{n:'示例制造集团',amt:980,cnt:18320},{n:'示例物流有限公司',amt:760,cnt:24180},{n:'示例金融服务',amt:645,cnt:9870},{n:'示例地产集团',amt:512,cnt:6240},{n:'示例医药有限公司',amt:388,cnt:7150},{n:'示例传媒有限公司',amt:246,cnt:5320},{n:'示例能源有限公司',amt:175,cnt:3010}],
    '核算主体':[{n:'示例企业集团总部',amt:1520,cnt:22300},{n:'华东核算中心',amt:1180,cnt:19850},{n:'华南核算中心',amt:870,cnt:15240},{n:'西南核算中心',amt:690,cnt:13670},{n:'华北核算中心',amt:540,cnt:9120},{n:'华中核算中心',amt:410,cnt:7680},{n:'西北核算中心',amt:215,cnt:4030}],
    '部门':[{n:'销售一部',amt:980,cnt:16720},{n:'销售二部',amt:820,cnt:14350},{n:'市场推广部',amt:610,cnt:8940},{n:'技术研发部',amt:470,cnt:6210},{n:'客户服务中心',amt:360,cnt:9870},{n:'采购部',amt:295,cnt:5180},{n:'财务部',amt:180,cnt:3240},{n:'人力资源部',amt:120,cnt:2110}],
    '成本中心':[{n:'销售中心',amt:1180,cnt:19800},{n:'市场中心',amt:760,cnt:11200},{n:'研发中心',amt:640,cnt:8400},{n:'交付中心',amt:520,cnt:13600},{n:'职能中心',amt:410,cnt:6200},{n:'采购中心',amt:295,cnt:5100},{n:'财务中心',amt:180,cnt:3200}],
    '外部企业':[{n:'示例外部科技有限公司',amt:320,cnt:4800},{n:'示例外部咨询有限公司',amt:240,cnt:3600},{n:'示例外部制造有限公司',amt:180,cnt:5200},{n:'示例外部贸易有限公司',amt:130,cnt:2100},{n:'示例外部传媒有限公司',amt:95,cnt:1800},{n:'示例外部物流有限公司',amt:60,cnt:2400}]
  };
  function cmpVal(e, scope){ if(scope==='all'||!scope) return {amt:e.amt,cnt:e.cnt}; var r=LINE_RATIO[scope]; return {amt:Math.round(e.amt*r.amt*10)/10, cnt:Math.round(e.cnt*r.cnt)}; }
  /* 需求19：消费金额同比（稳定示意值，按名称派生，约 -17% ~ +29%） */
  function cmpYoy(name){ var s=0; for(var i=0;i<name.length;i++) s+=name.charCodeAt(i); return ((s*7)%460)/10 - 17; }
  function cmpRows(dim, scope){
    scope=scope||'all';
    var arr=CMP[dim].map(function(e){ var v=cmpVal(e,scope); return {n:e.n,amt:v.amt,cnt:v.cnt}; });
    arr.sort(function(a,b){return b.amt-a.amt;});
    var totA=arr.reduce(function(s,x){return s+x.amt;},0)||1, totC=arr.reduce(function(s,x){return s+x.cnt;},0)||1;
    var rows=arr.map(function(x,i){
      return '<tr><td style="width:48px">'+(i+1)+'</td><td>'+x.n+'</td>'
        +'<td style="text-align:right">'+(Math.round(x.amt*10)/10).toLocaleString()+'万元</td>'
        +'<td style="text-align:right">'+yoy(cmpYoy(x.n))+'</td>'
        +'<td style="text-align:right">'+(x.amt/totA*100).toFixed(1)+'%</td>'
        +'<td style="text-align:right">'+x.cnt.toLocaleString()+'</td>'
        +'<td style="text-align:right">'+(x.cnt/totC*100).toFixed(1)+'%</td></tr>';
    }).join('');
    return '<table class="tbl"><tr><th>排名</th><th>'+dim+'</th><th style="text-align:right">消费金额</th><th style="text-align:right">同比</th><th style="text-align:right">金额占比</th><th style="text-align:right">产品条数</th><th style="text-align:right">条数占比</th></tr>'+rows+'</table>';
  }
  function compareSection(scope){ return ''; /* 需求19 对比组件已从总览各页移除（用户要求 2026-06-15）；如需恢复删掉本行即可。对比能力保留在独立「对比报告」 */
    scope=scope||'all';
    var tabs=['企业','外部企业','核算主体','成本中心','部门'].map(function(d,i){return '<span class="'+(i===0?'active':'')+'" data-dim="'+d+'">'+d+'对比</span>';}).join('');
    var sn={all:'整体',air:'机票',hotel:'酒店',train:'火车',car:'用车'}[scope];
    return '<div class="sec-title mt">企业 / 外部企业 / 核算主体 / 成本中心 / 部门对比'+(scope==='all'?'':'（'+sn+'业务线）')+' <span class="new-tag">需求19 新增</span></div>'
      + '<div class="callout">同屏横向对比：切换<b>对比维度</b>（企业 / 外部企业 / 核算主体 / 成本中心 / 部门）；同表列示<b>消费金额 + 产品条数及占比</b>，按消费金额排序；整体页再<b>展开各业务线（机票/酒店/火车/用车）金额与条数</b>。受数据权限约束，仅展示权限内对象。<b>「企业对比」即集团内各企业排名；「个人」维度因隐私评估暂缓。</b></div>'
      + '<div class="cmp-block" data-dim="企业" data-scope="'+scope+'"><div class="cmp-head"><div class="cmp-tabs">'+tabs+'</div></div>'
      + '<div class="cmp-rank" style="display:block;max-height:420px;overflow:auto">'+cmpRows('企业',scope)+'</div></div>';
  }
  /* 对比报告 · 节省口径行（节省金额/占比/同比/节省率） */
  var SAVE_BASE = {all:15.5, air:18.0, hotel:12.0};
  function cmpSaveRate(name, scope){ var b=SAVE_BASE[scope]||15.5; var s=0; for(var i=0;i<name.length;i++) s+=name.charCodeAt(i); return Math.max(3, Math.round((b + ((s%80)/10 - 4))*10)/10); }
  function cmpSaveRows(dim, scope){
    scope=scope||'all';
    var arr=CMP[dim].map(function(e){
      var amt=(scope==='all')?e.amt:Math.round(e.amt*LINE_RATIO[scope].amt*10)/10;
      var rate=cmpSaveRate(e.n,scope);
      return {n:e.n, save:Math.round(amt*rate)/100, rate:rate};
    });
    arr.sort(function(a,b){return b.save-a.save;});
    var tot=arr.reduce(function(s,x){return s+x.save;},0)||1;
    var rows=arr.map(function(x,i){
      return '<tr><td>'+(i+1)+'</td><td>'+x.n+'</td>'
        +'<td style="text-align:right">'+x.save.toFixed(1)+'万</td>'
        +'<td style="text-align:right">'+(x.save/tot*100).toFixed(1)+'%</td>'
        +'<td style="text-align:right">'+yoy(cmpYoy(x.n))+'</td>'
        +'<td style="text-align:right">'+x.rate.toFixed(1)+'%</td></tr>';
    }).join('');
    return '<table class="tbl"><tr><th>排名</th><th>'+dim+'</th><th style="text-align:right">节省金额</th><th style="text-align:right">节省占比</th><th style="text-align:right">同比</th><th style="text-align:right">节省率</th></tr>'+rows+'</table>';
  }
  /* 对比报告 · 潜在节省口径行（潜在节省金额/占比/同比/潜在节省率） */
  var POT_BASE = {all:4.5, air:5.5, hotel:3.5};
  function cmpPotRate(name, scope){ var b=POT_BASE[scope]||4.5; var s=0; for(var i=0;i<name.length;i++) s+=name.charCodeAt(i); return Math.max(1, Math.round((b + ((s%40)/10 - 2))*10)/10); }
  function cmpPotentialRows(dim, scope){
    scope=scope||'all';
    var arr=CMP[dim].map(function(e){
      var amt=(scope==='all')?e.amt:Math.round(e.amt*LINE_RATIO[scope].amt*10)/10;
      var rate=cmpPotRate(e.n,scope);
      return {n:e.n, pot:Math.round(amt*rate)/100, rate:rate};
    });
    arr.sort(function(a,b){return b.pot-a.pot;});
    var tot=arr.reduce(function(s,x){return s+x.pot;},0)||1;
    var rows=arr.map(function(x,i){
      return '<tr><td>'+(i+1)+'</td><td>'+x.n+'</td>'
        +'<td style="text-align:right">'+x.pot.toFixed(1)+'万</td>'
        +'<td style="text-align:right">'+(x.pot/tot*100).toFixed(1)+'%</td>'
        +'<td style="text-align:right">'+yoy(cmpYoy(x.n))+'</td>'
        +'<td style="text-align:right">'+x.rate.toFixed(1)+'%</td></tr>';
    }).join('');
    return '<table class="tbl"><tr><th>排名</th><th>'+dim+'</th><th style="text-align:right">潜在节省金额</th><th style="text-align:right">潜在节省占比</th><th style="text-align:right">同比</th><th style="text-align:right">潜在节省率</th></tr>'+rows+'</table>';
  }
  /* 对比报告 · 各业务线节省（机票/酒店/火车/用车 节省金额 + 合计） */
  var LINE_SAVE_RATE = {air:18, hotel:12, train:8, car:10};
  function cmpLineSaveRows(dim){
    var lines=[['air','机票'],['hotel','酒店'],['train','火车'],['car','用车']];
    var arr=CMP[dim].map(function(e){
      var vals=lines.map(function(l){ var lineAmt=e.amt*LINE_RATIO[l[0]].amt; return Math.round(lineAmt*LINE_SAVE_RATE[l[0]])/100; });
      var tot=vals.reduce(function(a,b){return a+b;},0);
      return {n:e.n, vals:vals, tot:Math.round(tot*10)/10};
    });
    arr.sort(function(a,b){return b.tot-a.tot;});
    var rows=arr.map(function(x,i){
      return '<tr><td>'+(i+1)+'</td><td>'+x.n+'</td>'
        + x.vals.map(function(v){return '<td style="text-align:right">'+v.toFixed(1)+'万</td>';}).join('')
        + '<td style="text-align:right;font-weight:600">'+x.tot.toFixed(1)+'万</td></tr>';
    }).join('');
    return '<table class="tbl"><tr><th>排名</th><th>'+dim+'</th><th style="text-align:right">机票节省</th><th style="text-align:right">酒店节省</th><th style="text-align:right">火车节省</th><th style="text-align:right">用车节省</th><th style="text-align:right">合计节省</th></tr>'+rows+'</table>';
  }
  /* 对比报告 · 横向条形排名（复用 .cmp-row 样式，含名次徽标 + 渐变条 + 数值标签） */
  function cmpBars(items){
    var max=Math.max.apply(null, items.map(function(x){return Math.abs(x.val);}))||1;
    return items.map(function(x,i){
      var w=Math.max(2, Math.round(Math.abs(x.val)/max*100));
      return '<div class="cmp-row'+(i<3?' top'+(i+1):'')+'"><div class="cmp-rk">'+(i+1)+'</div>'
        +'<div class="cmp-name" title="'+x.n+'">'+x.n+'</div>'
        +'<div class="cmp-track"><div class="cmp-bar" style="width:'+w+'%"></div></div>'
        +'<div class="cmp-val">'+x.label+'</div></div>';
    }).join('');
  }
  function cmpBarConsume(dim){
    var arr=CMP[dim].slice().sort(function(a,b){return b.amt-a.amt;});
    return cmpBars(arr.map(function(e){ return {n:e.n, val:e.amt, label:e.amt.toLocaleString()+'万 '+yoy(cmpYoy(e.n))}; }));
  }
  function cmpBarSave(dim){
    var arr=CMP[dim].map(function(e){ var r=cmpSaveRate(e.n,'all'); return {n:e.n, val:Math.round(e.amt*r)/100, rate:r}; });
    arr.sort(function(a,b){return b.val-a.val;});
    return cmpBars(arr.map(function(x){ return {n:x.n, val:x.val, label:x.val.toFixed(1)+'万 ('+x.rate.toFixed(1)+'%)'}; }));
  }
  function cmpBarPotential(dim){
    var arr=CMP[dim].map(function(e){ var r=cmpPotRate(e.n,'all'); return {n:e.n, val:Math.round(e.amt*r)/100, rate:r}; });
    arr.sort(function(a,b){return b.val-a.val;});
    return cmpBars(arr.map(function(x){ return {n:x.n, val:x.val, label:x.val.toFixed(1)+'万 ('+x.rate.toFixed(1)+'%)'}; }));
  }
  /* 对比报告 · 各业务线节省 堆叠条形 + 图例 */
  function cmpStackLine(dim){
    var lines=[['air','机票',C.blue],['hotel','酒店',C.orange],['train','火车',C.purple],['car','用车',C.teal]];
    var arr=CMP[dim].map(function(e){
      var segs=lines.map(function(l){ return {v:Math.round(e.amt*LINE_RATIO[l[0]].amt*LINE_SAVE_RATE[l[0]])/100, color:l[2]}; });
      var tot=segs.reduce(function(a,s){return a+s.v;},0);
      return {n:e.n, segs:segs, tot:Math.round(tot*10)/10};
    });
    arr.sort(function(a,b){return b.tot-a.tot;});
    var max=Math.max.apply(null, arr.map(function(x){return x.tot;}))||1;
    var legend='<div class="legend-row" style="justify-content:flex-start;margin:0 0 12px 0">'+lines.map(function(l){return '<div><span class="dot" style="background:'+l[2]+'"></span>'+l[1]+'</div>';}).join('')+'</div>';
    var bars=arr.map(function(x,i){
      var seg=x.segs.map(function(s){ var w=Math.round(s.v/max*100); return '<div style="width:'+w+'%;height:100%;background:'+s.color+'" title="'+s.v.toFixed(1)+'万"></div>'; }).join('');
      return '<div class="cmp-row'+(i<3?' top'+(i+1):'')+'"><div class="cmp-rk">'+(i+1)+'</div>'
        +'<div class="cmp-name" title="'+x.n+'">'+x.n+'</div>'
        +'<div class="cmp-track" style="display:flex">'+seg+'</div>'
        +'<div class="cmp-val">'+x.tot.toFixed(1)+'万</div></div>';
    }).join('');
    return legend+bars;
  }
  /* 对比报告 · 单页（左图右表：左列条形图，右列全字段明细表；一个维度切换左右联动） */
  function comparePageAll(){
    var dims=['企业','外部企业','核算主体','成本中心','部门'];
    var dtabs=dims.map(function(d,i){return '<span class="'+(i===0?'active':'')+'" data-dim="'+d+'">'+d+'对比</span>';}).join('');
    function cellC(title, kind, html){ return '<div style="flex:1;min-width:380px"><div class="sec-title">'+title+'</div><div class="cmp-rank" data-kind="'+kind+'" style="max-height:360px;overflow:auto">'+html+'</div></div>'; }
    function cellT(kind, html){ return '<div style="flex:1;min-width:380px"><div class="sec-title" style="color:#909399">明细表（全字段）</div><div class="cmp-rank" data-kind="'+kind+'" style="max-height:360px;overflow:auto">'+html+'</div></div>'; }
    function block(title, ck, ch, tk, th){ return '<div class="row mt" style="margin-top:20px">'+cellC(title, ck, ch)+cellT(tk, th)+'</div>'; }
    return '<div class="callout">左侧<b>条形图</b>直观对比、右侧<b>明细表</b>展示全部字段；切换上方<b>对比维度</b>（企业 / 外部企业 / 核算主体 / 成本中心 / 部门），左右联动。受数据权限约束，仅展示权限内对象。</div>'
      + '<div class="cmp-block" data-dim="企业" data-scope="all">'
      +   '<div class="cmp-head"><div class="cmp-tabs cmp-dim">'+dtabs+'</div></div>'
      +   block('① 消费对比 · 消费金额（含同比）', 'bar-consume', cmpBarConsume('企业'), 'consume', cmpRows('企业','all'))
      +   block('② 节省对比 · 节省金额', 'bar-save', cmpBarSave('企业'), 'save', cmpSaveRows('企业','all'))
      +   block('③ 节省对比 · 潜在节省', 'bar-potential', cmpBarPotential('企业'), 'potential', cmpPotentialRows('企业','all'))
      +   block('④ 各业务线节省对比', 'stack-line', cmpStackLine('企业'), 'line', cmpLineSaveRows('企业'))
      + '</div>';
  }
  function bindCompare(root){
    if(!root) return;
    root.querySelectorAll('.cmp-block').forEach(function(block){
      var mode=block.getAttribute('data-mode')||'consume';
      function rowsFor(kind, dim, sc){
        if(kind==='bar-consume') return cmpBarConsume(dim);
        if(kind==='bar-save') return cmpBarSave(dim);
        if(kind==='bar-potential') return cmpBarPotential(dim);
        if(kind==='stack-line') return cmpStackLine(dim);
        if(kind==='save') return cmpSaveRows(dim,sc);
        if(kind==='potential') return cmpPotentialRows(dim,sc);
        if(kind==='line') return cmpLineSaveRows(dim);
        return cmpRows(dim,sc);
      }
      function refresh(){ var dim=block.getAttribute('data-dim'), sc=block.getAttribute('data-scope')||'all';
        block.querySelectorAll('.cmp-rank').forEach(function(rk){
          var kind=rk.getAttribute('data-kind')||(mode==='save'?'save':'consume');
          rk.innerHTML=rowsFor(kind, dim, sc); }); }
      block.querySelectorAll('span[data-dim]').forEach(function(s){ s.addEventListener('click',function(){
        block.querySelectorAll('span[data-dim]').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
        block.setAttribute('data-dim',s.getAttribute('data-dim')); refresh(); }); });
      block.querySelectorAll('span[data-scope]').forEach(function(s){ s.addEventListener('click',function(){
        block.querySelectorAll('span[data-scope]').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
        block.setAttribute('data-scope',s.getAttribute('data-scope')); refresh(); }); });
    });
  }
  /* ---------- 需求18：同比/环比（消费/数量双口径联动） ---------- */
  var YOY = {
    '消费金额':{cur:'480.00万元',yoyVal:'+58.60万元',yoyRate:'+13.9%',momRate:'+4.2%'},
    '订单量':{cur:'64,772单',yoyVal:'+7,180单',yoyRate:'+12.5%',momRate:'-3.1%'}
  };
  function deltaCls(s){ return s.indexOf('-')===0?'down':'up'; }
  function yoyKpis(metric){
    var d=YOY[metric];
    return '<div class="kpi-grid">'
      + '<div class="kpi"><div class="k">本期'+metric+'</div><div class="v">'+d.cur+'</div></div>'
      + '<div class="kpi"><div class="k">同比增长值</div><div class="v sm '+deltaCls(d.yoyVal)+'">'+d.yoyVal+'</div></div>'
      + '<div class="kpi"><div class="k">同比</div><div class="v sm '+deltaCls(d.yoyRate)+'">'+d.yoyRate+'</div></div>'
      + '<div class="kpi"><div class="k">环比</div><div class="v sm '+deltaCls(d.momRate)+'">'+d.momRate+'</div></div>'
      + '</div>';
  }
  function yoyBlock(){
    var mtabs=['消费金额','订单量'].map(function(m,i){return '<span class="'+(i===0?'active':'')+'" data-metric="'+m+'">'+m+'</span>';}).join('');
    return '<div class="sec-title mt">同比 / 环比对比 <span class="new-tag">需求18 新增</span></div>'
      + '<div class="callout">总览 5 个子页 + 消费/节约报告趋势组件均展示<b>同比增长值 / 同比 / 环比</b>；指标随<b>消费金额 ⇄ 数量</b>口径联动（口径同需求19）。</div>'
      + '<div class="yoy-block" data-metric="消费金额"><div class="cmp-metric" style="margin-bottom:14px">'+mtabs+'</div><div class="yoy-kpis">'+yoyKpis('消费金额')+'</div></div>';
  }
  function bindYoy(root){
    if(!root) return;
    root.querySelectorAll('.yoy-block').forEach(function(block){
      block.querySelectorAll('.cmp-metric span').forEach(function(s){ s.addEventListener('click',function(){
        block.querySelectorAll('.cmp-metric span').forEach(function(x){x.classList.remove('active');}); s.classList.add('active');
        block.querySelector('.yoy-kpis').innerHTML=yoyKpis(s.getAttribute('data-metric')); }); });
    });
  }
  function placeholder(title){
    return '<div class="placeholder"><div class="big">🛠️</div>「'+title+'」正文原型生成中。<br>顶部筛选栏（含<b>需求1：核算单元 / 成本中心</b>）已对本页生效；下方为本页待落地的需求改动。</div>';
  }
  function R1(){ return {t:'<b>需求1</b>：筛选区新增「核算主体」「成本中心」（平铺去重值·多选·可搜索·无树形，见上方筛选栏）；表内「各组织…」均可按 公司 / 核算主体 / 成本中心 切换', id:'2502906', tag:'新增'}; }
  function ph(crumb, reqs){ return { crumb:crumb, render:function(){ return placeholder(crumb)+reqbox(reqs); } }; }

  /* ---------- 集采报告（集团站）渲染 ---------- */
  /* 集团站 · 成员企业集采排名（含同比；集团核心视图） */
  var CJ_RANK=[{n:'示例科技有限公司',amt:128.0,yoy:18.5},{n:'示例制造集团',amt:98.0,yoy:6.2},{n:'示例物流有限公司',amt:76.0,yoy:-3.5},{n:'示例金融服务',amt:64.5,yoy:11.0},{n:'示例地产集团',amt:51.2,yoy:8.4},{n:'示例医药有限公司',amt:38.8,yoy:-2.1},{n:'示例传媒有限公司',amt:24.6,yoy:14.0},{n:'示例能源有限公司',amt:17.5,yoy:5.3}];
  function cjRankSection(){
    var tot=CJ_RANK.reduce(function(a,r){return a+r.amt;},0);
    var bars=CJ_RANK.map(function(r){return {label:r.n.replace('有限公司','').replace('集团',''),val:r.amt,disp:nf(r.amt,1)+'万'};});
    var rows=CJ_RANK.map(function(r,i){ return trow([(i+1),r.n,nf(r.amt,1)+'万元',(r.amt/tot*100).toFixed(1)+'%',yoy(r.yoy)]); }).join('');
    return '<div class="sec-title mt">成员企业集采排名 <span class="new-tag">集团站 · 企业排名</span></div>'
      + '<div class="callout">集团对下属各成员企业的集采金额排名（含同比），即「需求19 企业对比」在集团站的落地视图；受数据权限约束，仅展示权限内企业。</div>'
      + vbar(bars,{color:C.blue,barw:30})
      + tableW(thead(['排名','成员企业','集采金额','占比','同比'])+rows
          + trow(['—','合计',nf(tot,1)+'万元','100%',yoy(9.6)],true));
  }
  /* 各业务线集采占比（由 cfg.rows 解析，排除"总体"） */
  function cjLineDonut(rows){
    var cmap={'机票':C.air,'酒店':C.hotel,'火车':C.train,'用车':C.car,'增值/其他':C.other};
    var segs=[], leg=[];
    rows.filter(function(r){return r.type.indexOf('总体')<0;}).forEach(function(r){
      var p=parseFloat(String(r.pct).replace('%',''))||0; if(p<=0) return;
      var col=cmap[r.type]||C.purple; segs.push({pct:p,color:col}); leg.push({color:col,label:r.type+'('+r.pct+')'});
    });
    return donut(segs, leg);
  }
  function cjReport(cfg){
    var banner='<div class="cj-banner"><h2>'+cfg.headline+'</h2><span class="cj-logo">差旅壹号 · YiHao</span></div>';
    var bullets='<ul class="cj-bullets">'+cfg.bullets.map(function(b){return '<li>'+b+'</li>';}).join('')+'</ul>';
    var t1='<table class="cj-tbl"><tr><th>统计时间</th><th>业务类型</th><th>订单量</th><th>消费金额/元</th><th>消费金额占比</th><th>消费金额同比</th></tr>'
      + cfg.rows.map(function(r,i){ var first=(i===0)?'<td rowspan="'+cfg.rows.length+'">'+cfg.period+'</td>':''; var b=(r.type.indexOf('总体')>-1)?' style="font-weight:700;background:#eef6ff"':''; return '<tr'+b+'>'+first+'<td>'+r.type+'</td><td>'+r.orders+'</td><td>'+r.amt+'</td><td>'+r.pct+'</td><td>'+r.yoy+'</td></tr>'; }).join('') + '</table>';
    var t2='<table class="cj-tbl"><tr><th>业务类型</th><th>节约金额</th></tr>'
      + cfg.saving.map(function(s){ var b=(s.type.indexOf('总')>-1)?' style="font-weight:700;background:#eef6ff"':''; return '<tr'+b+'><td>'+s.type+'</td><td>'+s.amt+'</td></tr>'; }).join('') + '</table>';
    var charts='<div class="row mt" style="margin-top:24px;align-items:flex-start">'
      + '<div style="flex:1;min-width:320px"><div class="sec-title">集采消费趋势（'+(cfg.trend.unit||'万元')+'）</div>'
      +   vbar(cfg.trend.labels.map(function(l,i){return {label:l,val:cfg.trend.vals[i],disp:nf(cfg.trend.vals[i],2)};}),{color:C.blue,unit:cfg.trend.unit||'',barw:34})+'</div>'
      + '<div style="flex:1;min-width:300px"><div class="sec-title">各业务线集采占比</div>'+cjLineDonut(cfg.rows)+'</div>'
      + '</div>';
    var saveTrend=cfg.savingTrend ? ('<div class="sec-title mt">集采节约趋势（'+(cfg.savingTrend.unit||'元')+'）</div>'
      + vbar(cfg.savingTrend.labels.map(function(l,i){return {label:l,val:cfg.savingTrend.vals[i],disp:nf(cfg.savingTrend.vals[i],2)};}),{color:'#52c41a',unit:cfg.savingTrend.unit||'',barw:34})) : '';
    return banner + bullets
      + charts
      + '<div class="sec-title mt">集采消费 / 节约明细</div>'
      + '<div class="row" style="align-items:flex-start;gap:28px"><div style="flex:2;min-width:560px">'+t1+'</div><div style="flex:1;min-width:240px"><div class="sec-title">节约金额</div>'+t2+'</div></div>'
      + saveTrend
      + cjRankSection()
      + reqbox([ {t:'<b>集团站 · 集采报告</b>（差旅壹号品牌周期汇总）：集采额 / 节约 / 同比，按业务线分 + <b>集采趋势 / 业务线占比 / 节约趋势</b>；月报 / 季报 / 年报 / 可选区间 — ✅本页已补全', id:'—', tag:'新增'},
          {t:'<b>需求19</b>：集团对下属<b>各企业集采排名（含同比）</b>已落到本页「成员企业集采排名」', id:'—', tag:'新增'} ]);
  }

  /* ---------- 集采报告（企业站）：月报/季报/年报/可选月年报 × 整体/机票/酒店/火车/用车 ---------- */
  var CJE_DAYS=(function(){var a=[];for(var i=1;i<=31;i++)a.push(i+'日');return a;})();
  var CJE_M12=(function(){var a=[];for(var i=1;i<=12;i++)a.push('2025-'+i);return a;})();
  var CJE_MONTH={
    headline:'2026年5月集采超过 77.07 万元，节约超过 0.44 万元',
    bullets:['2026年5月差旅集采 <b>770,706.51元</b>，较去年同比 <span class="cj-down">下降 -24.87%</span>',
      '2026年5月机票节省 <b>0.03万元</b>，酒店节省 <b>0.42万元</b>，合计节省 <b>0.44万元</b>',
      '2026年5月累计为贵司 <b>870人</b> 提供差旅服务，差旅服务费 <b>32.00元</b>'],
    period:'2026年',
    rows:[['机票','32','105,460.00','13.68%',-53.69],['酒店','76','27,867.00','3.62%',-67.48],['火车','63','11,101.00','1.44%',-35.19],['用车','2,992','119,563.08','15.51%',-17.08],['用餐','3,344','77,839.48','10.10%',-14.37],['增值/其他','3,969','428,875.95','55.65%',-6.80],['总体消费','10,476','770,706.51','100.00%',-24.87]],
    saving:[['机票','250.00元'],['酒店','4,160.00元'],['总体节省','4,410.00元']],
    trend:{title:'2026年5月整体消费趋势（消费金额）',sub:'5月整体消费趋势，5月22日交易峰值达 <b>141,233.52元</b>，日均消费金额 <b>24,861.50元</b>',labels:CJE_DAYS,vals:[1.10,0.36,0.67,0.75,2.02,5.46,1.25,2.38,1.46,0.99,3.05,2.30,1.80,3.40,2.20,5.25,1.95,2.66,1.34,1.70,2.60,14.12,9.17,1.30,2.05,2.55,1.14,2.40,1.90,1.50,1.05],barw:16}
  };
  var CJE_QUARTER={
    headline:'2026年Q1集采超过 318.48 万元，节约超过 2.31 万元',
    bullets:['2026年1季度差旅集采 <b>3,184,864.24元</b>，较去年同比 <span class="cj-up">增长 28.30%</span>',
      '2026年1季度机票节省 <b>1.15万元</b>，酒店节省 <b>1.16万元</b>，合计节省 <b>2.31万元</b>',
      '2026年1季度累计为贵司 <b>1,316人</b> 提供差旅服务，差旅服务费 <b>216.00元</b>'],
    period:'26年Q1',
    rows:[['机票','155','390,412.00','12.26%',3.67],['酒店','222','225,580.07','7.08%',35.52],['火车','174','37,427.00','1.18%',-3.67],['用车','12,696','480,259.51','15.08%',11.17],['用餐','11,678','267,748.10','8.41%',-13.92],['增值/其他','12,887','1,783,437.56','56.00%',54.08],['总体消费','37,812','3,184,864.24','100.00%',28.30]],
    saving:[['机票','11,530.81元'],['酒店','11,610.10元'],['总体节省','23,140.91元']],
    trend:{title:'2026年Q1整体消费趋势（消费金额）',sub:'2026年Q1整体消费趋势，其中1月交易峰值达 <b>1,294,854.02元</b>，月均消费金额 <b>1,061,621.41元</b>',labels:['2026-1','2026-2','2026-3'],vals:[129.49,84.00,105.00],barw:50}
  };
  var CJE_YEAR={
    headline:'2025年集采超过 1,025.71 万元，节约超过 10.70 万元',
    bullets:['2025年差旅集采 <b>10,257,149.09元</b>，较去年同比 <span class="cj-up">增长 11.77%</span>',
      '2025年机票节省 <b>3.27万元</b>，酒店节省 <b>7.43万元</b>，合计节省 <b>10.70万元</b>',
      '2025年累计为贵司 <b>2,171人</b> 提供差旅服务，差旅服务费 <b>284.00元</b>'],
    period:'2025年',
    rows:[['机票','594','1,374,193.00','13.40%',-3.55],['酒店','1,101','917,949.86','8.95%',-3.06],['火车','847','176,122.66','1.72%',-30.18],['用车','47,706','1,874,085.29','18.27%',14.51],['用餐','55,880','1,243,059.50','12.12%',-19.13],['增值/其他','57,921','4,671,738.78','45.55%',38.25],['总体消费','164,049','10,257,149.09','100.00%',11.77]],
    saving:[['机票','32,674.45元'],['酒店','74,310.35元'],['总体节省','106,984.80元']],
    trend:{title:'2025年整体消费趋势（消费金额）',sub:'2025年整体消费趋势，其中1月交易峰值达 <b>1,236,163.97元</b>，月均消费金额 <b>854,762.42元</b>',labels:CJE_M12,vals:[123.62,50.58,74.04,72.48,102.58,72.59,97.78,72.67,115.72,71.65,86.89,85.11],barw:34}
  };
  var CJE_OPTIONAL={
    headline:'2026年5-5月集采超过 77.07 万元，节约超过 0.44 万元（区间可自定义）',
    bullets:['可选月份区间汇总（示例选 2026年5月 - 5月）；口径同月报，<b>起止月份可自定义</b>',
      '2026年5-5月差旅集采 <b>770,706.51元</b>，较去年同比 <span class="cj-down">下降 -24.87%</span>',
      '2026年5-5月累计为贵司 <b>870人</b> 提供差旅服务，差旅服务费 <b>32.00元</b>'],
    period:'2026年',
    rows:CJE_MONTH.rows, saving:CJE_MONTH.saving,
    trend:{title:'2026年5-5月整体消费趋势（消费金额）',sub:'5-5月整体消费趋势，5月交易峰值达 <b>770,706.51元</b>，月均消费金额 <b>770,706.51元</b>',labels:['2026-5'],vals:[77.07],barw:60}
  };
  function cjEntNum(v){ if(v==null) return '-'; var c=v>=0?'#52c41a':'#f5222d'; return '<span style="color:'+c+'">'+(v>0?'+':'')+Number(v).toFixed(2)+'%</span>'; }
  function cjEntReport(cfg){
    var banner='<div class="cj-banner"><h2>'+cfg.headline+'</h2><span class="cj-logo">差 旅 壹 号 · YiHao</span></div>';
    var bullets='<ul class="cj-bullets">'+cfg.bullets.map(function(b){return '<li>'+b+'</li>';}).join('')+'</ul>';
    var t1='<table class="cj-tbl"><tr><th>统计时间</th><th>业务类型</th><th>订单量</th><th>消费金额/元</th><th>消费金额占比</th><th>消费金额同比</th></tr>'
      + cfg.rows.map(function(r,i){ var first=(i===0)?'<td rowspan="'+cfg.rows.length+'">'+cfg.period+'</td>':''; var st=(r[0].indexOf('总体')>-1)?' style="font-weight:700;background:#eef6ff"':''; return '<tr'+st+'>'+first+'<td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+cjEntNum(r[4])+'</td></tr>'; }).join('') + '</table>';
    var t2='<table class="cj-tbl"><tr><th>业务类型</th><th>节约金额</th></tr>'
      + cfg.saving.map(function(s){ var st=(s[0].indexOf('总')>-1)?' style="font-weight:700;background:#eef6ff"':''; return '<tr'+st+'><td>'+s[0]+'</td><td>'+s[1]+'</td></tr>'; }).join('') + '</table>';
    var dual='<div class="row" style="align-items:flex-start;gap:24px;margin-top:4px"><div style="flex:2.6;min-width:520px">'+t1+'</div><div style="flex:1;min-width:220px">'+t2+'</div></div>';
    var tb='<div class="cj-banner" style="margin-top:26px"><h2>'+cfg.trend.title+'</h2><span class="cj-logo">差 旅 壹 号 · YiHao</span></div>';
    var tsub='<ul class="cj-bullets"><li>'+cfg.trend.sub+'</li></ul>';
    var chart=vbar(cfg.trend.labels.map(function(l,i){return {label:l,val:cfg.trend.vals[i],disp:nf(cfg.trend.vals[i],2)+'万'};}),{color:C.blue,unit:'万',barw:cfg.trend.barw||30});
    return banner+bullets+dual+tb+tsub+chart;
  }
  function cjEntFilter(kind){
    var d;
    if(kind==='month') d='<div class="filter-item"><label>交易月度</label><div class="ctrl date">2026年5月</div></div>';
    else if(kind==='quarter') d='<div class="filter-item"><label>交易季度</label><div class="ctrl date">2026年第1季度</div></div>';
    else if(kind==='year') d='<div class="filter-item"><label>交易年度</label><div class="ctrl date">2025年</div></div>';
    else d='<div class="filter-item"><label>开始月份</label><div class="ctrl date">2026年5月</div></div><div class="filter-item"><label>结束月份</label><div class="ctrl date">2026年5月</div></div>';
    return '<div class="filter-row" style="padding:4px 0 8px">'+d
      +'<div class="filter-item"><label>成本中心</label><div class="ctrl"><span class="ph">请选择成本中心</span><span class="caret">∨</span></div></div>'
      +'<div class="filter-item"><label>核算单元</label><div class="ctrl"><span class="ph">请选择核算单元</span><span class="caret">∨</span></div></div>'
      +'<div class="filter-item"><label>企业名称</label><div class="ctrl"><span class="ph">请选择企业名称</span><span class="caret">∨</span></div></div>'
      +'<button class="btn btn-reset">重置</button><button class="btn btn-query">查询</button></div>';
  }
  function cjEnt(kind, data){
    var bar='<div class="cj-tabbar"><span class="active" data-tab="all">整体</span><span data-tab="air">机票</span><span data-tab="hotel">酒店</span><span data-tab="train">火车</span><span data-tab="car">用车</span></div>';
    var panes='<div class="cj-pane active" data-tab="all">'+cjEntReport(data)+'</div>'
      + '<div class="cj-pane" data-tab="air">'+cjAir(CJR_AIR[kind])+'</div>'
      + '<div class="cj-pane" data-tab="hotel">'+cjHotel(CJR_HOTEL[kind])+'</div>'
      + '<div class="cj-pane" data-tab="train">'+cjTrain(CJR_TRAIN[kind])+'</div>'
      + '<div class="cj-pane" data-tab="car">'+cjCar(CJR_CAR[kind])+'</div>';
    return '<div class="cj-tabs">'+bar+panes+'</div>'
      + reqbox([{t:'<b>企业站 · 集采报告</b>：月报 / 季报 / 年报 / 可选月年报，每张报告含 <b>整体 / 机票 / 酒店 / 火车 / 用车</b> 五个页签；「整体」为集采额 / 节约 / 同比汇总 + 消费趋势，其余页签为对应资源在所选周期内的集采明细 — ✅本页已补全', id:'—', tag:'新增'}]);
  }
  function bindCjTabs(root){
    if(!root) return;
    root.querySelectorAll('.cj-tabs').forEach(function(box){
      var bar=box.querySelector('.cj-tabbar'); if(!bar) return;
      bar.querySelectorAll('span').forEach(function(t){
        t.addEventListener('click',function(){
          var k=t.getAttribute('data-tab');
          bar.querySelectorAll('span').forEach(function(x){ x.classList.toggle('active', x===t); });
          box.querySelectorAll('.cj-pane').forEach(function(p){ p.classList.toggle('active', p.getAttribute('data-tab')===k); });
        });
      });
    });
  }

  /* ---------- 集采报告（企业站）· 资源页签：周期专属渲染（月/季/年/可选） ---------- */
  var CJC=[C.blue,C.orange,C.teal,C.purple,C.meal,'#9fb4ff','#ffd27f','#b0e3a8'];
  function cjDays(n){ var a=[]; for(var i=1;i<=n;i++) a.push(i+''); return a; }
  function cjMonths(yr){ var a=[]; for(var i=1;i<=12;i++) a.push(yr+'-'+i); return a; }
  function cjPie(items){ return {segs:items.map(function(x){return {pct:x.pct,color:x.color};}), leg:items.map(function(x){return {color:x.color,label:x.label+'('+x.pct+'%)'};})}; }
  function cjBanner(t){ return '<div class="cj-banner" style="margin-top:22px"><h2>'+t+'</h2><span class="cj-logo">差 旅 壹 号 · YiHao</span></div>'; }
  function cjBull(arr){ return '<ul class="cj-bullets">'+arr.map(function(b){return '<li>'+b+'</li>';}).join('')+'</ul>'; }
  function cjMiniDonut(label,pct,color){ return '<div style="text-align:center"><div class="sec-title" style="margin-bottom:8px">'+label+'</div>'+donut([{pct:pct,color:color},{pct:100-pct,color:'#edeff4'}],[{color:color,label:label+' '+pct.toFixed(2)+'%'}])+'</div>'; }
  function cjTbl(head,rows,boldLast){ return tableW(thead(head)+rows.map(function(r,i){return trow(r, !!boldLast&&i===rows.length-1);}).join('')); }
  function cjTrend(c){
    var bars=c.labels.map(function(l,i){ var pr=(typeof c.prices==='number')?c.prices:c.prices[i];
      return {label:l, val:c.counts[i], disp:''+c.counts[i], tip:l+'||'+c.clab+'：'+c.counts[i]+'||'+c.plab+'：¥'+nf(pr,2)}; });
    return vbar(bars,{color:C.blue, barw:c.barw||30});
  }
  function cjAir(P){
    var donuts='<div style="display:flex;flex-direction:column;gap:18px;flex:0 0 200px">'+cjMiniDonut('退票率',P.tk,C.blue)+cjMiniDonut('改签率',P.gq,C.orange)+'</div>';
    var s=cjBanner(P.head)+cjBull(P.bullets)
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:480px">'+cjTbl(P.sumHead,P.sumRows,true)+'</div>'+donuts+'</div>'
      + '<div class="hint" style="margin-top:6px">注：退票率=退票张数/出票张数，改签率=改签张数/出票张数</div>'
      + cjBanner(P.pd+'机票月度出票量和均价情况')+cjBull([P.chartSub])+cjTrend(P.chart);
    if(P.hangsi) s+=cjBanner(P.pd+'热门航司消费情况')+cjBull(['<b>'+P.pd+'</b>热门航司出行 TOP10'])+cjTbl(['航司名称','出票张数','消费金额','票均消费金额','国内票价折扣'],P.hangsi);
    if(P.hangxian) s+=cjBanner(P.pd+'热门航线消费情况')+cjBull(['<b>'+P.pd+'</b>热门航线出行 TOP10'])+cjTbl(['航线名称','出票张数','消费金额','出票占比','国内折扣'],P.hangxian);
    if(P.advance) s+=cjBanner(P.advHead)+cjTbl(['提前预订天数','出票张数','出票占比','消费金额/元','平均折扣'],P.advance);
    s+=cjBanner('通过航司协议及差标提醒，节约成本 '+P.saveW+' 万元')+cjBull(['<b>'+P.pd+'</b>机票通过航司协议、SME 协议及差标提醒，合计节约成本 <b>'+P.saveW+' 万元</b>']);
    return s;
  }
  function cjHotel(P){
    var s=cjBanner(P.head)+cjBull(P.bullets)
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:480px">'+cjTbl(P.sumHead,P.sumRows,true)+'</div><div style="flex:0 0 220px">'+cjMiniDonut('退订间夜率',P.tt,C.orange)+'</div></div>'
      + cjBanner(P.pd+'酒店月度间夜量和均价情况')+cjBull([P.chartSub])+cjTrend(P.chart);
    if(P.types) s+=cjBanner(P.pd+'各类型酒店入住消费情况')+cjBull([P.typeSub])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:460px">'+cjTbl(['酒店类型','入住间夜','间夜占比','消费金额/元','预订均价/元'],P.types,true)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">酒店类型入住分布(间夜)</div>'+donut(P.typeDonut.segs,P.typeDonut.leg)+'</div></div>';
    if(P.save) s+=cjBanner(P.pd+'酒店集采节省情况')+cjBull([P.saveSub])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:420px">'+cjTbl(['节省类型','节省金额','节省金额占比','间均节省'],P.save,true)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">酒店节省分布(节省金额)</div>'+donut(P.saveDonut.segs,P.saveDonut.leg)+'</div></div>';
    return s;
  }
  function cjTrain(P){
    var donuts='<div style="display:flex;flex-direction:column;gap:18px;flex:0 0 200px">'+cjMiniDonut('退票率',P.tk,C.blue)+cjMiniDonut('改签率',P.gq,C.orange)+'</div>';
    var s=cjBanner(P.head)+cjBull(P.bullets)
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:480px">'+cjTbl(P.sumHead,P.sumRows,true)+'</div>'+donuts+'</div>'
      + '<div class="hint" style="margin-top:6px">注：退票率=退票张数/出票张数，改签率=改签张数/出票张数</div>'
      + cjBanner(P.pd+'火车票月度出票量和均价情况')+cjBull([P.chartSub])+cjTrend(P.chart);
    if(P.seats) s+=cjBanner(P.pd+'火车票消费坐席类型分析')+cjBull([P.seatSub])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:460px">'+cjTbl(['坐席类型','出票张数','出票占比','消费金额/元','预订平均票面价'],P.seats,true)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">坐席订单量占比</div>'+donut(P.seatDonut.segs,P.seatDonut.leg)+'</div></div>';
    if(P.lines) s+=cjBanner(P.pd+'火车热门出行线路 TOP10')+cjTbl(['出行线路','出票张数','出票占比','消费金额/元','预订均价'],P.lines);
    return s;
  }
  function cjCar(P){
    var s=cjBanner(P.head)+cjBull(P.bullets)
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:460px">'+cjTbl(['用车类型','出行次数','出行占比','消费金额/元','行程均价'],P.types,true)+'</div>'
      + '<div style="flex:0 0 260px"><div class="sec-title">用车类型出行分布</div>'+vbar(P.typeBar,{color:C.blue,barw:34})+'</div></div>'
      + cjBanner(P.pd+'用车次数、行程均价情况')+cjBull([P.chartSub])+cjTrend(P.chart);
    if(P.models) s+=cjBanner(P.pd+'用车出行各车型消费情况')+cjBull([P.modelSub])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:440px">'+cjTbl(['用车车型','出行次数','出行占比','消费金额/元','行程均价'],P.models,true)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">用车车型出行占比</div>'+donut(P.modelDonut.segs,P.modelDonut.leg)+'</div></div>';
    if(P.plats) s+=cjBanner(P.pd+'用车出行平台消费情况')+cjBull(['<b>'+P.pd+'</b>用车平台消费 TOP10'])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:440px">'+cjTbl(['用车平台','出行次数','出行占比','消费金额/元','行程均价'],P.plats)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">用车平台出行占比</div>'+donut(P.platDonut.segs,P.platDonut.leg)+'</div></div>';
    if(P.scenes) s+=cjBanner(P.pd+'用车出行场景消费分析')+cjBull(['<b>'+P.pd+'</b>用车出行场景消费 TOP10'])
      + '<div class="row" style="align-items:flex-start;gap:20px"><div style="flex:1;min-width:440px">'+cjTbl(['用车场景','出行次数','出行占比','消费金额/元','行程均价'],P.scenes)+'</div>'
      + '<div style="flex:0 0 240px"><div class="sec-title">用车场景出行占比</div>'+donut(P.sceneDonut.segs,P.sceneDonut.leg)+'</div></div>';
    return s;
  }
  /* ----- 机票数据（月/季/年） ----- */
  var _AIR_M={ pd:'2026年5月', head:'2026年5月机票集采超 10.95 万元，退改率高于平台数据',
    bullets:['2026年5月机票消费 <b>109,562.00元</b>','2026年5月机票出票 <b>30张</b>，退票 <b>9张</b>，改签 <b>0张</b>','贵司：退票率 <b>30.00%</b>，改签率 <b>0%</b>　商旅平台：退票率 7.11%，改签率 2.92%'],
    sumHead:['机票','票张数','票张数占比','消费金额/元','改签手续费','均价/元'],
    sumRows:[['出票','30','76.92%','119,086.00','0.00','3,969.53'],['退票','9','23.08%','-13,626.00','3,094.00','-1,514.00'],['合计','39','100%','105,460.00','3,094.00','2,704.10']],
    tk:30.00, gq:0.00, chartSub:'5月机票出票趋势，其中日度出票量峰值达 <b>4张</b>，日度均价最高达 <b>16,010.00元</b>',
    chart:{labels:cjDays(31), counts:[1,0,2,0,1,3,0,1,0,0,2,1,0,4,0,1,0,1,1,0,0,2,1,0,1,2,0,1,0,1,1], prices:3969, clab:'出票张数', plab:'预订均价', barw:14},
    hangsi:[['国航','16','3.36万','2,100.00','0.30'],['东航','4','0.74万','1,857.00','0.36'],['南航','3','0.33万','1,100.00','0.19'],['川航','3','0.20万','670.00','0.77'],['深航','1','0.13万','1,300.00','0.32'],['其他','3','0.31万','1,033.00','0.41']],
    hangxian:[['成都-北京','5','1.20万','16.67%','0.31'],['上海-成都','4','0.95万','13.33%','0.29'],['北京-上海','3','0.66万','10.00%','0.34'],['深圳-成都','3','0.41万','10.00%','0.40'],['其他','15','6.86万','50.00%','0.36']],
    advHead:'2026年5月机票提前预订天数分布',
    advance:[['0-0','1','20.00%','9,080.00','-'],['1-1','5','16.67%','6,157.00','0.29'],['2-4','14','46.67%','15,603.00','0.38'],['5-8','2','6.67%','6,638.00','-'],['9-14','5','16.67%','36,084.00','-'],['≥15','1','3.33%','32,077.00','-']],
    saveW:'0.03' };
  var _AIR_Q={ pd:'2026年Q1', head:'2026年Q1机票交易量超 39.04 万元，退改率高于平台数据',
    bullets:['2026年Q1机票消费 <b>390,412.00元</b>','Q1机票出票 <b>169张</b>，退票 <b>23张</b>，改签 <b>2张</b>','贵司：退票率 <b>13.61%</b>，改签率 <b>1.18%</b>　商旅平台：退票率 7.02%，改签率 3.1%'],
    sumHead:['机票','票张数','票张数占比','消费金额/元','退改手续费','均价/元'],
    sumRows:[['出票','169','87.11%','435,541.00','0.00','2,577.17'],['改签','2','1.03%','700.00','400.00','350.00'],['退票','23','11.86%','-45,829.00','-33,739.00','-1,992.57'],['合计','194','100%','390,412.00','34,139.00','2,012.43']],
    tk:13.61, gq:1.18, chartSub:'2026年Q1出票趋势，其中月度出票量峰值达 <b>82张</b>，月度均价最高达 <b>2,683.89元</b>',
    chart:{labels:['2026-1','2026-2','2026-3'], counts:[82,32,55], prices:[2471.72,1761.83,2683.89], clab:'出票张数', plab:'预订均价', barw:54},
    hangsi:[['海航','5','0.39万','778.00','0.22'],['东航','4','0.33万','563.00','0.26'],['川航','3','0.56万','1,863.00','0.30'],['南航','2','0.23万','1,000.00','0.38'],['吉祥','1','0.05万','500.00','0.55']],
    hangxian:[['成都-北京','22','5.41万','13.02%','0.31'],['上海-成都','15','3.62万','8.88%','0.29'],['北京-深圳','12','2.95万','7.10%','0.33'],['深圳-成都','9','1.88万','5.33%','0.40'],['其他','111','24.60万','65.67%','0.34']],
    advHead:'64% 的机票在出行前 4 天内预订，建议提前做好出行规划',
    advance:[['0-0','22','13.02%','46,000.00','-'],['1-1','30','17.75%','58,000.00','0.29'],['2-4','56','33.14%','98,000.00','0.38'],['5-8','24','14.20%','62,000.00','-'],['9-14','21','12.43%','64,000.00','-'],['≥15','16','9.47%','62,412.00','-']],
    saveW:'1.15' };
  var _AIR_Y={ pd:'2025年', head:'2025年机票交易量超 137.41 万元，退改率高于平台数据',
    bullets:['2025年机票消费 <b>1,374,193.00元</b>','2025年机票出票 <b>625张</b>，退票 <b>108张</b>，改签 <b>58张</b>','贵司：退票率 <b>17.28%</b>，改签率 <b>9.28%</b>　商旅平台：退票率 7.68%，改签率 3.22%'],
    sumHead:['机票','票张数','票张数占比','消费金额/元','退改手续费','均价/元'],
    sumRows:[['出票','625','78.91%','1,525,871.00','0.00','2,441.39'],['改签','58','7.32%','65,922.00','11,202.00','1,136.59'],['退票','108','13.64%','-217,148.00','53,336.00','-2,010.63'],['差额退款','1','0.13%','-452.00','-452.00','-452.00'],['合计','792','100%','1,374,193.00','64,086.00','1,735.09']],
    tk:17.28, gq:9.28, chartSub:'2025年机票出票趋势，其中月度出票量峰值达 <b>109张</b>，月度均价最高达 <b>4,788.40元</b>',
    chart:{labels:cjMonths('2025'), counts:[46,36,64,38,48,44,42,62,109,51,52,53], prices:[3789,3629,1954,2220,4788,1750,3087,2080,4231,1601,1901,1242], clab:'出票张数', plab:'预订均价', barw:34},
    hangsi:[['国航','272','58.50万','2,150.00','0.29'],['东航','139','28.00万','2,014.00','0.31'],['南航','55','12.40万','2,254.00','0.31'],['川航','38','7.60万','2,000.00','0.34'],['深航','14','3.00万','2,143.00','0.32'],['其他','107','27.90万','—','0.41']],
    hangxian:[['成都-北京','272','40.90万','29.99%','0.31'],['上海-成都','110','18.40万','12.13%','0.29'],['北京-深圳','49','9.80万','5.40%','0.33'],['深圳-成都','47','9.00万','5.18%','0.30'],['其他','314','58.90万','47.30%','0.34']],
    advHead:'2025年机票提前预订天数分布',
    advance:[['0-0','79','12.64%','190,000.00','-'],['1-1','118','18.88%','250,000.00','0.30'],['2-4','205','32.80%','480,000.00','0.38'],['5-8','98','15.68%','210,000.00','-'],['9-14','82','13.12%','150,000.00','-'],['≥15','43','6.88%','94,193.00','-']],
    saveW:'3.27' };
  var CJR_AIR={ month:_AIR_M, quarter:_AIR_Q, year:_AIR_Y, optional:Object.assign({},_AIR_M,{pd:'2026年5-5月', head:'2026年5-5月机票集采超 10.95 万元，退改率高于平台数据', advHead:'2026年5-5月机票提前预订天数分布'}) };
  /* ----- 酒店数据 ----- */
  var _HT_M={ pd:'2026年5月', head:'2026年5月酒店集采超过 2.79 万元',
    bullets:['2026年5月酒店集采 <b>27,867.00元</b>，同比去年下降 <span class="cj-down">-67.48%</span>','国内酒店预订 <b>98间夜</b>，占总预订间夜 89.91%','退订 <b>37间夜</b>，占总间夜数 33.94%','预订间夜均价 <b>557.45元</b>（平台预订间夜均价 356.09元）'],
    sumHead:['酒店','入住间夜','消费金额/元','预订均价/元','差旅服务费/元'],
    sumRows:[['预订','109','60,762.00','557.45','32.00'],['退订','-37','-32,895.00','-','0.00'],['总体消费','72','27,867.00','-','32.00']],
    tt:33.94, chartSub:'2026年5月酒店预订趋势，日度预订间夜峰值达 <b>18间</b>，预订间夜均价达 <b>557.45元</b>',
    chart:{labels:cjDays(31), counts:[4,2,5,6,3,8,5,2,4,1,10,3,6,2,18,4,3,5,7,2,1,3,2,1,3,2,1,2,2,4,2], prices:557, clab:'预订间夜', plab:'间夜均价', barw:14},
    typeSub:'四星级酒店入住间夜比 40.28%，消费金额占比 69.29%，预订均价 804.81元',
    types:[['二星经济型及以下','15','13.76%','3,200.00','213.33'],['三星(舒适型)','22','20.18%','5,400.00','245.45'],['四星(高档型)','44','40.28%','19,310.00','438.86'],['五星(豪华型)','28','25.69%','32,852.00','1,173.29'],['合计','109','100%','60,762.00','557.45']],
    typeDonut:cjPie([{label:'二星经济型及以下',pct:13.76,color:CJC[0]},{label:'三星(舒适型)',pct:20.18,color:CJC[1]},{label:'四星(高档型)',pct:40.28,color:CJC[2]},{label:'五星(豪华型)',pct:25.69,color:CJC[3]}]),
    saveSub:'2026年5月酒店集采节省 0.42万元', save:[['集团协议节省','1,190.00元','28.61%','59.50元'],['OTA节省','2,577.00元','61.95%','43.68元'],['拼房节省','393.00元','9.45%','-'],['合计','4,160.00元','100%','-']],
    saveDonut:cjPie([{label:'集团协议节省',pct:28.61,color:CJC[3]},{label:'OTA节省',pct:61.95,color:CJC[2]},{label:'拼房节省',pct:9.45,color:CJC[0]}]) };
  var _HT_Q={ pd:'2026年Q1', head:'2026年Q1酒店集采超过 22.56 万元',
    bullets:['2026年Q1酒店集采 <b>225,580.07元</b>，同比去年增长 <span class="cj-up">35.52%</span>','国内酒店预订 <b>435间夜</b>，占总预订间夜 95.19%','退订 <b>50间夜</b>，占总间夜数 10.94%','预订间夜均价 <b>554.41元</b>（平台预订间夜均价 338.10元）'],
    sumHead:['酒店','入住间夜','消费金额/元','预订均价/元','差旅服务费/元'],
    sumRows:[['预订','457','253,363.17','554.41','217.00'],['退订','-50','-27,783.10','-','-1.00'],['总体消费','407','225,580.07','-','216.00']],
    tt:10.94, chartSub:'2026年Q1酒店预订趋势，月度预订间夜峰值达 <b>211间</b>，预订间夜均价达 <b>554.41元</b>',
    chart:{labels:['2026-1','2026-2','2026-3'], counts:[211,95,151], prices:[599.04,596.91,465.29], clab:'预订间夜', plab:'间夜均价', barw:54},
    typeSub:'四星级酒店入住间夜比 40.29%，消费金额占比 48.76%，预订均价 670.73元',
    types:[['二星经济型及以下','62','15.23%','13,500.00','217.74'],['三星(舒适型)','94','23.10%','42,800.00','455.32'],['四星(高档型)','164','40.29%','110,000.00','670.73'],['五星(豪华型)','87','21.38%','59,280.07','681.38'],['合计','407','100%','225,580.07','554.41']],
    typeDonut:cjPie([{label:'二星经济型及以下',pct:15.23,color:CJC[0]},{label:'三星(舒适型)',pct:23.10,color:CJC[1]},{label:'四星(高档型)',pct:40.29,color:CJC[2]},{label:'五星(豪华型)',pct:21.38,color:CJC[3]}]),
    saveSub:'2026年Q1酒店集采节省 1.16万元，间均节省 39.22元，间均节省率 7.34%（平台 7.88%）', save:[['集团协议节省','3,973.00元','34.22%','47.87元'],['OTA节省','7,221.10元','62.2%','33.90元'],['拼房节省','416.00元','3.58%','-'],['合计','11,610.10元','100%','-']],
    saveDonut:cjPie([{label:'集团协议节省',pct:34.22,color:CJC[3]},{label:'OTA节省',pct:62.2,color:CJC[2]},{label:'拼房节省',pct:3.58,color:CJC[0]}]) };
  var _HT_Y={ pd:'2025年', head:'2025年酒店集采超过 91.79 万元',
    bullets:['2025年酒店集采 <b>917,949.86元</b>，同比去年下降 <span class="cj-down">-3.06%</span>','国内酒店预订 <b>2,195间夜</b>，占总预订间夜 95.45%','退订 <b>285间夜</b>，占总间夜数 12.39%','预订间夜均价 <b>471.63元</b>（平台预订间夜均价 355.35元）'],
    sumHead:['酒店','入住间夜','消费金额/元','预订均价/元','差旅服务费/元'],
    sumRows:[['预订','2,300','1,084,751.80','471.63','224.00'],['退订','-285','-166,801.94','-','-5.00'],['总体消费','2,015','917,949.86','-','224.00']],
    tt:12.39, chartSub:'2025年酒店预订趋势，月度预订间夜峰值达 <b>330间</b>，预订间夜均价达 <b>471.63元</b>',
    chart:{labels:cjMonths('2025'), counts:[150,102,201,165,128,210,160,175,260,224,330,270], prices:[413.84,461.66,365.67,411.75,470.61,419.76,524.24,435.06,464.71,411.75,440.00,431.73], clab:'预订间夜', plab:'间夜均价', barw:34},
    typeSub:'三星级酒店入住间夜比 46.11%，消费金额占比 46%，预订均价 456.42元',
    types:[['二星经济型及以下','458','22.73%','171,336.00','430.06'],['三星(舒适型)','929','46.11%','422,251.05','456.42'],['四星(高档型)','543','26.95%','264,542.31','494.24'],['五星(豪华型)','84','4.17%','59,574.50','710.65'],['其他','1','0.05%','246.00','246.00'],['合计','2,015','100%','917,949.86','471.63']],
    typeDonut:cjPie([{label:'二星经济型及以下',pct:22.73,color:CJC[0]},{label:'三星(舒适型)',pct:46.11,color:CJC[1]},{label:'四星(高档型)',pct:26.95,color:CJC[2]},{label:'五星(豪华型)',pct:4.17,color:CJC[3]},{label:'其他',pct:0.05,color:CJC[4]}]),
    saveSub:'2025年酒店集采节省 7.43万元，间均节省 31.35元，间均节省率 8.47%（平台 10.55%）', save:[['集团协议节省','25,803.00元','34.72%','32.70元'],['集体协议节省','8,463.00元','11.39%','64.60元'],['OTA节省','22,026.35元','29.64%','15.72元'],['拼房节省','18,018.00元','24.25%','-'],['合计','74,310.35元','100%','-']],
    saveDonut:cjPie([{label:'集团协议节省',pct:34.72,color:CJC[3]},{label:'集体协议节省',pct:11.39,color:CJC[5]},{label:'OTA节省',pct:29.64,color:CJC[2]},{label:'拼房节省',pct:24.25,color:CJC[0]}]) };
  var CJR_HOTEL={ month:_HT_M, quarter:_HT_Q, year:_HT_Y, optional:Object.assign({},_HT_M,{pd:'2026年5-5月', head:'2026年5-5月酒店集采超过 2.79 万元'}) };
  /* ----- 火车数据 ----- */
  var _TR_M={ pd:'2026年5月', head:'2026年5月火车票消费数据分析',
    bullets:['2026年5月火车票消费总额超过 <b>1.11万元</b>','火车票出票合计 <b>67张</b>，退票 <b>7张</b>，改签 <b>7张</b>，合计消费金额 <b>11,101.00元</b>','退票率 <b>10.45%</b>，改签率 <b>10.45%</b>（平台退票率 7.35%，改签率 9.28%）','火车票预订均票面价 <b>179.55元</b>（平台预订票均票面价 186.74元）'],
    sumHead:['火车票','票张数','票张数占比','消费金额/元','退改手续费','预订票均票面价'],
    sumRows:[['出票','67','82.72%','12,030.00','0.00','179.55'],['改签','7','8.64%','785.00','0.00','-'],['退票','7','8.64%','-1,714.00','33.00','-'],['整体消费','81','100.00%','11,101.00','33.00','179.55']],
    tk:10.45, gq:10.45, chartSub:'2026年5月出票趋势，其中日度出票峰值达 <b>7张</b>，预订票均票面价达 <b>179.55元</b>',
    chart:{labels:cjDays(31), counts:[2,1,0,3,0,4,1,3,0,2,5,1,7,0,2,1,3,0,4,2,1,0,3,2,1,0,2,1,0,3,1], prices:179, clab:'出票张数', plab:'预订均价', barw:14},
    seatSub:'其他订单数量占总订单数量的 10.45%',
    seats:[['一等座','3','4.48%','267.00','118.33'],['二等座','57','85.07%','10,354.00','191.95'],['其他','7','10.45%','480.00','104.86'],['合计','67','100.00%','11,101.00','179.55']],
    seatDonut:cjPie([{label:'一等座',pct:4.48,color:CJC[3]},{label:'二等座',pct:85.07,color:CJC[0]},{label:'其他',pct:10.45,color:CJC[1]}]),
    lines:[['武汉-上海','3','4.48%','1,073.00','357.67'],['齐齐哈尔-哈尔滨','3','4.48%','294.00','98.00'],['北京-天津','2','2.99%','228.50','71.25'],['北京-太原','2','2.99%','396.00','198.00'],['北京-长春','2','2.99%','528.00','503.00'],['成都-重庆','2','2.99%','326.00','163.00'],['济南-北京','2','2.99%','394.00','197.00'],['深圳-厦门','2','2.99%','458.00','229.00']] };
  var _TR_Q={ pd:'2026年Q1', head:'2026年Q1火车票消费数据分析',
    bullets:['2026年Q1火车票消费总额超过 <b>3.74万元</b>','火车票出票合计 <b>177张</b>，退票 <b>7张</b>，改签 <b>31张</b>，合计消费金额 <b>37,427.00元</b>','退票率 <b>3.95%</b>，改签率 <b>17.51%</b>（平台退票率 6.96%，改签率 3.95%）','火车票预订均票面价 <b>202.41元</b>（平台预订票均票面价 196.19元）'],
    sumHead:['火车票','票张数','票张数占比','消费金额/元','退改手续费','预订票均票面价'],
    sumRows:[['出票','177','81.94%','35,826.50','0.00','202.41'],['改签','31','14.35%','8,355.00','194.50','-'],['退票','7','3.24%','-6,750.50','153.00','-'],['差额退款','1','0.46%','-4.00','0.00','-'],['整体消费','216','100.00%','37,427.00','347.50','202.41']],
    tk:3.95, gq:17.51, chartSub:'2026年Q1出票趋势，其中月度出票峰值达 <b>79张</b>，预订票均票面价达 <b>228.74元</b>',
    chart:{labels:['2026-1','2026-2','2026-3'], counts:[73,25,79], prices:[170.13,156.00,228.74], clab:'出票张数', plab:'预订均价', barw:54},
    seatSub:'其他订单数量占总订单数量的 5.08%',
    seats:[['一等座','3','1.69%','1,584.00','226.67'],['二等座','165','93.22%','28,523.00','182.81'],['其他','9','5.08%','7,320.00','553.67'],['合计','177','100.00%','37,427.00','202.41']],
    seatDonut:cjPie([{label:'一等座',pct:1.69,color:CJC[3]},{label:'二等座',pct:93.22,color:CJC[0]},{label:'其他',pct:5.08,color:CJC[1]}]),
    lines:[['上海-武汉','6','3.39%','2,234.00','372.33'],['广州-深圳','7','3.95%','398.00','56.86'],['成都-重庆','5','2.82%','812.00','159.80'],['重庆-成都','5','2.82%','848.50','149.80'],['长春-北京','5','2.82%','2,530.00','506.00'],['齐齐哈尔-哈尔滨','5','2.82%','490.00','98.00'],['北京-天津','4','2.26%','331.00','82.75']] };
  var _TR_Y={ pd:'2025年', head:'2025年火车票消费数据分析',
    bullets:['2025年火车票消费总额超过 <b>17.61万元</b>','火车票出票合计 <b>907张</b>，退票 <b>97张</b>，改签 <b>134张</b>，合计消费金额 <b>176,122.66元</b>','退票率 <b>10.69%</b>，改签率 <b>14.77%</b>（平台退票率 7.45%，改签率 11.19%）','火车票预订均票面价 <b>217.66元</b>（平台预订票均票面价 203.02元）'],
    sumHead:['火车票','票张数','票张数占比','消费金额/元','退改手续费','预订票均票面价'],
    sumRows:[['出票','907','79.42%','196,842.12','0.00','217.66'],['改签','134','11.73%','30,840.50','274.00','-'],['退票','97','8.49%','-51,506.96','3,417.50','-'],['差额退款','4','0.35%','-53.00','0.00','-'],['整体消费','1,142','100.00%','176,122.66','3,691.50','217.66']],
    tk:10.69, gq:14.77, chartSub:'2025年出票趋势，其中月度出票峰值达 <b>104张</b>，预订票均票面价达 <b>217.66元</b>',
    chart:{labels:cjMonths('2025'), counts:[104,36,98,59,78,91,77,56,88,68,84,67], prices:[170.13,162.23,237.08,59.00,237.08,205.00,179.18,275.90,269.71,179.18,182.47,229.53], clab:'出票张数', plab:'预订均价', barw:34},
    seatSub:'其他订单数量占总订单数量的 9.81%',
    seats:[['一等座','18','1.98%','7,332.05','184.72'],['二等座','783','86.33%','154,932.50','221.63'],['其他','89','9.81%','12,722.11','217.53'],['硬卧','17','1.87%','1,136.00','70.15'],['合计','907','100.00%','176,122.66','217.66']],
    seatDonut:cjPie([{label:'一等座',pct:1.98,color:CJC[3]},{label:'二等座',pct:86.33,color:CJC[0]},{label:'其他',pct:9.81,color:CJC[1]},{label:'硬卧',pct:1.87,color:CJC[4]}]),
    lines:[['上海-杭州','47','5.18%','3,342.00','80.45'],['哈尔滨-齐齐哈尔','42','4.63%','4,116.00','98.00'],['齐齐哈尔-哈尔滨','42','4.63%','4,116.00','96.00'],['北京-武汉','32','3.53%','18,766.50','615.19'],['深圳-广州','32','3.53%','1,864.50','59.34'],['武汉-北京','30','3.31%','16,828.00','610.93'],['广州-深圳','28','3.09%','1,552.50','55.45']] };
  var CJR_TRAIN={ month:_TR_M, quarter:_TR_Q, year:_TR_Y, optional:Object.assign({},_TR_M,{pd:'2026年5-5月', head:'2026年5-5月火车票消费数据分析'}) };
  /* ----- 用车数据 ----- */
  var _CAR_M={ pd:'2026年5月', head:'2026年5月用车集采消费情况',
    bullets:['2026年5月用车交易金额 <b>119,563.08元</b>','共计出行 <b>3,125次</b>，行程均价 38.26元（平台行程均价 54.46元）','主要业务类型为实时用车，占比 99.01%'],
    types:[['实时用车','3,094','99.01%','116,515.60','37.66'],['预约用车','25','0.80%','2,358.34','94.33'],['接送机','4','0.13%','640.44','160.11'],['接送站','2','0.06%','48.70','24.35'],['合计','3,125','100.00%','119,563.08','38.26']],
    typeBar:[{label:'实时用车',val:99.01,disp:'99.01%'},{label:'预约用车',val:0.80,disp:'0.80%'},{label:'接送机',val:0.13,disp:'0.13%'},{label:'接送站',val:0.06,disp:'0.06%'}],
    chartSub:'2026年5月用车出行趋势，日度出行峰值达 <b>161次</b>，月度行程均价最高达 <b>45.40元</b>',
    chart:{labels:cjDays(31), counts:[67,37,36,28,31,89,137,132,106,108,66,148,139,144,119,67,51,140,158,142,129,78,55,116,136,127,161,127,66,52,60], prices:38, clab:'用车次数', plab:'行程均价', barw:14},
    modelSub:'经济型用车次数占比 43.84%，消费金额占比 40.55%，价均 35.40元',
    models:[['经济型','1,370','43.84%','48,482.11','35.40'],['舒适型','1,692','54.14%','64,336.21','38.02'],['商务型','63','2.02%','6,744.76','107.06'],['合计','3,125','100.00%','119,563.08','38.26']],
    modelDonut:cjPie([{label:'经济型',pct:43.84,color:CJC[1]},{label:'舒适型',pct:54.14,color:CJC[0]},{label:'商务型',pct:2.02,color:CJC[3]}]),
    plats:[['滴滴出行','2,238','71.62%','84,864.62','37.93'],['曹操出行','229','7.33%','8,002.56','34.95'],['阳光出行','229','7.33%','8,994.91','39.28'],['T3出行','68','2.18%','2,597.39','38.20'],['神州专车','65','2.08%','3,123.37','48.05'],['首汽约车','64','2.05%','3,125.31','48.83'],['享道出行','54','1.73%','1,938.88','35.91'],['如祺出行','43','1.38%','1,785.69','41.53'],['曹操优享','41','1.31%','986.66','24.06'],['滴滴企业特价','15','0.48%','745.10','49.67']],
    platDonut:cjPie([{label:'滴滴出行',pct:71.62,color:CJC[0]},{label:'曹操出行',pct:7.33,color:CJC[1]},{label:'阳光出行',pct:7.33,color:CJC[2]},{label:'T3出行',pct:2.18,color:CJC[3]},{label:'神州专车',pct:2.08,color:CJC[4]},{label:'首汽约车',pct:2.05,color:CJC[5]},{label:'其他',pct:7.41,color:CJC[6]}]),
    scenes:[['21:30以后市内用车','2,319','74.21%','82,811.99','35.72'],['出差','389','12.45%','22,392.96','57.57'],['客满通宵班次上班用车','362','11.58%','10,992.00','30.36'],['市内因公出行','31','0.99%','1,716.72','55.38'],['商务接待','18','0.58%','1,204.28','66.90'],['会议会展','6','0.19%','445.13','74.19']],
    sceneDonut:cjPie([{label:'21:30以后市内用车',pct:74.21,color:CJC[0]},{label:'出差',pct:12.45,color:CJC[1]},{label:'客满通宵班次上班用车',pct:11.58,color:CJC[2]},{label:'市内因公出行',pct:0.99,color:CJC[3]},{label:'商务接待',pct:0.58,color:CJC[4]},{label:'会议会展',pct:0.19,color:CJC[5]}]) };
  var _CAR_Q={ pd:'2026年Q1', head:'2026年Q1用车集采消费情况',
    bullets:['2026年Q1用车交易金额 <b>480,259.51元</b>','共计出行 <b>13,313次</b>，行程均价 36.13元（平台行程均价 36.07元）','主要业务类型为实时用车，占比 98.97%'],
    types:[['实时用车','13,176','98.97%','468,020.49','35.57'],['预约用车','124','0.93%','10,941.62','88.24'],['接送机','12','0.09%','1,264.85','105.40'],['接送站','1','0.01%','32.55','32.55'],['合计','13,313','100.00%','480,259.51','36.13']],
    typeBar:[{label:'实时用车',val:98.97,disp:'98.97%'},{label:'预约用车',val:0.93,disp:'0.93%'},{label:'接送机',val:0.09,disp:'0.09%'},{label:'接送站',val:0.01,disp:'0.01%'}],
    chartSub:'2026年Q1用车出行趋势，月度出行峰值达 <b>5,073次</b>，月度行程均价最高达 <b>36.45元</b>',
    chart:{labels:['2026-1','2026-2','2026-3'], counts:[4853,3387,5073], prices:[36.49,36.45,35.56], clab:'用车次数', plab:'行程均价', barw:54},
    modelSub:'舒适型用车订单占比 41.28%，消费金额占比 43.63%，均价 38.15元',
    models:[['经济型','7,608','57.15%','241,477.20','31.74'],['舒适型','5,495','41.28%','209,545.91','38.15'],['商务型','206','1.55%','28,678.24','139.21'],['豪华型','4','0.03%','558.16','139.54'],['合计','13,313','100.00%','480,259.51','36.13']],
    modelDonut:cjPie([{label:'经济型',pct:57.15,color:CJC[1]},{label:'舒适型',pct:41.28,color:CJC[0]},{label:'商务型',pct:1.55,color:CJC[3]},{label:'豪华型',pct:0.03,color:CJC[4]}]),
    plats:[['滴滴出行','9,536','71.63%','339,000.00','35.55'],['曹操出行','976','7.33%','34,200.00','35.04'],['阳光出行','976','7.33%','38,400.00','39.34'],['T3出行','290','2.18%','11,000.00','37.93'],['神州专车','277','2.08%','13,300.00','48.01'],['首汽约车','273','2.05%','13,300.00','48.72'],['享道出行','230','1.73%','8,260.00','35.91'],['如祺出行','184','1.38%','7,600.00','41.30'],['曹操优享','175','1.31%','4,200.00','24.00'],['滴滴企业特价','64','0.48%','3,170.00','49.53']],
    platDonut:cjPie([{label:'滴滴出行',pct:71.63,color:CJC[0]},{label:'曹操出行',pct:7.33,color:CJC[1]},{label:'阳光出行',pct:7.33,color:CJC[2]},{label:'T3出行',pct:2.18,color:CJC[3]},{label:'神州专车',pct:2.08,color:CJC[4]},{label:'首汽约车',pct:2.05,color:CJC[5]},{label:'其他',pct:7.40,color:CJC[6]}]),
    scenes:[['21:30以后市内用车','8,031','60.32%','281,581.70','35.08'],['客满通宵班次上班用车','3,867','29.05%','101,247.21','26.18'],['出差','1,161','8.72%','82,040.21','71.14'],['市内因公出行','213','1.60%','11,251.67','52.96'],['会议会展','33','0.25%','2,419.52','73.32'],['商务接待','8','0.06%','1,719.20','214.90']],
    sceneDonut:cjPie([{label:'21:30以后市内用车',pct:60.32,color:CJC[0]},{label:'客满通宵班次上班用车',pct:29.05,color:CJC[2]},{label:'出差',pct:8.72,color:CJC[1]},{label:'市内因公出行',pct:1.60,color:CJC[3]},{label:'会议会展',pct:0.25,color:CJC[5]},{label:'商务接待',pct:0.06,color:CJC[4]}]) };
  var _CAR_Y={ pd:'2025年', head:'2025年用车集采消费情况',
    bullets:['2025年用车交易金额 <b>1,874,085.29元</b>','共计出行 <b>50,626次</b>，行程均价 37.03元（平台行程均价 53.44元）','主要业务类型为实时用车，占比 98.80%'],
    types:[['实时用车','50,018','98.80%','1,820,596.73','36.41'],['预约用车','546','1.08%','45,871.21','84.54'],['接送站','33','0.07%','2,248.16','68.13'],['接送机','29','0.06%','5,369.19','185.14'],['合计','50,626','100.00%','1,874,085.29','37.03']],
    typeBar:[{label:'实时用车',val:98.80,disp:'98.80%'},{label:'预约用车',val:1.08,disp:'1.08%'},{label:'接送站',val:0.07,disp:'0.07%'},{label:'接送机',val:0.06,disp:'0.06%'}],
    chartSub:'2025年用车出行趋势，月度出行峰值达 <b>5,448次</b>，月度行程均价最高达 <b>39.35元</b>',
    chart:{labels:cjMonths('2025'), counts:[3773,3323,4260,4207,3759,3619,4221,4054,4700,4391,4871,5448], prices:[38.08,37.50,37.96,38.36,38.50,39.35,36.78,35.83,37.45,36.46,34.20,35.15], clab:'用车次数', plab:'行程均价', barw:34},
    modelSub:'舒适型用车订单占比 41.28%，消费金额占比 43.22%，均价 38.76元',
    models:[['经济型','28,945','57.17%','905,000.00','31.27'],['舒适型','20,900','41.28%','810,000.00','38.76'],['商务型','775','1.53%','157,000.00','202.58'],['豪华型','6','0.01%','2,085.29','347.55'],['合计','50,626','100.00%','1,874,085.29','37.03']],
    modelDonut:cjPie([{label:'经济型',pct:57.17,color:CJC[1]},{label:'舒适型',pct:41.28,color:CJC[0]},{label:'商务型',pct:1.53,color:CJC[3]},{label:'豪华型',pct:0.01,color:CJC[4]}]),
    plats:[['滴滴出行','36,258','71.62%','1,342,000.00','37.01'],['曹操出行','3,711','7.33%','127,000.00','34.22'],['阳光出行','3,711','7.33%','142,000.00','38.27'],['T3出行','1,104','2.18%','41,500.00','37.59'],['神州专车','1,053','2.08%','50,600.00','48.05'],['首汽约车','1,038','2.05%','50,700.00','48.84'],['享道出行','876','1.73%','31,400.00','35.84'],['如祺出行','699','1.38%','29,000.00','41.49'],['曹操优享','663','1.31%','15,900.00','23.98'],['滴滴企业特价','243','0.48%','12,100.00','49.79']],
    platDonut:cjPie([{label:'滴滴出行',pct:71.62,color:CJC[0]},{label:'曹操出行',pct:7.33,color:CJC[1]},{label:'阳光出行',pct:7.33,color:CJC[2]},{label:'T3出行',pct:2.18,color:CJC[3]},{label:'神州专车',pct:2.08,color:CJC[4]},{label:'首汽约车',pct:2.05,color:CJC[5]},{label:'其他',pct:7.41,color:CJC[6]}]),
    scenes:[['21:30以后市内用车','30,538','60.32%','1,070,000.00','35.04'],['客满通宵班次上班用车','14,707','29.05%','385,000.00','26.18'],['出差','4,414','8.72%','312,000.00','70.68'],['市内因公出行','810','1.60%','42,800.00','52.84'],['会议会展','126','0.25%','9,200.00','73.02'],['商务接待','31','0.06%','6,540.00','210.97']],
    sceneDonut:cjPie([{label:'21:30以后市内用车',pct:60.32,color:CJC[0]},{label:'客满通宵班次上班用车',pct:29.05,color:CJC[2]},{label:'出差',pct:8.72,color:CJC[1]},{label:'市内因公出行',pct:1.60,color:CJC[3]},{label:'会议会展',pct:0.25,color:CJC[5]},{label:'商务接待',pct:0.06,color:CJC[4]}]) };
  var CJR_CAR={ month:_CAR_M, quarter:_CAR_Q, year:_CAR_Y, optional:Object.assign({},_CAR_M,{pd:'2026年5-5月', head:'2026年5-5月用车集采消费情况'}) };

  /* ---------- 消费与节省明细：全字段筛选面板（枚举下拉 / 时间区间 / 文本输入） ---------- */
  function dField(f){
    var ct='height:30px;min-width:140px;border:1px solid #dcdfe6;border-radius:4px;padding:0 8px;color:#606266;background:#fff;font-size:13px;outline:none;';
    var c;
    if(f.type==='date'){ c='<input type="date" style="'+ct+'min-width:136px"><span style="color:#909399;margin:0 2px">→</span><input type="date" style="'+ct+'min-width:136px">'; }
    else if(f.type==='text'){ c='<input type="text" placeholder="'+(f.ph||'请输入')+'" style="'+ct+'">'; }
    else { c='<select style="'+ct+'">'+f.opts.map(function(o){return '<option>'+o+'</option>';}).join('')+'</select>'; }
    return '<div class="filter-item"><label>'+f.label+'</label>'+c+'</div>';
  }
  function dFilters(fields){
    var globalFields=[
      {label:'订单时间类型',opts:['预订后','出行后']},
      {label:'订单时间',type:'date'},
      {label:'企业名称',opts:['请选择企业名称']},
      {label:'部门',opts:['请选择消费者所属部门名称']},
      {label:'外部企业',opts:['不含','仅外部企业']},
      {label:'核算主体 <span class="new-tag">新增</span>',opts:['请选择核算主体']},
      {label:'成本中心 <span class="new-tag">新增</span>',opts:['请选择成本中心']}
    ];
    return '<div class="sec-title">消费明细筛选 <span class="new-tag">全字段 / 枚举可选</span><span class="hint" style="margin-left:8px;font-weight:400">（已合并顶部 订单时间 / 企业 / 部门 / 核算主体 / 成本中心）</span></div>'
      + '<div class="filter-row" style="gap:12px 18px;margin-bottom:4px">'+globalFields.concat(fields).map(dField).join('')+'</div>'
      + '<div style="margin:12px 0 2px"><button class="btn btn-query">查询</button>&nbsp;&nbsp;<button class="btn btn-reset">重置</button></div>';
  }

  /* ---------- 页面 ---------- */
  var PAGES = {
    'ov-all': { crumb:'总览报告_整体', render:function(){
      return '<div class="ov-toggle" data-view="amt">'
        + '<div class="pg-tabs"><span class="active" data-view="amt">消费金额</span><span data-view="cnt">订单量</span></div>'
        /* ===== 消费金额 视图 ===== */
        + '<div class="ov-pane" data-view="amt">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">整体消费金额'+itip({def:'报告周期内全部业务线（机票/酒店/火车/用车/用餐/增值）的消费金额合计',formula:'Σ 各业务线消费金额',src:'消费明细基线表 · T+1 清洗',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">4,800,000.00元</div>'
        +       '<div class="sub"><div>月均消费金额 <b>800,000.00元</b></div><div>差旅服务费 <b>280元</b></div><div>消费金额同比 '+deltaSpan(40.84,'万元',2)+' '+yoy(9.3)+'</div></div></div>'
        +     '<div class="dist-block"><div class="sec-title">各产品消费分布</div><div class="dist-inner">'
        +       donut([{pct:56.98,color:C.other},{pct:15.00,color:C.car},{pct:11.67,color:C.air},{pct:8.54,color:C.meal},{pct:6.46,color:C.hotel},{pct:1.35,color:C.train}],
                  [{color:C.train,label:'火车(1.35%)'},{color:C.hotel,label:'酒店(6.46%)'},{color:C.meal,label:'用餐(8.54%)'},{color:C.air,label:'机票(11.67%)'},{color:C.car,label:'用车(15.00%)'},{color:C.other,label:'增值/其他(56.98%)'}])
        +       '<div class="product-cards">'
        +         pcard('✈️','机票','560,000.00元')+pcard('🏨','酒店','310,000.00元')+pcard('🚆','火车','65,000.00元')
        +         pcard('🚗','用车','720,000.00元')+pcard('🍽️','用餐','410,000.00元')+pcard('✨','增值/其他','2,735,000.00元')
        +       '</div></div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">消费金额趋势</div>'
        +   trendBars([119,77,96,84,71,32],150,'万元')
        +   '<div class="sec-title mt">各产品消费金额趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:19.91,color:C.air},{v:11.52,color:C.hotel},{v:1.36,color:C.train},{v:17.65,color:C.car},{v:10.20,color:C.meal},{v:68.83,color:C.other}]},
              {label:'2026-2',segs:[{v:5.05,color:C.air},{v:3.05,color:C.hotel},{v:0.50,color:C.train},{v:7.65,color:C.car},{v:12.34,color:C.meal},{v:55.82,color:C.other}]},
              {label:'2026-3',segs:[{v:16.08,color:C.air},{v:6.44,color:C.hotel},{v:0.56,color:C.train},{v:8.92,color:C.car},{v:18.04,color:C.meal},{v:53.69,color:C.other}]},
              {label:'2026-4',segs:[{v:10.63,color:C.air},{v:8.15,color:C.hotel},{v:0.50,color:C.train},{v:8.23,color:C.car},{v:14.31,color:C.meal},{v:48.35,color:C.other}]},
              {label:'2026-5',segs:[{v:10.55,color:C.air},{v:2.79,color:C.hotel},{v:0.50,color:C.train},{v:7.78,color:C.car},{v:11.96,color:C.meal},{v:42.89,color:C.other}]},
              {label:'2026-6',segs:[{v:0.67,color:C.air},{v:3.08,color:C.hotel},{v:0.30,color:C.train},{v:2.00,color:C.car},{v:1.00,color:C.meal},{v:34.02,color:C.other}]}
            ],150,'万元',[{color:C.other,label:'增值/其他'},{color:C.meal,label:'用餐'},{color:C.car,label:'用车'},{color:C.train,label:'火车'},{color:C.hotel,label:'酒店'},{color:C.air,label:'机票'}])
        + '</div>'
        /* ===== 订单量 视图（按订单量截图补齐） ===== */
        + '<div class="ov-pane" data-view="cnt" style="display:none">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">整体订单量'+itip({def:'报告周期内全部业务线的订单数合计',formula:'Σ 各业务线订单数（出票/间夜/用车次数按各线口径）',src:'订单基线表 · T+1 清洗',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">65,258</div>'
        +       '<div class="sub"><div>月均订单量 <b>10,876.33</b></div><div>服务人数 <b>1,609</b></div><div>订单量同比 '+deltaSpan(4722,'单',0)+' '+yoy(7.8)+'</div></div></div>'
        +     '<div class="dist-block"><div class="sec-title">各产品消费订单分布</div><div class="dist-inner">'
        +       donut([{pct:36.33,color:C.other},{pct:31.39,color:C.car},{pct:30.77,color:C.meal},{pct:0.62,color:C.hotel},{pct:0.54,color:C.train},{pct:0.35,color:C.air}],
                  [{color:C.air,label:'机票(0.35%)'},{color:C.hotel,label:'酒店(0.62%)'},{color:C.train,label:'火车(0.54%)'},{color:C.car,label:'用车(31.39%)'},{color:C.meal,label:'用餐(30.77%)'},{color:C.other,label:'增值/其他(36.33%)'}])
        +       '<div class="product-cards">'
        +         pcard('✈️','机票','229')+pcard('🏨','酒店','405')+pcard('🚆','火车','352')
        +         pcard('🚗','用车','20,484')+pcard('🍽️','用餐','20,082')+pcard('✨','增值/其他','23,706')
        +       '</div></div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">整体订单量趋势</div>'
        +   vbar([{label:'2026-1',val:13824,disp:'13,824'},{label:'2026-2',val:9848,disp:'9,848'},{label:'2026-3',val:14197,disp:'14,197'},{label:'2026-4',val:12017,disp:'12,017'},{label:'2026-5',val:10476,disp:'10,476'},{label:'2026-6',val:5032,disp:'5,032'}],{color:C.blue,barw:44})
        +   '<div class="sec-title mt">各产品订单量趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:79,color:C.air},{v:60,color:C.hotel},{v:55,color:C.train},{v:4594,color:C.car},{v:4480,color:C.meal},{v:4516,color:C.other}]},
              {label:'2026-2',segs:[{v:36,color:C.air},{v:70,color:C.hotel},{v:50,color:C.train},{v:3244,color:C.car},{v:3144,color:C.meal},{v:3346,color:C.other}]},
              {label:'2026-3',segs:[{v:45,color:C.air},{v:80,color:C.hotel},{v:60,color:C.train},{v:4858,color:C.car},{v:4054,color:C.meal},{v:5073,color:C.other}]},
              {label:'2026-4',segs:[{v:38,color:C.air},{v:75,color:C.hotel},{v:50,color:C.train},{v:3496,color:C.car},{v:3673,color:C.meal},{v:4644,color:C.other}]},
              {label:'2026-5',segs:[{v:32,color:C.air},{v:65,color:C.hotel},{v:45,color:C.train},{v:2992,color:C.car},{v:3344,color:C.meal},{v:3969,color:C.other}]},
              {label:'2026-6',segs:[{v:6,color:C.air},{v:40,color:C.hotel},{v:30,color:C.train},{v:1301,color:C.car},{v:1388,color:C.meal},{v:2259,color:C.other}]}
            ],15000,'',[{color:C.other,label:'增值/其他'},{color:C.meal,label:'用餐'},{color:C.car,label:'用车'},{color:C.train,label:'火车'},{color:C.hotel,label:'酒店'},{color:C.air,label:'机票'}])
        + '</div>'
        + '</div>'
        + compareSection()
        + reqbox([ R1(),
            {t:'<b>上线必备 H</b>：所有指标加 ⓘ 口径提示（含义/公式/来源/适用范围）— ✅本页关键指标已落地（鼠标悬停指标名旁 ⓘ 查看）；上线门禁项', id:'—', tag:'新增'},
            {t:'<b>需求18</b>：同比<b>并入各业务子页（机票/酒店/火车/用车）的消费明细表</b>呈现（环比已下线；整体总览仅图表，无明细表）— ✅已落地', id:'—', tag:'新增'},
            {t:'<b>需求19</b>：企业 / 核算主体 / 部门对比（表格：消费金额/金额占比/产品条数/条数占比，按金额排名；各业务线页另有本线对比）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'集团差旅报告增加<b>二级单位消费金额排名</b>模块', id:'2502988', tag:'新增'},
            {t:'增加<b>碳排放数据</b>展示（依赖数据源接入，状态：暂不做）', id:'2600219', tag:'优化'}
          ]);
    }},

    'ov-air': { crumb:'总览报告_机票', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return '<div class="ov-toggle" data-view="amt">'
        + '<div class="pg-tabs"><span class="active" data-view="amt">消费金额</span><span data-view="cnt">出票张数</span></div>'
        /* ===== 消费金额 ===== */
        + '<div class="ov-pane" data-view="amt">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">机票消费金额'+itip({def:'机票业务线消费金额（含税费，已扣退票、含改签差价）',formula:'出票成交净价 − 退票金额 + 改签差价 + 税费',src:'机票消费明细基线表',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">560,000.00元</div>'
        +       statList([{k:'月均消费金额',v:'93,333.33元'},{k:'差旅服务费',v:'0元'},{k:'国内消费金额',v:'305,000元'},{k:'国际消费金额',v:'255,000元'},{k:'协议消费金额',v:'20,000元'},{k:'非协议消费金额',v:'540,000元'},{k:'改签消费金额',v:'1,800.00元'},{k:'退票消费金额',v:'-58,000.00元'},{k:'消费金额同比',v:yoy(13.2)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">机票消费金额分布</div><div class="dist-donuts">'
        +       donut([{pct:54.46,color:C.blue},{pct:45.54,color:C.orange}],[{color:C.blue,label:'国内(54.46%)'},{color:C.orange,label:'国际(45.54%)'}],['国内_国际机票：国内||消费金额：305,000.00元(54.46%)||同比：+11.5%','国内_国际机票：国际||消费金额：255,000.00元(45.54%)||同比：+15.6%'])
        +       donut([{pct:96.43,color:C.teal},{pct:3.57,color:C.purple}],[{color:C.teal,label:'非协议(96.43%)'},{color:C.purple,label:'协议(3.57%)'}],['是否协议机票：非协议||消费金额：540,000.00元(96.43%)||同比：+13.8%','是否协议机票：协议||消费金额：20,000.00元(3.57%)||同比：-4.2%'])
        +     '</div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">机票消费金额趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:9,color:C.blue},{v:3,color:C.orange}]},{label:'2026-2',segs:[{v:5,color:C.blue},{v:2.5,color:C.orange}]},
              {label:'2026-3',segs:[{v:6,color:C.blue},{v:5,color:C.orange}]},{label:'2026-4',segs:[{v:5.5,color:C.blue},{v:3.5,color:C.orange}]},
              {label:'2026-5',segs:[{v:5,color:C.blue},{v:3,color:C.orange}]},{label:'2026-6',segs:[{v:4,color:C.blue},{v:1,color:C.orange}]}
            ],15,'万元',[{color:C.orange,label:'国际'},{color:C.blue,label:'国内'}])
        + '</div>'
        /* ===== 出票张数 ===== */
        + '<div class="ov-pane" data-view="cnt" style="display:none">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">机票出票张数'+itip({def:'报告周期内机票出票总张数（国内+国际）',formula:'Σ 出票张数（不含纯退票/改签换开重复计数）',src:'机票出票明细',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">245</div>'
        +       statList([{k:'机票月均出票',v:'41张'},{k:'订单量',v:'229'},{k:'国内出票张数',v:'224张'},{k:'国际出票张数',v:'21张'},{k:'协议出票张数',v:'18张'},{k:'非协议出票张数',v:'227张'},{k:'机票改签张数',v:'7张'},{k:'机票退票张数',v:'34张'},{k:'出票张数同比',v:yoy(8.6)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">机票出票分布</div><div class="dist-donuts">'
        +       donut([{pct:91.43,color:C.blue},{pct:8.57,color:C.orange}],[{color:C.blue,label:'国内(91.43%)'},{color:C.orange,label:'国际(8.57%)'}],['国内_国际机票：国内||机票出票张数：224张(91.43%)||同比：+7.9%','国内_国际机票：国际||机票出票张数：21张(8.57%)||同比：+14.3%'])
        +       donut([{pct:92.65,color:C.teal},{pct:7.35,color:C.purple}],[{color:C.teal,label:'非协议(92.65%)'},{color:C.purple,label:'协议(7.35%)'}],['是否协议机票：非协议||机票出票张数：227张(92.65%)||同比：+9.1%','是否协议机票：协议||机票出票张数：18张(7.35%)||同比：-2.0%'])
        +     '</div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">机票出票趋势（国内 / 国际）</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:74,color:C.blue},{v:8,color:C.orange}]},{label:'2026-2',segs:[{v:31,color:C.blue},{v:1,color:C.orange}]},
              {label:'2026-3',segs:[{v:51,color:C.blue},{v:4,color:C.orange}]},{label:'2026-4',segs:[{v:37,color:C.blue},{v:3,color:C.orange}]},
              {label:'2026-5',segs:[{v:25,color:C.blue},{v:5,color:C.orange}]},{label:'2026-6',segs:[{v:6,color:C.blue},{v:0,color:C.orange}]}
            ],100,'张',[{color:C.orange,label:'国际'},{color:C.blue,label:'国内'}])
        +   '<div class="sec-title mt">机票协议出票趋势（非协议 / 协议）</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:8,color:C.purple},{v:74,color:C.teal}]},{label:'2026-2',segs:[{v:3,color:C.purple},{v:29,color:C.teal}]},
              {label:'2026-3',segs:[{v:4,color:C.purple},{v:51,color:C.teal}]},{label:'2026-4',segs:[{v:2,color:C.purple},{v:38,color:C.teal}]},
              {label:'2026-5',segs:[{v:1,color:C.purple},{v:29,color:C.teal}]},{label:'2026-6',segs:[{v:0,color:C.purple},{v:6,color:C.teal}]}
            ],100,'张',[{color:C.teal,label:'非协议'},{color:C.purple,label:'协议'}])
        + '</div>'
        + '</div>'
        + '<div class="sec-title mt">机票消费明细</div>'
        + dimTable(['整体','国内 / 国际','协议 / 非协议'],[
            tableW(thead(['统计时间','机票消费金额','同比 <span class="new-tag">需求18</span>','成交净价(含改签差价)','民航发展基金','燃油费','业务服务费','国际税费','改签手续费'])
              + trow(['2026-1','199,115.00'].concat(yoyTriple(MD_AIR,0,2)).concat(['161,726.00','3,250.00','1,370.00','0.00','5,702.00','0.00']))
              + trow(['2026-2','30,467.00'].concat(yoyTriple(MD_AIR,1,2)).concat(['25,842.00','1,050.00','410.00','0.00','32.00','195.00']))
              + trow(['2026-3','160,830.00'].concat(yoyTriple(MD_AIR,2,2)).concat(['142,124.00','2,300.00','900.00','40.00','13,217.00','205.00']))
              + trow(['2026-4','106,279.00'].concat(yoyTriple(MD_AIR,3,2)).concat(['92,501.00','1,750.00','3,640.00','0.00','7,171.00','682.00']))
              + trow(['2026-5','105,460.00'].concat(yoyTriple(MD_AIR,4,2)).concat(['88,951.00','800.00','2,420.00','40.00','10,155.00','0.00']))
              + trow(['2026-6','6,650.00'].concat(yoyTriple(MD_AIR,5,2)).concat(['5,500.00','300.00','850.00','0.00','0.00','0.00']))
              + trow(['总计','608,801.00'].concat(yoyTripleTotal(MD_AIR,2)).concat(['516,644.00','9,450.00','9,590.00','280.00','36,277.00','1,082.00']),true)),
            '<div class="sec-title">国内机票消费明细</div>'
              + tableW(thead(['统计时间','机票消费金额','同比 <span class="new-tag">需求18</span>','成交净价(含改签差价)','民航发展基金','燃油费','业务服务费','国际税费','改签手续费'])
                + trow(['2026-1',nf(MD_AIR_DOM[0],2)].concat(yoyTriple(MD_AIR_DOM,0)).concat(['134,216.00','3,250.00','1,370.00','0.00','0.00','0.00']))
                + trow(['2026-2',nf(MD_AIR_DOM[1],2)].concat(yoyTriple(MD_AIR_DOM,1)).concat(['26,592.00','1,050.00','410.00','0.00','0.00','195.00']))
                + trow(['2026-3',nf(MD_AIR_DOM[2],2)].concat(yoyTriple(MD_AIR_DOM,2)).concat(['52,344.00','2,300.00','900.00','0.00','0.00','205.00']))
                + trow(['2026-4',nf(MD_AIR_DOM[3],2)].concat(yoyTriple(MD_AIR_DOM,3)).concat(['61,392.00','1,750.00','3,640.00','0.00','0.00','682.00']))
                + trow(['2026-5',nf(MD_AIR_DOM[4],2)].concat(yoyTriple(MD_AIR_DOM,4)).concat(['24,107.00','800.00','2,420.00','0.00','0.00','0.00']))
                + trow(['2026-6',nf(MD_AIR_DOM[5],2)].concat(yoyTriple(MD_AIR_DOM,5)).concat(['12,800.00','650.00','1,900.00','0.00','0.00','0.00']))
                + trow(['总计','341,698.00'].concat(yoyTripleTotal(MD_AIR_DOM)).concat(['311,451.00','9,800.00','10,640.00','0.00','0.00','1,082.00']),true))
              + '<div class="sec-title mt">国际机票消费明细</div>'
              + tableW(thead(['统计时间','机票消费金额','同比 <span class="new-tag">需求18</span>','成交净价(含改签差价)','民航发展基金','燃油费','业务服务费','国际税费','改签手续费'])
                + trow(['2026-1',nf(MD_AIR_INT[0],2)].concat(yoyTriple(MD_AIR_INT,0)).concat(['27,510.00','0.00','0.00','0.00','5,702.00','0.00']))
                + trow(['2026-2',nf(MD_AIR_INT[1],2)].concat(yoyTriple(MD_AIR_INT,1)).concat(['-750.00','0.00','0.00','0.00','32.00','0.00']))
                + trow(['2026-3',nf(MD_AIR_INT[2],2)].concat(yoyTriple(MD_AIR_INT,2)).concat(['89,780.00','0.00','0.00','0.00','13,217.00','0.00']))
                + trow(['2026-4',nf(MD_AIR_INT[3],2)].concat(yoyTriple(MD_AIR_INT,3)).concat(['31,109.00','0.00','0.00','0.00','7,171.00','0.00']))
                + trow(['2026-5',nf(MD_AIR_INT[4],2)].concat(yoyTriple(MD_AIR_INT,4)).concat(['64,844.00','0.00','0.00','0.00','10,155.00','0.00']))
                + trow(['总计','275,843.00'].concat(yoyTripleTotal(MD_AIR_INT)).concat(['212,493.00','0.00','0.00','0.00','36,277.00','0.00']),true)),
            '<div class="sec-title">协议机票消费明细</div>'
              + tableW(thead(['统计时间','机票消费金额','同比 <span class="new-tag">需求18</span>','成交净价(含改签差价)','民航发展基金','燃油费','业务服务费','国际税费','改签手续费'])
                + trow(['2026-1',nf(MD_AIR_XY[0],2)].concat(yoyTriple(MD_AIR_XY,0)).concat(['7,510.00','250.00','100.00','0.00','0.00','0.00']))
                + trow(['2026-2',nf(MD_AIR_XY[1],2)].concat(yoyTriple(MD_AIR_XY,1)).concat(['4,000.00','100.00','40.00','0.00','0.00','0.00']))
                + trow(['2026-3',nf(MD_AIR_XY[2],2)].concat(yoyTriple(MD_AIR_XY,2)).concat(['3,250.00','200.00','80.00','0.00','0.00','0.00']))
                + trow(['2026-4',nf(MD_AIR_XY[3],2)].concat(yoyTriple(MD_AIR_XY,3)).concat(['4,750.00','100.00','240.00','0.00','0.00','0.00']))
                + trow(['2026-5',nf(MD_AIR_XY[4],2)].concat(yoyTriple(MD_AIR_XY,4)).concat(['0.00','0.00','0.00','0.00','0.00','0.00']))
                + trow(['总计','22,216.00'].concat(yoyTripleTotal(MD_AIR_XY)).concat(['19,510.00','650.00','460.00','0.00','0.00','0.00']),true))
              + '<div class="sec-title mt">非协议机票消费明细</div>'
              + tableW(thead(['统计时间','机票消费金额','同比 <span class="new-tag">需求18</span>','成交净价(含改签差价)','民航发展基金','燃油费','业务服务费','国际税费','改签手续费'])
                + trow(['2026-1',nf(MD_AIR_FXY[0],2)].concat(yoyTriple(MD_AIR_FXY,0)).concat(['154,216.00','3,000.00','1,270.00','0.00','5,702.00','0.00']))
                + trow(['2026-2',nf(MD_AIR_FXY[1],2)].concat(yoyTriple(MD_AIR_FXY,1)).concat(['21,842.00','950.00','370.00','0.00','32.00','195.00']))
                + trow(['2026-3',nf(MD_AIR_FXY[2],2)].concat(yoyTriple(MD_AIR_FXY,2)).concat(['138,874.00','2,100.00','820.00','0.00','13,217.00','205.00']))
                + trow(['2026-4',nf(MD_AIR_FXY[3],2)].concat(yoyTriple(MD_AIR_FXY,3)).concat(['87,751.00','1,650.00','3,400.00','0.00','7,171.00','682.00']))
                + trow(['2026-5',nf(MD_AIR_FXY[4],2)].concat(yoyTriple(MD_AIR_FXY,4)).concat(['88,951.00','800.00','2,420.00','0.00','10,155.00','0.00']))
                + trow(['2026-6',nf(MD_AIR_FXY[5],2)].concat(yoyTriple(MD_AIR_FXY,5)).concat(['12,800.00','650.00','1,900.00','0.00','0.00','0.00']))
                + trow(['总计','595,325.00'].concat(yoyTripleTotal(MD_AIR_FXY)).concat(['504,434.00','9,150.00','10,180.00','0.00','36,277.00','1,082.00']),true))
          ])
        + compareSection('air')
        + reqbox([ R1(),
            {t:'<b>需求18</b>：同比<b>已并入消费明细表</b>（环比已下线，不再单独成表）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'<b>需求19</b>：本业务线 企业/核算主体/部门对比（金额/金额占比/条数/条数占比）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'区分<b>福利机票与代理机票</b>数据维度', id:'2502018', tag:'新增'},
            {t:'<b>国际机票</b>差旅报告独立拆分展示', id:'2502804', tag:'新增'},
            {t:'消费明细增加<b>超级经济舱标记</b>和机票折扣信息', id:'2502907', tag:'优化'}
          ]);
    }},

    'ov-hotel': { crumb:'总览报告_酒店', render:function(){
      return '<div class="ov-toggle" data-view="amt">'
        + '<div class="pg-tabs"><span class="active" data-view="amt">消费金额</span><span data-view="cnt">入住间夜</span></div>'
        /* ===== 消费金额 ===== */
        + '<div class="ov-pane" data-view="amt">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">酒店消费金额'+itip({def:'酒店业务线消费金额（含房费、业务服务费，已扣退订）',formula:'酒店房价 + 业务服务费 − 取消手续费 − 退订金额',src:'酒店消费明细基线表',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">1,980,000.00元</div>'
        +       statList([{k:'月均消费金额',v:'330,000元'},{k:'差旅服务费',v:'620元'},{k:'国内消费金额',v:'1,560,000元'},{k:'国际消费金额',v:'420,000元'},{k:'协议消费金额',v:'570,000元'},{k:'非协议消费金额',v:'1,410,000元'},{k:'退订消费金额',v:'-330,000元'},{k:'间夜均价(贵司)',v:'450元'},{k:'消费金额同比',v:yoy(12.8)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">酒店消费金额分布</div><div class="dist-donuts">'
        +       donut([{pct:79.05,color:C.blue},{pct:20.95,color:C.orange}],[{color:C.blue,label:'国内(79.05%)'},{color:C.orange,label:'国际(20.95%)'}],['国内_国际酒店：国内||消费金额：1,560,000.00元(79.05%)||同比：+14.2%','国内_国际酒店：国际||消费金额：420,000.00元(20.95%)||同比：+6.5%'])
        +       donut([{pct:71.07,color:C.teal},{pct:28.93,color:C.purple}],[{color:C.teal,label:'非协议(71.07%)'},{color:C.purple,label:'协议(28.93%)'}],['是否协议酒店产品：非协议||消费金额：1,410,000.00元(71.07%)||同比：+10.6%','是否协议酒店产品：协议||消费金额：570,000.00元(28.93%)||同比：+22.4%'])
        +     '</div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">酒店消费趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:22,color:C.blue},{v:6,color:C.orange}]},{label:'2026-2',segs:[{v:18,color:C.blue},{v:4,color:C.orange}]},
              {label:'2026-3',segs:[{v:25,color:C.blue},{v:6,color:C.orange}]},{label:'2026-4',segs:[{v:21,color:C.blue},{v:5,color:C.orange}]},
              {label:'2026-5',segs:[{v:20,color:C.blue},{v:4,color:C.orange}]},{label:'2026-6',segs:[{v:10,color:C.blue},{v:2,color:C.orange}]}
            ],35,'万元',[{color:C.orange,label:'国际'},{color:C.blue,label:'国内'}])
        + '</div>'
        /* ===== 入住间夜 ===== */
        + '<div class="ov-pane" data-view="cnt" style="display:none">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">酒店入住间夜'+itip({def:'报告周期内实际入住间夜数（房间数×入住晚数）',formula:'Σ 预订间夜 − 退订间夜',src:'酒店订单明细',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">627</div>'
        +       statList([{k:'月均入住',v:'105间夜'},{k:'订单量',v:'405'},{k:'国内预订',v:'688间夜'},{k:'国际预订',v:'57间夜'},{k:'协议预订',v:'177间夜'},{k:'非协议预订',v:'568间夜'},{k:'退订间夜',v:'118间夜'},{k:'预订间夜',v:'745间夜'},{k:'入住间夜同比',v:yoy(9.2)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">酒店入住间夜分布</div><div class="dist-donuts">'
        +       donut([{pct:93.46,color:C.blue},{pct:6.54,color:C.orange}],[{color:C.blue,label:'国内(93.46%)'},{color:C.orange,label:'国际(6.54%)'}],['国内_国际酒店：国内||入住间夜_实际：586(93.46%)||同比：+9.6%','国内_国际酒店：国际||入住间夜_实际：41(6.54%)||同比：+3.2%'])
        +       donut([{pct:74.48,color:C.teal},{pct:25.52,color:C.purple}],[{color:C.teal,label:'非协议(74.48%)'},{color:C.purple,label:'协议(25.52%)'}],['是否协议酒店产品：非协议||入住间夜_实际：467(74.48%)||同比：+7.4%','是否协议酒店产品：协议||入住间夜_实际：160(25.52%)||同比：+18.5%'])
        +     '</div></div>'
        +   '</div>'
        +   '<div class="sec-title mt">酒店入住间夜趋势（国内 / 国际）</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:182,color:C.blue},{v:15,color:C.orange}]},{label:'2026-2',segs:[{v:74,color:C.blue},{v:0,color:C.orange}]},
              {label:'2026-3',segs:[{v:129,color:C.blue},{v:7,color:C.orange}]},{label:'2026-4',segs:[{v:96,color:C.blue},{v:22,color:C.orange}]},
              {label:'2026-5',segs:[{v:75,color:C.blue},{v:0,color:C.orange}]},{label:'2026-6',segs:[{v:30,color:C.blue},{v:0,color:C.orange}]}
            ],240,'间夜',[{color:C.orange,label:'国际'},{color:C.blue,label:'国内'}])
        +   '<div class="sec-title mt">酒店协议入住间夜趋势（非协议 / 协议）</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:52,color:C.purple},{v:145,color:C.teal}]},{label:'2026-2',segs:[{v:19,color:C.purple},{v:55,color:C.teal}]},
              {label:'2026-3',segs:[{v:49,color:C.purple},{v:87,color:C.teal}]},{label:'2026-4',segs:[{v:16,color:C.purple},{v:102,color:C.teal}]},
              {label:'2026-5',segs:[{v:16,color:C.purple},{v:56,color:C.teal}]},{label:'2026-6',segs:[{v:8,color:C.purple},{v:22,color:C.teal}]}
            ],240,'间夜',[{color:C.teal,label:'非协议'},{color:C.purple,label:'协议'}])
        + '</div>'
        + '</div>'
        + '<div class="sec-title mt">酒店消费明细</div>'
        + dimTable(['整体','国内 / 国际','协议 / 非协议'],[
            tableW(thead(['统计时间','酒店消费金额','同比 <span class="new-tag">需求18</span>','酒店房价','业务服务费','取消手续费','税损服务费','优惠券'])
              + trow(['2026-1','115,234.70'].concat(yoyTriple(MD_HOTEL,0,2)).concat(['115,143.70','91.00','0.00','0.00','22.00']))
              + trow(['2026-2','45,899.40'].concat(yoyTriple(MD_HOTEL,1,2)).concat(['45,798.40','101.00','106.90','0.00','0.00']))
              + trow(['2026-3','64,445.97'].concat(yoyTriple(MD_HOTEL,2,2)).concat(['64,421.97','24.00','0.00','0.00','193.78']))
              + trow(['2026-4','81,470.25'].concat(yoyTriple(MD_HOTEL,3,2)).concat(['81,407.25','63.00','0.00','0.00','99.75']))
              + trow(['2026-5','27,867.00'].concat(yoyTriple(MD_HOTEL,4,2)).concat(['27,835.00','32.00','50.00','0.00','18.00']))
              + trow(['2026-6','9,726.13'].concat(yoyTriple(MD_HOTEL,5,2)).concat(['9,728.13','-2.00','0.00','0.00','20.87']))
              + trow(['总计','344,643.45'].concat(yoyTripleTotal(MD_HOTEL,2)).concat(['344,334.45','309.00','156.90','0.00','354.40']),true)),
            '<div class="sec-title">国内酒店消费明细</div>'
              + tableW(thead(['统计时间','酒店消费金额','同比 <span class="new-tag">需求18</span>','酒店房价','业务服务费','取消手续费','优惠券'])
                + trow(['2026-1',nf(MD_HT_DOM[0],2)].concat(yoyTriple(MD_HT_DOM,0)).concat([nf(MD_HT_DOM[0],2),'72.00','0.00','17.00']))
                + trow(['2026-2',nf(MD_HT_DOM[1],2)].concat(yoyTriple(MD_HT_DOM,1)).concat([nf(MD_HT_DOM[1],2),'80.00','85.00','0.00']))
                + trow(['2026-3',nf(MD_HT_DOM[2],2)].concat(yoyTriple(MD_HT_DOM,2)).concat([nf(MD_HT_DOM[2],2),'19.00','0.00','154.00']))
                + trow(['2026-4',nf(MD_HT_DOM[3],2)].concat(yoyTriple(MD_HT_DOM,3)).concat([nf(MD_HT_DOM[3],2),'50.00','0.00','79.00']))
                + trow(['2026-5',nf(MD_HT_DOM[4],2)].concat(yoyTriple(MD_HT_DOM,4)).concat([nf(MD_HT_DOM[4],2),'25.00','40.00','14.00']))
                + trow(['2026-6',nf(MD_HT_DOM[5],2)].concat(yoyTriple(MD_HT_DOM,5)).concat([nf(MD_HT_DOM[5],2),'-2.00','0.00','17.00']))
                + trow(['总计','273,862.00'].concat(yoyTripleTotal(MD_HT_DOM)).concat(['273,862.00','244.00','125.00','281.00']),true))
              + '<div class="sec-title mt">国际酒店消费明细</div>'
              + tableW(thead(['统计时间','酒店消费金额','同比 <span class="new-tag">需求18</span>','酒店房价','业务服务费','取消手续费','优惠券'])
                + trow(['2026-1',nf(MD_HT_INT[0],2)].concat(yoyTriple(MD_HT_INT,0)).concat([nf(MD_HT_INT[0],2),'19.00','0.00','5.00']))
                + trow(['2026-2',nf(MD_HT_INT[1],2)].concat(yoyTriple(MD_HT_INT,1)).concat([nf(MD_HT_INT[1],2),'21.00','22.00','0.00']))
                + trow(['2026-3',nf(MD_HT_INT[2],2)].concat(yoyTriple(MD_HT_INT,2)).concat([nf(MD_HT_INT[2],2),'5.00','0.00','40.00']))
                + trow(['2026-4',nf(MD_HT_INT[3],2)].concat(yoyTriple(MD_HT_INT,3)).concat([nf(MD_HT_INT[3],2),'13.00','0.00','21.00']))
                + trow(['2026-5',nf(MD_HT_INT[4],2)].concat(yoyTriple(MD_HT_INT,4)).concat([nf(MD_HT_INT[4],2),'7.00','10.00','4.00']))
                + trow(['2026-6',nf(MD_HT_INT[5],2)].concat(yoyTriple(MD_HT_INT,5)).concat([nf(MD_HT_INT[5],2),'0.00','0.00','5.00']))
                + trow(['总计','70,781.00'].concat(yoyTripleTotal(MD_HT_INT)).concat(['70,781.00','65.00','32.00','75.00']),true)),
            '<div class="sec-title">协议酒店消费明细</div>'
              + tableW(thead(['统计时间','酒店消费金额','同比 <span class="new-tag">需求18</span>','酒店房价','业务服务费','取消手续费','优惠券'])
                + trow(['2026-1',nf(MD_HT_XY[0],2)].concat(yoyTriple(MD_HT_XY,0)).concat([nf(MD_HT_XY[0],2),'19.00','0.00','5.00']))
                + trow(['2026-2',nf(MD_HT_XY[1],2)].concat(yoyTriple(MD_HT_XY,1)).concat([nf(MD_HT_XY[1],2),'21.00','22.00','0.00']))
                + trow(['2026-3',nf(MD_HT_XY[2],2)].concat(yoyTriple(MD_HT_XY,2)).concat([nf(MD_HT_XY[2],2),'5.00','0.00','40.00']))
                + trow(['2026-4',nf(MD_HT_XY[3],2)].concat(yoyTriple(MD_HT_XY,3)).concat([nf(MD_HT_XY[3],2),'13.00','0.00','21.00']))
                + trow(['2026-5',nf(MD_HT_XY[4],2)].concat(yoyTriple(MD_HT_XY,4)).concat([nf(MD_HT_XY[4],2),'7.00','10.00','4.00']))
                + trow(['2026-6',nf(MD_HT_XY[5],2)].concat(yoyTriple(MD_HT_XY,5)).concat([nf(MD_HT_XY[5],2),'0.00','0.00','5.00']))
                + trow(['总计','70,858.00'].concat(yoyTripleTotal(MD_HT_XY)).concat(['70,858.00','65.00','32.00','75.00']),true))
              + '<div class="sec-title mt">非协议酒店消费明细</div>'
              + tableW(thead(['统计时间','酒店消费金额','同比 <span class="new-tag">需求18</span>','酒店房价','业务服务费','取消手续费','优惠券'])
                + trow(['2026-1',nf(MD_HT_FXY[0],2)].concat(yoyTriple(MD_HT_FXY,0)).concat([nf(MD_HT_FXY[0],2),'72.00','0.00','17.00']))
                + trow(['2026-2',nf(MD_HT_FXY[1],2)].concat(yoyTriple(MD_HT_FXY,1)).concat([nf(MD_HT_FXY[1],2),'80.00','85.00','0.00']))
                + trow(['2026-3',nf(MD_HT_FXY[2],2)].concat(yoyTriple(MD_HT_FXY,2)).concat([nf(MD_HT_FXY[2],2),'19.00','0.00','154.00']))
                + trow(['2026-4',nf(MD_HT_FXY[3],2)].concat(yoyTriple(MD_HT_FXY,3)).concat([nf(MD_HT_FXY[3],2),'50.00','0.00','79.00']))
                + trow(['2026-5',nf(MD_HT_FXY[4],2)].concat(yoyTriple(MD_HT_FXY,4)).concat([nf(MD_HT_FXY[4],2),'25.00','40.00','14.00']))
                + trow(['2026-6',nf(MD_HT_FXY[5],2)].concat(yoyTriple(MD_HT_FXY,5)).concat([nf(MD_HT_FXY[5],2),'-2.00','0.00','17.00']))
                + trow(['总计','273,785.00'].concat(yoyTripleTotal(MD_HT_FXY)).concat(['273,785.00','244.00','125.00','281.00']),true))
          ])
        + compareSection('hotel')
        + reqbox([ R1(),
            {t:'<b>需求18</b>：同比<b>已并入消费明细表</b>（环比已下线，不再单独成表）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'<b>需求19</b>：本业务线 企业/核算主体/部门对比（金额/金额占比/条数/条数占比）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'增加<b>酒店集团同比分析</b>及 OTA 与协议酒店<b>对比维度</b>', id:'2600698', tag:'新增'},
            {t:'增加<b>协议酒店可订率</b>指标', id:'2501745', tag:'新增'},
            {t:'优化酒店<b>连续预定天数</b>统计（跨订单合并计算）', id:'2500135', tag:'优化'},
            {t:'修复酒店集团归类逻辑（欢朋划归锦江集团）', id:'2502513', tag:'优化'}
          ]);
    }},

    'ov-train': { crumb:'总览报告_火车票', render:function(){
      return '<div class="ov-toggle" data-view="amt">'
        + '<div class="pg-tabs"><span class="active" data-view="amt">消费金额</span><span data-view="cnt">出票张数</span></div>'
        /* ===== 消费金额 ===== */
        + '<div class="ov-pane" data-view="amt">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">火车消费金额'+itip({def:'火车业务线消费金额（含改签费，已扣退票/退订）',formula:'票面价 + 改签费 − 退订费',src:'火车消费明细基线表',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">74,531.00元</div>'
        +       statList([{k:'月均消费金额',v:'12,421.83元'},{k:'差旅服务费',v:'0元'},{k:'改签消费金额',v:'13,464.50元'},{k:'退票消费金额',v:'-15,138.51元'},{k:'消费金额同比',v:yoy(-5.4)}])
        +     '</div>'
        +     '<div class="dist-block dist-r"><div class="sec-title">火车票坐席分布（金额）</div>'
        +       donut([{pct:79.63,color:C.orange},{pct:4.21,color:C.blue},{pct:16.16,color:C.teal}],[{color:C.blue,label:'一等座(4.21%)'},{color:C.orange,label:'二等座(79.63%)'},{color:C.teal,label:'其他(16.16%)'}])
        +     '</div>'
        +   '</div>'
        +   '<div class="sec-title mt">火车消费金额趋势</div>'
        +   trendBars([1.36,0.56,1.82,1.89,1.11,0.41],2.5,'万元')
        + '</div>'
        /* ===== 出票张数 ===== */
        + '<div class="ov-pane" data-view="cnt" style="display:none">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">火车出票张数'+itip({def:'报告周期内火车出票总张数',formula:'Σ 出票张数',src:'火车出票明细',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">355</div>'
        +       statList([{k:'票均消费金额(出票)',v:'214.67元'},{k:'订单量',v:'344'},{k:'火车改签张数',v:'54张'},{k:'火车退票张数',v:'17张'},{k:'出票张数同比',v:yoy(-3.8)}])
        +     '</div>'
        +     '<div class="dist-block dist-r"><div class="sec-title">火车票坐席分布（出票张数）</div>'
        +       donut([{pct:90.70,color:C.orange},{pct:2.82,color:C.blue},{pct:6.48,color:C.teal}],[{color:C.blue,label:'一等座(2.82%)'},{color:C.orange,label:'二等座(90.70%)'},{color:C.teal,label:'其他(6.48%)'}])
        +     '</div>'
        +   '</div>'
        +   '<div class="sec-title mt">火车出票趋势</div>'
        +   vbar([{label:'2026-1',val:73},{label:'2026-2',val:25},{label:'2026-3',val:79},{label:'2026-4',val:74},{label:'2026-5',val:67},{label:'2026-6',val:37}],{color:C.orange,unit:'张',barw:40})
        + '</div>'
        + '</div>'
        + '<div class="sec-title mt">火车消费明细</div>'
        + tableW(thead(['统计时间','火车票消费金额','同比 <span class="new-tag">需求18</span>','火车票票面价','业务服务费','改签费','退订费','垫资服务费'])
              + trow(['2026-1','13,644.50'].concat(yoyTriple(MD_TRAIN,0,2)).concat(['13,440.00','0.00','0.00','111.00','0.00']))
              + trow(['2026-2','5,568.00'].concat(yoyTriple(MD_TRAIN,1,2)).concat(['5,566.00','0.00','2.00','0.00','0.00']))
              + trow(['2026-3','18,214.50'].concat(yoyTriple(MD_TRAIN,2,2)).concat(['18,073.50','0.00','5.00','35.00','0.00']))
              + trow(['2026-4','18,908.00'].concat(yoyTriple(MD_TRAIN,3,2)).concat(['18,910.00','0.00','8.00','52.00','0.00']))
              + trow(['2026-5','11,101.00'].concat(yoyTriple(MD_TRAIN,4,2)).concat(['11,068.00','0.00','6.00','25.00','0.00']))
              + trow(['2026-6','7,095.00'].concat(yoyTriple(MD_TRAIN,5,2)).concat(['7,088.50','0.00','6.50','0.00','0.00']))
              + trow(['总计','74,531.00'].concat(yoyTripleTotal(MD_TRAIN,2)).concat(['74,146.00','0.00','27.50','223.00','0.00']),true))
        + compareSection('train')
        + reqbox([ R1(),
            {t:'<b>需求18</b>：同比<b>已并入消费明细表</b>（环比已下线，不再单独成表）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'<b>需求19</b>：本业务线 企业/核算主体/部门对比（金额/金额占比/条数/条数占比）— ✅本页已落地', id:'—', tag:'新增'}
          ]);
    }},

    'ov-car': { crumb:'总览报告_用车', render:function(){
      return '<div class="ov-toggle" data-view="amt">'
        + '<div class="pg-tabs"><span class="active" data-view="amt">消费金额</span><span data-view="cnt">订单量</span></div>'
        /* ===== 消费金额 ===== */
        + '<div class="ov-pane" data-view="amt">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">用车消费金额'+itip({def:'用车业务线消费金额（净车费+附加费）',formula:'Σ 净车费 + 附加费 − 优惠券',src:'用车消费明细基线表',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">792,615.07元</div>'
        +       statList([{k:'用车次数',v:'21,492'},{k:'差旅服务费',v:'0元'},{k:'行程均价(贵司)',v:'36.88元'},{k:'行程均价(商旅)',v:'54.72元'},{k:'消费金额同比',v:yoy(18.7)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">用车车型消费分布</div>'
        +       donut([{pct:47.52,color:C.blue},{pct:46.5,color:C.orange},{pct:5.9,color:C.purple},{pct:0.08,color:C.teal}],[{color:C.blue,label:'经济型(47.52%)'},{color:C.orange,label:'舒适型(46.5%)'},{color:C.purple,label:'商务型(5.9%)'},{color:C.teal,label:'豪华型(0.08%)'}])
        +     '</div>'
        +   '</div>'
        +   '<div class="sec-title mt">用车类型消费趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:17.3,color:C.blue},{v:0.29,color:C.orange}]},{label:'2026-2',segs:[{v:11.85,color:C.blue},{v:0.47,color:C.orange}]},
              {label:'2026-3',segs:[{v:17.66,color:C.blue},{v:0.33,color:C.orange}]},{label:'2026-4',segs:[{v:13.87,color:C.blue},{v:0.33,color:C.orange}]},
              {label:'2026-5',segs:[{v:8.32,color:C.blue},{v:0.14,color:C.orange}]},{label:'2026-6',segs:[{v:5.0,color:C.blue},{v:0.1,color:C.orange}]}
            ],20,'万元',[{color:C.blue,label:'实时用车'},{color:C.orange,label:'预约用车'}])
        +   '<div class="sec-title mt">用车同城异地消费趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:17.34,color:C.purple},{v:0.31,color:C.teal}]},{label:'2026-2',segs:[{v:12.13,color:C.purple},{v:0.21,color:C.teal}]},
              {label:'2026-3',segs:[{v:17.91,color:C.purple},{v:0.12,color:C.teal}]},{label:'2026-4',segs:[{v:14.08,color:C.purple},{v:0.23,color:C.teal}]},
              {label:'2026-5',segs:[{v:8.52,color:C.purple},{v:0.01,color:C.teal}]},{label:'2026-6',segs:[{v:4.5,color:C.purple},{v:0.05,color:C.teal}]}
            ],20,'万元',[{color:C.purple,label:'同城'},{color:C.teal,label:'跨城'}])
        + '</div>'
        /* ===== 订单量 ===== */
        + '<div class="ov-pane" data-view="cnt" style="display:none">'
        +   '<div class="ov-top">'
        +     '<div class="metric-block"><div class="sec-title">用车订单量'+itip({def:'报告周期内用车订单总数（实时+预约+接送）',formula:'Σ 用车订单数',src:'用车订单明细',scope:'当前筛选与数据权限范围内'})+'</div><div class="big-amount">21,492</div>'
        +       statList([{k:'月均订单量',v:'3,582'},{k:'实时用车',v:'20,920次'},{k:'预约用车',v:'468次'},{k:'接送机/站',v:'104次'},{k:'订单量同比',v:yoy(16.2)}])
        +     '</div>'
        +     '<div class="dist-block"><div class="sec-title">用车车型订单分布</div>'
        +       donut([{pct:47.52,color:C.blue},{pct:46.25,color:C.orange},{pct:5.9,color:C.purple},{pct:0.34,color:C.teal}],[{color:C.blue,label:'经济型(47.52%)'},{color:C.orange,label:'舒适型(46.25%)'},{color:C.purple,label:'商务型(5.9%)'},{color:C.teal,label:'豪华型(0.34%)'}])
        +     '</div>'
        +   '</div>'
        +   '<div class="sec-title mt">用车订单量趋势</div>'
        +   vbar([{label:'2026-1',val:4600,disp:'4,600'},{label:'2026-2',val:3700,disp:'3,700'},{label:'2026-3',val:4900,disp:'4,900'},{label:'2026-4',val:4100,disp:'4,100'},{label:'2026-5',val:2700,disp:'2,700'},{label:'2026-6',val:1492,disp:'1,492'}],{color:C.blue,barw:44})
        +   '<div class="sec-title mt">用车类型订单趋势</div>'
        +   stackBars([
              {label:'2026-1',segs:[{v:4470,color:C.blue},{v:130,color:C.orange}]},{label:'2026-2',segs:[{v:3590,color:C.blue},{v:110,color:C.orange}]},
              {label:'2026-3',segs:[{v:4760,color:C.blue},{v:140,color:C.orange}]},{label:'2026-4',segs:[{v:3980,color:C.blue},{v:120,color:C.orange}]},
              {label:'2026-5',segs:[{v:2620,color:C.blue},{v:80,color:C.orange}]},{label:'2026-6',segs:[{v:1450,color:C.blue},{v:42,color:C.orange}]}
            ],5000,'',[{color:C.blue,label:'实时用车'},{color:C.orange,label:'预约用车'}])
        + '</div>'
        + '</div>'
        + '<div class="sec-title mt">用车消费明细</div>'
        + dimTable(['整体','实时/预约用车','接送机/接送站','包车_日租/其他'],[
            tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','税损服务费','优惠券'])
              + trow(['2026-1','176,477.49'].concat(yoyTriple(MD_CAR,0,2)).concat(['173,583.01','1,032.53','0.00','149.60']))
              + trow(['2026-2','123,400.54'].concat(yoyTriple(MD_CAR,1,2)).concat(['120,446.76','559.98','0.00','288.85']))
              + trow(['2026-3','180,381.48'].concat(yoyTriple(MD_CAR,2,2)).concat(['179,484.75','1,511.15','0.00','609.90']))
              + trow(['2026-4','143,147.36'].concat(yoyTriple(MD_CAR,3,2)).concat(['142,665.49','932.55','0.00','318.66']))
              + trow(['2026-5','85,312.10'].concat(yoyTriple(MD_CAR,4,2)).concat(['85,048.13','397.24','0.00','131.27']))
              + trow(['总计','708,718.97'].concat(yoyTripleTotal(MD_CAR,2)).concat(['701,228.14','4,433.45','0.00','1,498.28']),true)),
            '<div class="sec-title">实时用车消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['2026-1',nf(MD_CAR_RT[0],2)].concat(yoyTriple(MD_CAR_RT,0)).concat(['170,950.69','862.53','0.00','0.00','149.60']))
                + trow(['2026-2',nf(MD_CAR_RT[1],2)].concat(yoyTriple(MD_CAR_RT,1)).concat(['116,582.78','473.98','0.00','0.00','288.85']))
                + trow(['2026-3',nf(MD_CAR_RT[2],2)].concat(yoyTriple(MD_CAR_RT,2)).concat(['175,789.62','1,365.15','0.00','0.00','585.49']))
                + trow(['2026-4',nf(MD_CAR_RT[3],2)].concat(yoyTriple(MD_CAR_RT,3)).concat(['138,287.92','855.55','0.00','0.00','312.99']))
                + trow(['2026-5',nf(MD_CAR_RT[4],2)].concat(yoyTriple(MD_CAR_RT,4)).concat(['115,886.22','726.78','0.00','0.00','206.89']))
                + trow(['2026-6',nf(MD_CAR_RT[5],2)].concat(yoyTriple(MD_CAR_RT,5)).concat(['56,826.79','381.12','0.00','0.00','97.06']))
                + trow(['总计','780,342.76'].concat(yoyTripleTotal(MD_CAR_RT)).concat(['774,324.02','4,665.11','0.00','0.00','1,640.88']),true))
              + '<div class="sec-title mt">预约用车消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['2026-1',nf(MD_CAR_YY[0],2)].concat(yoyTriple(MD_CAR_YY,0)).concat(['2,019.97','166.00','0.00','0.00','0.00']))
                + trow(['2026-2',nf(MD_CAR_YY[1],2)].concat(yoyTriple(MD_CAR_YY,1)).concat(['3,680.96','86.00','0.00','0.00','0.00']))
                + trow(['2026-3',nf(MD_CAR_YY[2],2)].concat(yoyTriple(MD_CAR_YY,2)).concat(['3,212.10','131.00','0.00','0.00','24.41']))
                + trow(['2026-4',nf(MD_CAR_YY[3],2)].concat(yoyTriple(MD_CAR_YY,3)).concat(['3,215.69','40.00','0.00','0.00','5.67']))
                + trow(['2026-5',nf(MD_CAR_YY[4],2)].concat(yoyTriple(MD_CAR_YY,4)).concat(['2,306.55','57.00','0.00','0.00','5.21']))
                + trow(['2026-6',nf(MD_CAR_YY[5],2)].concat(yoyTriple(MD_CAR_YY,5)).concat(['1,029.51','49.00','0.00','0.00','32.74']))
                + trow(['总计','17,595.75'].concat(yoyTripleTotal(MD_CAR_YY)).concat(['15,464.78','529.00','0.00','0.00','68.03']),true)),
            '<div class="sec-title">接送机用车消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['2026-1',nf(MD_CAR_JSJ[0],2)].concat(yoyTriple(MD_CAR_JSJ,0)).concat(['612.35','4.00','0.00','0.00','0.00']))
                + trow(['2026-2',nf(MD_CAR_JSJ[1],2)].concat(yoyTriple(MD_CAR_JSJ,1)).concat(['183.02','0.00','0.00','0.00','0.00']))
                + trow(['2026-3',nf(MD_CAR_JSJ[2],2)].concat(yoyTriple(MD_CAR_JSJ,2)).concat(['450.48','15.00','0.00','0.00','0.00']))
                + trow(['2026-4',nf(MD_CAR_JSJ[3],2)].concat(yoyTriple(MD_CAR_JSJ,3)).concat(['871.02','37.00','0.00','0.00','0.00']))
                + trow(['2026-5',nf(MD_CAR_JSJ[4],2)].concat(yoyTriple(MD_CAR_JSJ,4)).concat(['640.46','0.00','0.00','0.00','0.02']))
                + trow(['总计','2,813.31'].concat(yoyTripleTotal(MD_CAR_JSJ)).concat(['2,757.33','56.00','0.00','0.00','0.02']),true))
              + '<div class="sec-title mt">接送站用车消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['2026-3',nf(MD_CAR_JSZ[0],2)].concat(yoyTriple(MD_CAR_JSZ,0)).concat(['32.55','0.00','0.00','0.00','0.00']))
                + trow(['2026-4',nf(MD_CAR_JSZ[1],2)].concat(yoyTriple(MD_CAR_JSZ,1)).concat(['290.86','0.00','0.00','0.00','0.00']))
                + trow(['2026-5',nf(MD_CAR_JSZ[2],2)].concat(yoyTriple(MD_CAR_JSZ,2)).concat(['48.70','0.00','0.00','0.00','0.00']))
                + trow(['总计','372.11'].concat(yoyTripleTotal(MD_CAR_JSZ)).concat(['372.11','0.00','0.00','0.00','0.00']),true)),
            '<div class="sec-title">包车_日租消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['总计','-','-','-','-','-','-','-'],true))
              + '<div class="sec-title mt">其他类型消费明细</div>'
              + tableW(thead(['统计时间','用车消费金额','同比','用车净车费','用车附加费','业务服务费','税损服务费','优惠券'])
                + trow(['总计','-','-','-','-','-','-','-'],true))
          ])
        + compareSection('car')
        + reqbox([ R1(),
            {t:'<b>需求18</b>：同比<b>已并入消费明细表</b>（环比已下线，不再单独成表）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'<b>需求19</b>：本业务线 企业/核算主体/部门对比（金额/金额占比/条数/条数占比）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'新版差旅报告<b>补全旧版功能</b>（用车明细、订单数等）', id:'2503720', tag:'新增'},
            {t:'用车明细<b>导出含成本中心</b>（用车报告订单明细导出）', id:'2501799', tag:'新增'}
          ]);
    }},

    'res-air': { crumb:'资源报告_机票', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return kpis([
          {k:'协议机票成交净价',v:'19,510.00元'},{k:'协议成交净价占比',v:'3.78%'},{k:'商旅协议成交净价占比',v:'47.32%'},
          {k:'协议出票张数',v:'18张'},{k:'协议出票张数占比',v:'7.35%'},{k:'商旅协议出票张数占比',v:'41.96%'}])
        + '<div class="row mt" style="margin-top:20px">'
        +   card('机票消费分布', donut([{pct:96.22,color:C.blue},{pct:3.78,color:C.purple}],[{color:C.blue,label:'非协议(96.22%)'},{color:C.purple,label:'协议(3.78%)'}],['是否协议机票：非协议||成交净价：497,134.00元(96.22%)||同比：+13.5%','是否协议机票：协议||成交净价：19,510.00元(3.78%)||同比：-4.1%']))
        +   card('机票子类型消费分布', donut([{pct:55.09,color:C.blue},{pct:41.13,color:C.purple},{pct:3.78,color:C.orange}],[{color:C.blue,label:'国内非协议(55.09%)'},{color:C.purple,label:'国际非协议(41.13%)'},{color:C.orange,label:'国内协议(3.78%)'}],['机票子类型：国内非协议||成交净价：284,617.00元(55.09%)||同比：+12.8%','机票子类型：国际非协议||成交净价：212,496.00元(41.13%)||同比：+16.4%','机票子类型：国内协议||成交净价：19,510.00元(3.78%)||同比：-4.1%']))
        +   card('航司资源简报', '<div class="scene-note">贵司协议机票消费占比 <b>3.79%</b>，低于商旅平均值，可考虑进行航司签约，提升协议覆盖与折扣议价空间。</div>')
        + '</div>'
        + '<div class="sec-title mt">TOP15 协议航司消费情况</div>'
        + svbar([
            {label:'东航',segs:[{v:16.02,color:C.blue},{v:0.20,color:'#d6e4ff'}]},{label:'国航',segs:[{v:0,color:C.blue},{v:5.77,color:'#d6e4ff'}]},
            {label:'川航',segs:[{v:0.54,color:C.blue},{v:2.43,color:'#d6e4ff'}]},{label:'海航',segs:[{v:0,color:C.blue},{v:0.91,color:'#d6e4ff'}]},
            {label:'南航',segs:[{v:0,color:C.blue},{v:0.7,color:'#d6e4ff'}]},{label:'厦航',segs:[{v:0,color:C.blue},{v:0.28,color:'#d6e4ff'}]},
            {label:'深航',segs:[{v:0.3,color:C.blue},{v:0,color:'#d6e4ff'}]},{label:'福州',segs:[{v:0,color:C.blue},{v:0.15,color:'#d6e4ff'}]},
            {label:'上航',segs:[{v:0,color:C.blue},{v:0.13,color:'#d6e4ff'}]},{label:'西部',segs:[{v:0,color:C.blue},{v:0.05,color:'#d6e4ff'}]},
            {label:'山东',segs:[{v:0,color:C.blue},{v:0.04,color:'#d6e4ff'}]},{label:'长安',segs:[{v:0,color:C.blue},{v:0.04,color:'#d6e4ff'}]}
          ],[{color:C.blue,label:'协议'},{color:'#d6e4ff',label:'非协议'}],{unit:'万'})
        + '<div class="sec-title mt">TOP15 非协议航司消费情况（成交净价）</div>'
        + vbar([{label:'国航',val:15.51},{label:'吉祥',val:3.08},{label:'泰国航空',val:3.08},{label:'国泰航空',val:2.6},{label:'春秋',val:0.31},{label:'易捷航空',val:0.32},{label:'西藏',val:0.3},{label:'英国航空',val:0.2},{label:'新加坡航空',val:-2.94}],{color:'#d6e4ff',unit:'万'})
        + '<div class="sec-title mt">航司消费明细</div>'
        + tableW(thead(['航司名称','是否协议航司','业务线','公布运价','成交净价(元)','协议成交净价占比','出票张数','协议出票张数','平均成交净价'])
            + trow(['国航','非协议航司','国内','234,660.00','155,050.00','0.00%','107','0','1,798.41'])
            + trow(['东航','协议航司','国际','116,490.00','116,490.00','0.00%','10','0','11,985.00'])
            + trow(['国航','协议航司','国际','57,690.00','57,690.00','0.00%','3','0','19,230.00'])
            + trow(['东航','协议航司','国内','69,110.00','45,740.00','4.42%','35','2','1,572.71'])
            + trow(['泰国航空','非协议航司','国际','30,840.00','30,840.00','0.00%','1','0','30,840.00']))
        + moreBar(23,5)
        + '<div class="sec-title mt">各组织机票协议消费情况</div>'
        + tableW(thead(['分析对象','消费金额','成交净价','协议成交净价','协议成交净价占比','机票出票张数','协议出票张数','协议出票张数占比','国内经济舱平均折扣'])
            + trow(['四川示例企业集团有限公司','608,801.00','516,644.00','19,510.00','3.78%','245','18','7.35%','0.45']))
        + reqbox([ R1(),
            {t:'<b>需求5</b>：「国内/国际/全部」筛选拆分，资源报告随之联动 — ✅本页已落地', id:'2502804', tag:'新增'},
            {t:'<b>需求1 调整</b>：资源报告「各组织协议消费」表<b>去掉「核算主体 / 成本中心」切换</b>，仅保留公司维度', id:'2502906', tag:'优化'},
            {t:'区分<b>福利机票与代理机票</b>数据维度', id:'2502018', tag:'新增'} ]);
    }},
    'res-hotel': { crumb:'资源报告_酒店', render:function(){
      return '<div class="ov-top">'
        +   '<div class="metric-block"><div class="sec-title">酒店协议消费</div><div class="big-amount">70,871.59元</div>'
        +     statList([{k:'协议消费金额占比(贵司)',v:'20.87%'},{k:'协议消费金额占比(商旅)',v:'65.17%'}])
        +     '<div style="margin-top:14px">'+tableW(thead(['酒店资源类型','消费金额(元)','消费占比','入住间夜','间夜占比','同比'])
                + trow(['企业协议','70,871.59','20.56%','160','25.52%',yoy(15.3)])
                + trow(['差旅壹号协议','49,456.00','14.35%','128','20.41%',yoy(9.8)])
                + trow(['其他','224,315.86','65.09%','339','54.07%',yoy(-4.2)]))+'</div></div>'
        +   '<div class="dist-block"><div class="sec-title">酒店协议消费分布</div>'
        +     donut([{pct:79.44,color:C.blue},{pct:20.56,color:C.purple}],[{color:C.purple,label:'协议(20.56%)'},{color:C.blue,label:'非协议(79.44%)'}])
        +     '<div class="scene-note" style="margin-top:14px">贵司协议消费占比 <b>20.87%</b>，低于商旅水平，可考虑对热门非协议酒店/集团补充签约，并提升协议可订率。</div></div>'
        + '</div>'
        + '<div class="sec-title mt">TOP15 城市协议消费情况</div>'
        + svbar([
            {label:'成都',segs:[{v:0.53,color:C.blue},{v:5.61,color:'#d6e4ff'}]},{label:'上海',segs:[{v:2.15,color:C.blue},{v:2.97,color:'#d6e4ff'}]},
            {label:'北京',segs:[{v:1.47,color:C.blue},{v:3.59,color:'#d6e4ff'}]},{label:'新加坡',segs:[{v:0.91,color:C.blue},{v:1.95,color:'#d6e4ff'}]},
            {label:'深圳',segs:[{v:0.57,color:C.blue},{v:1.85,color:'#d6e4ff'}]},{label:'中国香港',segs:[{v:0,color:C.blue},{v:2.33,color:'#d6e4ff'}]},
            {label:'牛津',segs:[{v:0,color:C.blue},{v:1.6,color:'#d6e4ff'}]},{label:'剑桥',segs:[{v:0,color:C.blue},{v:1.25,color:'#d6e4ff'}]},
            {label:'伦敦',segs:[{v:0,color:C.blue},{v:1.04,color:'#d6e4ff'}]},{label:'澳门',segs:[{v:0,color:C.blue},{v:0.88,color:'#d6e4ff'}]},
            {label:'齐齐哈尔',segs:[{v:0,color:C.blue},{v:0.65,color:'#d6e4ff'}]},{label:'厦门',segs:[{v:0,color:C.blue},{v:0.39,color:'#d6e4ff'}]},
            {label:'南京',segs:[{v:0.17,color:C.blue},{v:0,color:'#d6e4ff'}]},{label:'吉隆坡',segs:[{v:0,color:C.blue},{v:0.33,color:'#d6e4ff'}]}
          ],[{color:C.blue,label:'协议'},{color:'#d6e4ff',label:'非协议'}],{unit:'万'})
        + '<div class="sec-title mt">TOP15 酒店集团协议消费情况</div>'
        + svbar([
            {label:'华住',segs:[{v:5.05,color:C.blue},{v:1.55,color:'#d6e4ff'}]},{label:'洲际酒店集团',segs:[{v:0,color:C.blue},{v:2.86,color:'#d6e4ff'}]},
            {label:'雅高',segs:[{v:0.09,color:C.blue},{v:1.69,color:'#d6e4ff'}]},{label:'锦江(中国区)',segs:[{v:0.49,color:C.blue},{v:0.75,color:'#d6e4ff'}]},
            {label:'如心',segs:[{v:0,color:C.blue},{v:0.68,color:'#d6e4ff'}]}
          ],[{color:C.blue,label:'协议'},{color:'#d6e4ff',label:'非协议'}],{unit:'万'})
        + '<div class="sec-title mt">线级城市协议消费情况</div>'
        + svbar([
            {label:'一线城市',segs:[{v:4.19,color:C.blue},{v:8.45,color:'#d6e4ff'}]},{label:'新一线城市',segs:[{v:1.15,color:C.blue},{v:6.94,color:'#d6e4ff'}]},
            {label:'二线城市',segs:[{v:0.29,color:C.blue},{v:1.46,color:'#d6e4ff'}]},{label:'三线城市',segs:[{v:0.5,color:C.blue},{v:0.06,color:'#d6e4ff'}]},
            {label:'四线城市',segs:[{v:0,color:C.blue},{v:0.17,color:'#d6e4ff'}]},{label:'其他',segs:[{v:0.91,color:C.blue},{v:6.17,color:'#d6e4ff'}]}
          ],[{color:C.blue,label:'协议'},{color:'#d6e4ff',label:'非协议'}],{unit:'万'})
        + '<div class="sec-title mt">星级酒店协议消费情况</div>'
        + svbar([
            {label:'其他',segs:[{v:0,color:C.blue},{v:0.29,color:'#d6e4ff'}]},{label:'三星级/舒适',segs:[{v:4.81,color:C.blue},{v:3.79,color:'#d6e4ff'}]},
            {label:'二星/经济',segs:[{v:0.15,color:C.blue},{v:5.73,color:'#d6e4ff'}]},{label:'五星级/豪华',segs:[{v:0.78,color:C.blue},{v:3.68,color:'#d6e4ff'}]},
            {label:'四星级/高档',segs:[{v:1.35,color:C.blue},{v:13.89,color:'#d6e4ff'}]}
          ],[{color:C.blue,label:'协议'},{color:'#d6e4ff',label:'非协议'}],{unit:'万'})
        + '<div class="sec-title mt">酒店渠道消费分布</div>'
        + vbar([{label:'集团酒店协议',val:5.93},{label:'单体酒店协议',val:0.25},{label:'会员酒店',val:17.52},{label:'酒店代购',val:10.76}],{color:C.blue,unit:'万',barw:40})
        + '<div class="sec-title mt">酒店渠道消费情况</div>'
        + tableW(thead(['酒店渠道类型','消费金额','消费金额占比','入住间夜','间夜预订均价'])
            + trow(['会员酒店','175,213.66','50.84%','384','481.69'])
            + trow(['单体酒店协议','2,500.00','0.73%','5','500.00'])
            + trow(['酒店代购','107,617.95','31.23%','90','1,221.47'])
            + trow(['集团酒店协议','59,311.84','17.21%','148','363.16']))
        + '<div class="sec-title mt">酒店集团消费明细</div>'
        + tableW(thead(['酒店集团名称','消费金额','消费金额占比','协议消费金额','协议消费占比','非协议消费金额','入住间夜','间夜预订均价'])
            + trow(['华住','6.60万','38.39%','5.05万','76.51%','1.55万','163','369.96'])
            + trow(['洲际酒店集团','2.86万','16.65%','0.00万','0.00%','2.86万','26','947.40'])
            + trow(['雅高','1.77万','10.31%','0.09万','4.87%','1.69万','29','618.39'])
            + trow(['锦江酒店(中国区)','1.24万','7.20%','0.49万','39.46%','0.75万','35','364.26'])
            + trow(['如心','0.68万','3.93%','0.00万','0.00%','0.68万','4','1,543.23']))
        + moreBar(26,6)
        + '<div class="sec-title mt">酒店品牌消费明细</div>'
        + tableW(thead(['品牌归属酒店集团','酒店品牌名称','消费金额','消费金额占比','协议消费金额','协议消费占比','入住间夜','间夜预订均价'])
            + trow(['华住','全季','2.55万','13.11%','2.55万','100.00%','66','320.77'])
            + trow(['雅高','诺富特','1.77万','9.10%','0.09万','4.87%','29','618.39'])
            + trow(['洲际酒店集团','洲际酒店及度假村','1.53万','7.84%','0.00万','0.00%','6','2,545.45'])
            + trow(['华住','城际酒店','1.40万','7.21%','0.53万','38.03%','28','501.00'])
            + trow(['-','傲途格精选酒店','1.25万','6.42%','0.00万','0.00%','5','2,500.00']))
        + '<div class="sec-title mt">酒店消费明细</div>'
        + tableW(thead(['酒店名称','酒店品牌','酒店集团','所属省份','城市线级','所属城市','酒店等级','消费金额'])
            + trow(['牛津东门美居酒店','-','-','其他','其他','牛津','四星级/高档型','15,996.00元'])
            + trow(['香港海景嘉福洲际酒店','洲际酒店及度假村','洲际酒店集团','香港特别行政区','其他','中国香港','四星级/高档型','15,272.70元'])
            + trow(['全季酒店(上海徐家汇天钥桥路店)','全季','华住','上海市','一线城市','上海','三星级/舒适型','15,031.00元'])
            + trow(['上海静安诺富特酒店','诺富特','雅高','上海市','一线城市','上海','四星级/高档型','14,900.00元'])
            + trow(['成都宽窄巷子城际酒店','城际酒店','华住','四川省','新一线城市','成都','五星级/豪华型','12,821.00元']))
        + moreBar(190,19)
        + '<div class="sec-title mt">各组织酒店协议消费情况</div>'
        + tableW(thead(['分析对象','消费金额','协议消费金额','协议消费占比','非协议消费金额','预订间夜','入住间夜','间夜预订均价'])
            + trow(['四川示例企业集团有限公司','344,643.45','70,871.59','20.56%','273,771.86','884','627','549.42']))
        + reqbox([ R1(),
            {t:'<b>需求1 调整</b>：资源报告「各组织协议消费」表<b>去掉「核算主体 / 成本中心」切换</b>，仅保留公司维度', id:'2502906', tag:'优化'},
            {t:'增加<b>协议酒店可订率</b>指标', id:'2501745', tag:'新增'},
            {t:'修复酒店集团<b>归类逻辑</b>（欢朋→锦江）', id:'2502513', tag:'优化'} ]);
    }},

    'con-air': { crumb:'消费报告_机票', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return '<div class="ov-top">'
        +   '<div class="metric-block"><div class="sec-title">机票成交净价</div><div class="big-amount">516,644元</div>'+subs(['出票张数 <b>245张</b>','成交净价同比 '+yoy(12.4)])+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">各舱等成交净价分布</div>'+donut([{pct:72.93,color:C.orange},{pct:27.07,color:C.blue}],[{color:C.orange,label:'公务舱(72.93%)'},{color:C.blue,label:'经济舱(27.07%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">各舱等成交净价</div>'+tableW(thead(['舱等类型','成交净价','成交净价占比','出票张数','同比'])
        +     trow(['经济舱','139,844.00元','27.07%','125',yoy(-6.8)])
        +     trow(['公务舱','376,800.00元','72.93%','120',yoy(19.5)]))+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">票均成交净价（贵司 2,503.15元 / 商旅 1,049.12元）</div>'
        +     '<div class="pg-tabs" style="justify-content:flex-start"><span class="active">全部</span><span>经济舱</span><span>公务舱</span><span>头等舱</span></div>'
        +     lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'平均成交净价(贵司)',color:C.blue,vals:[2471.72,1761.63,2683.89,2401.53,3461.37,840]},{name:'平均成交净价(商旅)',color:C.orange,vals:[1009.69,1184.4,1023.74,1127,1008.32,840]}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">里程均价（贵司 1.32元/km / 商旅 0.71元/km）</div>'
        +     '<div class="pg-tabs" style="justify-content:flex-start"><span class="active">全部</span><span>经济舱</span><span>公务舱</span><span>头等舱</span></div>'
        +     lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'里程均价(贵司)',color:C.blue,vals:[1.52,1.09,1.15,1.28,1.56,0.65]},{name:'里程均价(商旅)',color:C.orange,vals:[0.7,0.83,0.7,0.75,0.67,0.65]}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">提前预订天数（贵司 7.43天 / 商旅 3.11天）</div>'
        + '<div class="row"><div style="flex:1;min-width:300px">'
        +   gbar(['0-0','1-1','2-4','5-8','9-14','≥15'],{name:'出票占比(贵司)',color:C.blue,vals:[8.68,22.73,36.78,10.33,4.55,16.94]},{name:'出票占比(商旅)',color:C.orange,vals:[33,33,29,12,5,2.74]},{unit:'%'})+'</div>'
        +   '<div style="flex:1;min-width:340px">'+tableW(thead(['提前预订天数区间','出票张数','出票张数占比','成交净价','里程均价','票折扣(国内)'])
              + trow(['0-0','21','8.68%','27,030.00元','1.09','0.3'])
              + trow(['1-1','55','22.73%','59,692.00元','0.96','0.29'])
              + trow(['2-4','89','36.78%','128,693.00元','0.98','0.28'])
              + trow(['5-8','25','10.33%','66,151.00元','1.78','0.25'])
              + trow(['9-14','11','4.55%','36,439.00元','2.09','0.33'])
              + trow(['≥15','41','16.94%','224,359.00元','1.75','0.65']))+'</div></div>'
        + '<div class="sec-title mt">机票平均折扣(仅国内)（贵司 0.32 / 商旅 0.48）</div>'
        + '<div class="row"><div style="flex:1;min-width:300px">'
        +   vbar([{label:'0-0.09',val:0.9,disp:'0.9%'},{label:'0.1-0.19',val:13.9,disp:'13.9%'},{label:'0.2-0.29',val:36.77,disp:'36.8%'},{label:'0.3-0.39',val:16.59,disp:'16.6%'},{label:'0.4-0.49',val:8.52,disp:'8.5%'},{label:'0.5-0.59',val:8.07,disp:'8.1%'},{label:'0.6-0.69',val:5.83,disp:'5.8%'},{label:'0.7-0.79',val:1.35,disp:'1.4%'},{label:'0.8-0.89',val:1.35,disp:'1.4%'},{label:'0.9-0.99',val:1.79,disp:'1.8%'},{label:'1.0',val:4.93,disp:'4.9%'}],{color:C.blue,unit:'%',barw:22})+'</div>'
        +   '<div style="flex:1;min-width:340px">'+tableW(thead(['机票折扣区间','出票张数','出票张数占比','成交净价','里程均价'])
              + trow(['0-0.09','2','0.9%','70.00元','null'])
              + trow(['0.2-0.29','82','36.77%','99,151.00元','0.99'])
              + trow(['0.3-0.39','37','16.59%','53,918.00元','1.19'])
              + trow(['0.5-0.59','18','8.07%','25,290.00元','0.91'])
              + trow(['1.0','11','4.93%','32,090.00元','1.33']))+'</div></div>'
        + '<div class="sec-title mt">票均折扣趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'贵司',color:C.blue,vals:[0.4,0.28,0.28,0.28,0.34,0.27]},{name:'商旅',color:C.orange,vals:[0.46,0.55,0.46,0.51,0.46,0.42]}])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">提前预订天数折扣分布（折扣仅国内经济舱）</div>'
        +     vbar([{label:'0-0',val:9.05,disp:'9.1%'},{label:'1-1',val:22.63,disp:'22.6%'},{label:'2-4',val:36.63,disp:'36.6%'},{label:'5-8',val:10.29,disp:'10.3%'},{label:'9-14',val:4.53,disp:'4.5%'},{label:'≥15',val:16.87,disp:'16.9%'}],{color:C.blue,unit:'%',barw:28})+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">起飞时间段折扣分布</div>'
        +     vbar([{label:'6-8',val:7.76,disp:'7.8%'},{label:'8-10',val:9.99,disp:'10%'},{label:'10-12',val:4.9,disp:'4.9%'},{label:'12-14',val:11.02,disp:'11%'},{label:'14-16',val:5.31,disp:'5.3%'},{label:'16-18',val:13.06,disp:'13.1%'},{label:'18-20',val:13.06,disp:'13.1%'},{label:'20-22',val:31.02,disp:'31%'},{label:'22-24',val:4.49,disp:'4.5%'}],{color:C.blue,unit:'%',barw:22})+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">退票分析 34张（退票率 贵司13.93% / 商旅7.12%）</div>'
        +     vbar([{label:'2026-1',val:8},{label:'2026-2',val:11},{label:'2026-3',val:4},{label:'2026-4',val:2},{label:'2026-5',val:9},{label:'2026-6',val:0}],{color:C.blue,unit:'张',barw:30})
        +     '<div class="sec-title mt">退票原因分布</div>'
        +     '<div class="row" style="margin-top:0">'
        +       '<div style="flex:0 0 auto">'+donut([{pct:97.06,color:C.blue},{pct:2.94,color:C.orange}],[{color:C.blue,label:'改变行程计划(97.06%)'},{color:C.orange,label:'航变/航班时刻变更(2.94%)'}])+'</div>'
        +       '<div style="flex:1;min-width:200px">'+tableW(thead(['退票原因','占比','退票张数'])+trow(['改变行程计划','97.06%','33'])+trow(['航变/航班时刻变更','2.94%','1']))+'</div>'
        +     '</div>'
        +   '</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">改签分析 7张（改签率 贵司2.87% / 商旅3.08%）</div>'
        +     vbar([{label:'2026-1',val:0},{label:'2026-2',val:1},{label:'2026-3',val:1},{label:'2026-4',val:5},{label:'2026-5',val:0},{label:'2026-6',val:0}],{color:C.blue,unit:'张',barw:30})
        +     '<div class="sec-title mt">改签原因分布</div>'
        +     '<div class="row" style="margin-top:0">'
        +       '<div style="flex:0 0 auto">'+donut([{pct:100,color:C.blue}],[{color:C.blue,label:'其他(100%)'}])+'</div>'
        +       '<div style="flex:1;min-width:200px">'+tableW(thead(['改签原因','占比','改签张数'])+trow(['其他','100%','7']))+'</div>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">机票出行场景</div>'+donut([{pct:100,color:C.blue}],[{color:C.blue,label:'出差(100%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">机票出行场景消费情况</div>'+tableW(thead(['机票出行场景','消费金额','消费金额占比','差旅服务费','机票出票张数','成交净价','平均成交净价'])
              + trow(['出差','608,801.00元','100.00%','0.00元','245','516,644.00元','2,108.75元']))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">超级经济舱成交净价 <span class="new-tag">需求2 新增</span></div>'
        + '<div class="row"><div style="flex:1;min-width:280px">'
        +   donut([{pct:12.5,color:C.orange},{pct:87.5,color:C.blue}],[{color:C.orange,label:'超级经济舱(12.5%)'},{color:C.blue,label:'非超级经济舱(87.5%)'}])
        + '</div><div style="flex:1.4;min-width:380px">'
        +   '<table class="tbl"><tr><th>舱等类型</th><th>成交净价</th><th>出票张数</th><th>平均折扣</th><th>占经济舱比例</th><th>同比</th></tr>'
        +     '<tr><td>超级经济舱</td><td>28,500.00元</td><td>18</td><td>0.62</td><td>12.5%</td><td>'+yoy(15.2)+'</td></tr></table>'
        + '</div></div>'
        + overStandardTable('机票','186','7.2%','15,300.00元',12.0)
        + '<div class="sec-title mt">热门航线 TOP15（成交净价）</div>'
        + vbar([{label:'上海-上海',val:92330,disp:'92,330'},{label:'成都-成都',val:68250,disp:'68,250'},{label:'成都-北京',val:30894,disp:'30,894'},{label:'新加坡-伦敦',val:30840,disp:'30,840'},{label:'伦敦-成都',val:25950,disp:'25,950'},{label:'北京-成都',val:24704,disp:'24,704'},{label:'上海-成都',val:16992,disp:'16,992'},{label:'深圳-成都',val:15840,disp:'15,840'},{label:'上海-西双版纳',val:15480,disp:'15,480'},{label:'成都-珠海',val:13530,disp:'13,530'},{label:'北京-上海',val:13440,disp:'13,440'},{label:'上海-香港',val:13205,disp:'13,205'},{label:'上海-北京',val:12600,disp:'12,600'},{label:'成都-上海',val:11961,disp:'11,961'},{label:'广州-北京',val:10510,disp:'10,510'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">热门出发城市 TOP15（成交净价）</div>'
        + vbar([{label:'上海',val:169640,disp:'169,640'},{label:'成都',val:146355,disp:'146,355'},{label:'北京',val:71354,disp:'71,354'},{label:'伦敦',val:27145,disp:'27,145'},{label:'广州',val:21803,disp:'21,803'},{label:'深圳',val:20590,disp:'20,590'},{label:'武汉',val:10640,disp:'10,640'},{label:'西双版纳',val:7920,disp:'7,920'},{label:'厦门',val:7370,disp:'7,370'},{label:'林芝',val:5490,disp:'5,490'},{label:'哈尔滨',val:2969,disp:'2,969'},{label:'齐齐哈尔',val:2880,disp:'2,880'},{label:'重庆',val:2400,disp:'2,400'},{label:'长沙',val:2190,disp:'2,190'},{label:'海口',val:2130,disp:'2,130'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">热门到达城市 TOP15（成交净价）</div>'
        + vbar([{label:'成都',val:168902,disp:'168,902'},{label:'上海',val:143257,disp:'143,257'},{label:'北京',val:77319,disp:'77,319'},{label:'伦敦',val:34828,disp:'34,828'},{label:'珠海',val:22760,disp:'22,760'},{label:'西双版纳',val:15480,disp:'15,480'},{label:'武汉',val:12680,disp:'12,680'},{label:'香港',val:12600,disp:'12,600'},{label:'深圳',val:11300,disp:'11,300'},{label:'林芝',val:8860,disp:'8,860'},{label:'厦门',val:6780,disp:'6,780'},{label:'哈尔滨',val:4526,disp:'4,526'},{label:'青岛',val:3140,disp:'3,140'},{label:'长春',val:3070,disp:'3,070'},{label:'吉隆坡',val:2610,disp:'2,610'}],{color:C.blue,barw:24})
        + reqbox([ R1(),
            {t:'<b>需求19</b>：本页内嵌「企业/核算主体/部门对比」已<b>迁出至独立「对比报告 → 消费报告对比」</b>', id:'—', tag:'优化'},
            {t:'<b>需求13</b>：因私出行（机票）已<b>迁出消费报告</b>，统一收口到独立「因私报告」，便于单独配置可见权限', id:'2502913', tag:'优化'},
            {t:'<b>需求2</b>：新增「超级经济舱成交净价」图表（成交净价/出票张数/平均折扣/占经济舱比例）— ✅本页已落地', id:'2502907', tag:'新增'},
            {t:'<b>需求5</b>：新增「国内/国际/全部」筛选拆分，图表随之联动 — ✅本页已落地', id:'2502804', tag:'新增'},
            {t:'<b>需求7</b>：新增「超标情况」表（超标明细数/超标率/超标个人支付，可按企业配置）— ✅本页已落地', id:'2602770', tag:'新增'} ]);
    }},
    'con-hotel': { crumb:'消费报告_酒店', render:function(){
      return '<div class="ov-top">'
        +   '<div class="metric-block"><div class="sec-title">酒店消费金额</div><div class="big-amount">339,591.45元</div>'+subs(['间夜均价(贵司) <b>571.70元</b>','间夜均价(商旅) <b>346.85元</b>','酒店消费金额同比 '+yoy(12.8)])+'</div>'
        +   '<div class="dist-block"><div class="sec-title">酒店星级消费分布</div>'+donut([{pct:44.21,color:C.purple},{pct:24.96,color:C.orange},{pct:17.05,color:C.blue},{pct:12.95,color:C.teal},{pct:0.83,color:C.train}],[{color:C.blue,label:'二星/经济型及以下(17.05%)'},{color:C.orange,label:'三星级/舒适型(24.96%)'},{color:C.purple,label:'四星级/高档型(44.21%)'},{color:C.teal,label:'五星级/豪华型(12.95%)'},{color:C.train,label:'其他(0.83%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">酒店等级消费分布</div>'
        + tableW(thead(['酒店等级分类','消费金额','入住间夜','预订间夜均价'])
            + trow(['四星级/高档型','152,376.51','212','723.67'])
            + trow(['三星级/舒适型','85,986.04','181','471.29'])
            + trow(['二星/经济型及以下','58,773.00','164','373.67'])
            + trow(['五星级/豪华型','44,636.90','59','844.55'])
            + trow(['其他','2,871.00','11','286.38']))
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">间夜均价入住分布</div>'
        +     vbar([{label:'0-200',val:2.97,disp:'3%'},{label:'200-300',val:8.43,disp:'8.4%'},{label:'300-400',val:16.84,disp:'16.8%'},{label:'400-500',val:18.48,disp:'18.5%'},{label:'500-600',val:6.14,disp:'6.1%'},{label:'600-700',val:5.86,disp:'5.9%'},{label:'700-800',val:0.34,disp:'0.3%'},{label:'800-900',val:1.66,disp:'1.7%'},{label:'900-1000',val:0.45,disp:'0.5%'},{label:'1000-1500',val:8.97,disp:'9%'},{label:'1500-2000',val:5.84,disp:'5.8%'},{label:'2000以上',val:24.02,disp:'24%'}],{color:C.blue,unit:'%',barw:22})+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">间夜均价趋势（贵司 / 商旅）</div>'
        +     lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'贵司',color:C.blue,vals:[345.21,336.42,350.01,347.55,347.36,359.69]},{name:'商旅',color:C.orange,vals:[626.54,596.91,465.29,668.62,557.45,359.69]}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">间夜均价趋势（协议 / 非协议）</div>'
        +     lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'间夜均价(协议)',color:C.blue,vals:[387.88,450.11,462.0,349.41,400.05,333.32]},{name:'间夜均价(非协议)',color:C.orange,vals:[677.20,633.61,545.11,711.08,597.25,333.32]}])+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">提前预订天数分布</div>'
        +     vbar([{label:'当天',val:33.65,disp:'33.65%'},{label:'1-3天',val:41.43,disp:'41.43%'},{label:'4-7天',val:13.59,disp:'13.59%'},{label:'8-15天',val:11.34,disp:'11.34%'}],{color:C.blue,unit:'%',barw:40})+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">拼房预订间夜趋势</div>'
        +     vbar([{label:'2026-1',val:14},{label:'2026-2',val:0},{label:'2026-3',val:3},{label:'2026-4',val:0},{label:'2026-5',val:4},{label:'2026-6',val:0}],{color:C.blue,unit:'',barw:40})+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">预订方式分布</div>'+donut([{pct:52.38,color:C.blue},{pct:47.62,color:C.orange}],[{color:C.blue,label:'线上(52.38%)'},{color:C.orange,label:'APP(47.62%)'}])+'</div>'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">支付方式分布</div>'+donut([{pct:100,color:C.orange}],[{color:C.orange,label:'预存(100%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">混付预订间夜 13（混付消费金额 5,963.60元 / 混付间夜占比 1.47%）</div>'
        + '<div class="row"><div style="flex:1;min-width:280px">'+hbarStack([{name:'混付支付',segs:[{v:5701,color:C.blue,disp:'5,701.00元(96%)'},{v:262.6,color:C.orange,disp:'262.60元(4%)'}]}],[{color:C.blue,label:'企业支付'},{color:C.orange,label:'个人支付'}])+'</div>'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">混付预订间夜趋势</div>'+vbar([{label:'2026-1',val:1},{label:'2026-2',val:0},{label:'2026-3',val:1},{label:'2026-4',val:6},{label:'2026-5',val:0},{label:'2026-6',val:5}],{color:C.blue,barw:34})+'</div></div>'
        + '<div class="sec-title mt">最热门酒店 / 集团 / 品牌 / 入住城市</div>'
        + infoCards([{title:'最热门酒店',rows:[{k:'酒店名称',v:'全季酒店(上海徐家汇)'},{k:'预订间夜',v:'54'}]},
            {title:'最热门酒店集团',rows:[{k:'集团名称',v:'华住'},{k:'预订间夜',v:'195'}]},
            {title:'最热门酒店品牌',rows:[{k:'品牌名称',v:'全季'},{k:'预订间夜',v:'91'}]},
            {title:'最热门入住城市',rows:[{k:'入住城市',v:'上海'},{k:'预订间夜',v:'153'}]}])
        + hotTop('热门酒店 TOP15（消费金额）',[
            {n:'全季-上海',amt:19501,nt:13,yoy:12.3},{n:'香港嘉福',amt:16049,nt:11,yoy:6.8},{n:'牛津美居',amt:15996,nt:12,yoy:9.1},{n:'香港海景',amt:15272.7,nt:10,yoy:-3.2},{n:'全季-徐汇',amt:15031,nt:27,yoy:18.5},{n:'诺富特',amt:14900,nt:19,yoy:4.0},{n:'希奢北京',amt:13330,nt:16,yoy:7.7},{n:'希奢航天',amt:13093,nt:15,yoy:5.2},{n:'傲途格',amt:12500,nt:5,yoy:22.0},{n:'JW万豪',amt:10407,nt:9,yoy:-1.5},{n:'东陵今旅',amt:9059.75,nt:6,yoy:3.4},{n:'桔子',amt:6754,nt:18,yoy:-6.0},{n:'城际',amt:6513,nt:13,yoy:11.0},{n:'诺富特2',amt:6507,nt:11,yoy:2.1},{n:'城际2',amt:5410,nt:12,yoy:-4.3}])
        + hotTop('热门酒店集团 TOP15（消费金额）',[
            {n:'华住',amt:65962.84,nt:195,yoy:8.9},{n:'洲际酒店集团',amt:28606.7,nt:32,yoy:15.4},{n:'雅高',amt:17712,nt:29,yoy:4.7},{n:'锦江(中国)',amt:12378,nt:35,yoy:6.2},{n:'如心',amt:6754,nt:5,yoy:3.0},{n:'艺龙酒店科技',amt:6213,nt:14,yoy:-2.0},{n:'首旅如家',amt:4967.29,nt:16,yoy:5.5},{n:'亚朵',amt:4749.25,nt:12,yoy:9.0},{n:'朗廷酒店集团',amt:3888.4,nt:4,yoy:12.0},{n:'万豪国际集团',amt:3200,nt:6,yoy:14.0},{n:'网鱼电竞',amt:2668,nt:8,yoy:-5.0},{n:'温德姆',amt:2412,nt:7,yoy:1.5},{n:'雅诗阁',amt:2352,nt:5,yoy:3.3},{n:'希尔顿',amt:2206,nt:4,yoy:7.0},{n:'万达',amt:1790,nt:5,yoy:-3.0}])
        + hotTop('热门入住城市 TOP15（消费金额）',[
            {n:'成都',amt:61481,nt:111,yoy:9.4},{n:'上海',amt:51222.22,nt:106,yoy:6.1},{n:'北京',amt:50600.54,nt:119,yoy:7.8},{n:'新加坡',amt:28560.75,nt:18,yoy:21.0},{n:'深圳',amt:24174,nt:63,yoy:5.3},{n:'中国香港',amt:23337.7,nt:16,yoy:-3.5},{n:'牛津',amt:15996,nt:12,yoy:9.1},{n:'剑桥',amt:12500,nt:5,yoy:12.0},{n:'伦敦',amt:10407,nt:9,yoy:-1.5},{n:'澳门',amt:8754,nt:8,yoy:4.0},{n:'武汉',amt:6990,nt:40,yoy:11.0},{n:'齐齐哈尔',amt:6507,nt:11,yoy:2.1},{n:'厦门',amt:3888.4,nt:9,yoy:-6.0},{n:'南京',amt:3412,nt:13,yoy:3.0},{n:'吉隆坡',amt:3319,nt:7,yoy:5.0}])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">北上广深星级酒店消费分布</div>'
        +     hbarStack([
              {name:'北上广深',segs:[{v:28398,color:C.blue,disp:'23%'},{v:50996.29,color:C.orange,disp:'41%'},{v:40810.47,color:C.purple,disp:'33%'},{v:4518,color:C.teal,disp:'4%'}]},
              {name:'其他',segs:[{v:30375,color:C.blue,disp:'14%'},{v:111566.04,color:C.orange,disp:'51%'},{v:40118.9,color:C.purple,disp:'18%'},{v:0,color:C.teal,disp:''}]}
             ],[{color:C.blue,label:'二星/经济型及以下'},{color:C.orange,label:'三星级/舒适型'},{color:C.purple,label:'四星级/高档型'},{color:C.teal,label:'五星级/豪华型'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">直辖市及省会城市入住占比</div>'
        +     bubble([{label:'北京',pct:24.19},{label:'成都',pct:22.56},{label:'上海',pct:21.54},{label:'深圳',pct:12.80},{label:'武汉',pct:8.13},{label:'南京',pct:2.24},{label:'太原',pct:1.83},{label:'其他',pct:6.71}])+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">酒店出行场景</div>'+donut([{pct:100,color:C.blue}],[{color:C.blue,label:'出差(100%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">酒店出行场景消费情况</div>'+tableW(thead(['酒店出行场景','消费金额','消费金额占比','差旅服务费','入住间夜','间夜均价'])
              + trow(['出差','344,643.45','100.00%','309.00元','627','564.90元']))+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">订单预订间夜数量分布</div>'
        +     vbar([{label:'1间夜',val:62.75,disp:'62.75%'},{label:'2间夜',val:21.37,disp:'21.37%'},{label:'3间夜',val:7.45,disp:'7.45%'},{label:'4间夜',val:4.31,disp:'4.31%'},{label:'5间夜',val:1.57,disp:'1.57%'},{label:'6间夜',val:0.98,disp:'0.98%'},{label:'7间夜',val:0.98,disp:'0.98%'},{label:'8间夜',val:0.2,disp:'0.2%'},{label:'≥10',val:0.39,disp:'0.39%'}],{color:C.blue,unit:'%',barw:24})+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">订单预订间夜数量情况</div>'+tableW(thead(['订单预订间夜数','消费金额','消费金额占比','订单数量','预订间夜'])
              + trow(['1间夜','102,780.62','29.82%','269','274'])
              + trow(['2间夜','74,130.38','21.51%','89','188'])
              + trow(['3间夜','64,478.70','18.71%','28','96'])
              + trow(['4间夜','15,841.00','4.60%','17','64'])
              + trow(['5间夜','31,189.00','9.05%','7','40']))+moreBar(9,2)+'</div>'
        + '</div>'
        + overStandardTable('酒店','240','9.1%','22,800.00元',8.0)
        + '<div class="sec-title mt">酒店等级消费分析</div>'
        + tableW(thead(['是否北上广深城市','酒店等级分类','入住间夜','入住间夜占比','消费金额','间夜均价','差旅服务费'])
            + trow(['其他','四星级/高档型','212','33.81%','152,376.51元','723.67','92.00元'])
            + trow(['其他','三星级/舒适型','53','8.45%','34,989.75元','640.07','40.00元'])
            + trow(['其他','二星/经济型及以下','92','14.67%','30,375.00元','361.11','90.00元'])
            + trow(['北上广深','四星级/高档型','78','12.44%','40,810.47元','535.21','1.00元'])
            + trow(['北上广深','三星级/舒适型','128','20.41%','50,996.29元','398.49','6.00元']))
        + moreBar(15,2)
        + '<div class="sec-title mt">直辖市及省会城市入住情况</div>'
        + tableW(thead(['酒店所属城市','是否直辖市及省会','入住间夜','入住间夜占比','消费金额','间夜均价','差旅服务费'])
            + trow(['北京','是','119','24.19%','50,600.54元','422.95','67.00元'])
            + trow(['成都','是','111','22.56%','61,481.00元','523.03','80.00元'])
            + trow(['上海','是','106','21.54%','51,222.22元','488.69','0.00元'])
            + trow(['深圳','是','63','12.8%','24,174.00元','382.98','21.00元'])
            + trow(['武汉','是','40','8.13%','6,990.00元','191.24','0.00元']))
        + moreBar(15,2)
        + '<div class="sec-title mt">酒店渠道分析</div>'
        + tableW(thead(['资源供应链','渠道名称','订单量','入住间夜','入住间夜占比','消费金额','消费金额占比','间夜均价','差旅服务费'])
            + trow(['企业协议酒店','企业单体协议酒店托管','3','12','1.91%','11,559.75元','3.35%','963.31元','0.00元'])
            + trow(['企业协议酒店','托管直连-华住(一汽)','73','123','19.62%','51,327.84元','14.89%','414.29元','0.00元'])
            + trow(['企业协议酒店','直连-锦江(促销追价)','12','14','2.23%','4,884.00元','1.42%','349.44元','0.00元'])
            + trow(['差旅壹号会员酒店','差旅壹号其他资源','218','278','44.34%','148,849.36元','43.19%','563.40元','9.00元'])
            + trow(['线下代购','线下代购','34','77','12.28%','83,285.50元','24.17%','1,123.18元','300.00元'])
            + trow(['合计','—','405','627','100%','344,643.45元','100%','564.90元','309.00元'],true))
        + reqbox([ R1(),
            {t:'<b>需求19</b>：本页内嵌「企业/核算主体/部门对比」已<b>迁出至独立「对比报告 → 消费报告对比」</b>', id:'—', tag:'优化'},
            {t:'<b>需求13</b>：因私出行（酒店）已<b>迁出消费报告</b>，统一收口到独立「因私报告」，便于单独配置可见权限', id:'2502913', tag:'优化'},
            {t:'<b>需求5</b>：新增「国内/国际/全部」筛选拆分 — ✅本页已落地', id:'2502804', tag:'新增'},
            {t:'<b>需求12</b>：热门酒店 / 酒店集团 / 入住城市 TOP15 柱子<b>悬停 tooltip</b> 展示 消费金额 / 预订间夜 / 间夜均价 / <b>同比</b>（保留柱状图，<b>不另加明细表</b>）— ✅本页已落地', id:'2600698', tag:'新增'},
            {t:'<b>需求7</b>：新增「超标情况」表（超标明细数/超标率/超标个人支付，可按企业配置）— ✅本页已落地', id:'2602770', tag:'新增'} ]);
    }},
    'con-train': { crumb:'消费报告_火车票', render:function(){
      return '<div class="ov-top">'
        +   '<div class="metric-block"><div class="sec-title">火车票面价</div><div class="big-amount">74,146.00元</div>'+subs(['火车出票张数 <b>355张</b>','平均票价(贵司) <b>219.37元</b>','平均票价(商旅) <b>196.37元</b>','火车票面价同比 '+yoy(6.2)])+'</div>'
        +   '<div class="dist-block"><div class="sec-title">火车票坐席分布</div>'+donut([{pct:79.16,color:C.orange},{pct:4.6,color:C.blue},{pct:16.24,color:C.teal}],[{color:C.blue,label:'一等座(4.6%)'},{color:C.orange,label:'二等座(79.16%)'},{color:C.teal,label:'其他(16.24%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">火车平均票价趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'平均票价(贵司)',color:C.blue,vals:[197.65,184.66,199.76,270.14,175.68,202.53]},{name:'平均票价(商旅)',color:C.orange,vals:[197.65,222.64,234.72,199.76,175.68,202.53]}])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">退票分析 17张（退票率 贵司4.79% / 商旅7.16%）</div>'
        +     vbar([{label:'2026-1',val:5},{label:'2026-2',val:0},{label:'2026-3',val:2},{label:'2026-4',val:4},{label:'2026-5',val:4},{label:'2026-6',val:2}],{color:C.blue,unit:'张',barw:30})+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">改签分析 57张（改签率 贵司16.06% / 商旅10.71%）</div>'
        +     vbar([{label:'2026-1',val:11},{label:'2026-2',val:8},{label:'2026-3',val:12},{label:'2026-4',val:9},{label:'2026-5',val:7},{label:'2026-6',val:7}],{color:C.blue,unit:'张',barw:30})+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">退改原因分布</div>'+donut([{pct:87.99,color:C.blue},{pct:8.33,color:C.orange},{pct:2.21,color:C.teal},{pct:1.47,color:C.purple}],[{color:C.blue,label:'其他(87.99%)'},{color:C.orange,label:'出发到达时间不合适(8.33%)'},{color:C.teal,label:'符合标准座位已售完(2.21%)'},{color:C.purple,label:'陪同客户和领导(1.47%)'}])+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">提前预订天数分布</div>'+vbar([{label:'0-0天',val:0,disp:'0%'},{label:'1-1天',val:26.56,disp:'26.56%'},{label:'2-4天',val:39.92,disp:'39.92%'},{label:'5-8天',val:26.73,disp:'26.73%'},{label:'9-14天',val:5.37,disp:'5.37%'},{label:'≥15天',val:1.42,disp:'1.42%'}],{color:C.blue,unit:'%',barw:28})+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">火车出行场景</div>'+donut([{pct:99.44,color:C.blue},{pct:0.56,color:C.teal}],[{color:C.blue,label:'出差(99.44%)'},{color:C.teal,label:'会议会展(0.56%)'}])+'</div>'
        +   '<div style="flex:1;min-width:360px"><div class="sec-title">火车出行场景消费情况</div>'+tableW(thead(['火车出行场景','火车票消费金额','消费金额占比','差旅服务费','火车出票张数','票面价','票均票面价'])
              + trow(['出差','74,453.00','99.90%','0.00元','353','74,068.00','216.19元'])
              + trow(['会议会展','78.00','0.10%','0.00元','2','78.00','75.50元']))+'</div>'
        + '</div>'
        + overStandardTable('火车','18','2.4%','860.00元',-5.0)
        + '<div class="sec-title mt">火车坐席消费情况</div>'
        + tableW(thead(['坐席分类类型','火车票消费金额','消费金额占比','火车出票张数','票面价','票均票面价'])
            + trow(['一等座','3,135.50元','4.21%','10','3,414.00元','328.20元'])
            + trow(['二等座','59,352.50元','79.63%','322','58,691.00元','191.85元'])
            + trow(['其他','12,043.00元','16.16%','23','12,041.00元','496.13元']))
        + '<div class="sec-title mt">最热门线路 / 出发城市 / 到达城市</div>'
        + infoCards([{title:'最热门线路',rows:[{k:'线路名称',v:'上海-杭州'},{k:'出票张数',v:'23'}]},
            {title:'最热门出发城市',rows:[{k:'出发城市',v:'北京'},{k:'出票张数',v:'51'}]},
            {title:'最热门到达城市',rows:[{k:'到达城市',v:'上海'},{k:'出票张数',v:'46'}]}])
        + '<div class="sec-title mt">热门线路 TOP15（火车票面价）</div>'
        + vbar([{label:'上海-北京',val:5259,disp:'5,259'},{label:'北京-上海',val:5253,disp:'5,253'},{label:'长春-北京',val:4486,disp:'4,486'},{label:'北京-长春',val:4468,disp:'4,468'},{label:'武汉-上海',val:3696,disp:'3,696'},{label:'上海-武汉',val:2990,disp:'2,990'},{label:'武汉-北京',val:1869,disp:'1,869'},{label:'重庆-成都',val:1751,disp:'1,751'},{label:'哈尔滨-齐齐哈尔',val:1695,disp:'1,695'},{label:'西安-武汉',val:1636,disp:'1,636'},{label:'成都-重庆',val:1629,disp:'1,629'},{label:'杭州-上海',val:1593,disp:'1,593'},{label:'上海-杭州',val:1544,disp:'1,544'},{label:'武汉-西安',val:1389.5,disp:'1,389.50'},{label:'齐齐哈尔-哈尔滨',val:1382,disp:'1,382'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">热门出发城市 TOP15（火车票面价）</div>'
        + vbar([{label:'北京',val:17974,disp:'17,974'},{label:'上海',val:10671,disp:'10,671'},{label:'武汉',val:10143.5,disp:'10,143.50'},{label:'长春',val:4863,disp:'4,863'},{label:'深圳',val:3743.5,disp:'3,743.50'},{label:'西安',val:2753.5,disp:'2,753.50'},{label:'杭州',val:2231,disp:'2,231'},{label:'成都',val:2022,disp:'2,022'},{label:'哈尔滨',val:1962,disp:'1,962'},{label:'重庆',val:1751,disp:'1,751'},{label:'连云港',val:1676,disp:'1,676'},{label:'齐齐哈尔',val:1382,disp:'1,382'},{label:'无锡',val:1276,disp:'1,276'},{label:'厦门',val:1180,disp:'1,180'},{label:'南京',val:940,disp:'940'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">热门到达城市 TOP15（火车票面价）</div>'
        + vbar([{label:'北京',val:16295,disp:'16,295'},{label:'上海',val:11567,disp:'11,567'},{label:'武汉',val:8991,disp:'8,991'},{label:'长春',val:4862,disp:'4,862'},{label:'深圳',val:3397,disp:'3,397'},{label:'成都',val:2379,disp:'2,379'},{label:'杭州',val:2378,disp:'2,378'},{label:'连云港',val:2234,disp:'2,234'},{label:'西安',val:2189.5,disp:'2,189.50'},{label:'南京',val:1999,disp:'1,999'},{label:'重庆',val:1984,disp:'1,984'},{label:'齐齐哈尔',val:1695,disp:'1,695'},{label:'哈尔滨',val:1647,disp:'1,647'},{label:'厦门',val:1284,disp:'1,284'},{label:'潍坊',val:1119,disp:'1,119'}],{color:C.blue,barw:24})
        + reqbox([ R1(),
            {t:'<b>需求19</b>：本页内嵌「企业/核算主体/部门对比」已<b>迁出至独立「对比报告 → 消费报告对比」</b>', id:'—', tag:'优化'},
            {t:'<b>需求13</b>：因私出行（火车）已<b>迁出消费报告</b>，统一收口到独立「因私报告」，便于单独配置可见权限', id:'2502913', tag:'优化'},
            {t:'<b>需求7</b>：新增「超标情况」表（超标明细数/超标率/超标个人支付，可按企业配置）— ✅本页已落地', id:'2602770', tag:'新增'},
            {t:'修复火车数据清洗问题', id:'2500100', tag:'优化'} ]);
    }},
    'con-car': { crumb:'消费报告_用车', render:function(){
      return '<div class="ov-top">'
        +   '<div class="metric-block"><div class="sec-title">用车消费金额</div><div class="big-amount">792,615.07元</div>'+subs(['用车次数 <b>21,492</b>','行程均价(贵司) <b>36.88元</b>','行程均价(商旅) <b>54.72元</b>','用车消费金额同比 '+yoy(18.7)])+'</div>'
        +   '<div class="dist-block"><div class="sec-title">用车车型消费分布 <span class="new-tag">需求4 新增</span></div>'
        +     donut([{pct:47.52,color:C.blue},{pct:46.5,color:C.orange},{pct:5.9,color:C.purple},{pct:0.08,color:C.teal}],
                  [{color:C.blue,label:'经济型(47.52%)'},{color:C.orange,label:'舒适型(46.5%)'},{color:C.purple,label:'商务型(5.9%)'},{color:C.teal,label:'豪华型(0.08%)'}],
                  ['用车车型：经济型||用车消费金额：376,651元(47.52%)||用车均价：36.89元||用车产品数：10,210',
                   '用车车型：舒适型||用车消费金额：368,566元(46.50%)||用车均价：37.08元||用车产品数：9,940',
                   '用车车型：商务型||用车消费金额：46,764元(5.90%)||用车均价：36.88元||用车产品数：1,268',
                   '用车车型：豪华型||用车消费金额：634元(0.08%)||用车均价：8.57元||用车产品数：74'])
        +   '</div>'
        + '</div>'
        + '<div class="sec-title mt">行程均价趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'行程均价(贵司)',color:C.blue,vals:[36.36,36.43,35.56,38.77,38.26,36.45]},{name:'行程均价(商旅)',color:C.orange,vals:[54.83,54.83,54.83,54.54,54.54,54.54]}])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">用车类型分布</div>'+vbar([{label:'实时用车',val:97.35,disp:'97.35%'},{label:'预约用车',val:2.2,disp:'2.2%'},{label:'接送机',val:0.4,disp:'0.4%'},{label:'接送站',val:0.05,disp:'0.05%'}],{color:C.blue,unit:'%',barw:40})+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">用车时间段分布 <span class="opt-tag">点击柱子跳转消费与节省明细</span></div>'+vbar([{label:'0-6',val:33.32,disp:'33.32%',drill:'0-6',cnt:7161},{label:'6-8',val:12.86,disp:'12.86%',drill:'6-8',cnt:2764},{label:'8-10',val:6.13,disp:'6.13%',drill:'8-10',cnt:1317},{label:'10-12',val:2.34,disp:'2.34%',drill:'10-12',cnt:503},{label:'12-14',val:2.14,disp:'2.14%',drill:'12-14',cnt:460},{label:'14-16',val:2.09,disp:'2.09%',drill:'14-16',cnt:449},{label:'16-18',val:2.65,disp:'2.65%',drill:'16-18',cnt:569},{label:'18-20',val:3.01,disp:'3.01%',drill:'18-20',cnt:647},{label:'20-22',val:4.39,disp:'4.39%',drill:'20-22',cnt:943},{label:'22-24',val:31.07,disp:'31.07%',drill:'22-24',cnt:6678}],{color:C.blue,unit:'%',barw:24})+'</div>'
        + '</div>'
        + '<div class="sec-title mt">混付用车次数 277（混付总金额 20,177.34元 / 混付用车占比 1.44%）</div>'
        + '<div class="row"><div style="flex:1;min-width:280px">'+hbarStack([{name:'混付支付',segs:[{v:17181.36,color:C.blue,disp:'17,181.36元(85%)'},{v:2995.98,color:C.orange,disp:'2,995.98元(15%)'}]}],[{color:C.blue,label:'企业支付'},{color:C.orange,label:'个人支付'}])+'</div>'
        +   '<div style="flex:1;min-width:280px"><div class="sec-title">混付用车次数趋势</div>'+vbar([{label:'2026-1',val:78},{label:'2026-2',val:57},{label:'2026-3',val:48},{label:'2026-4',val:58},{label:'2026-5',val:36}],{color:C.blue,barw:34})+'</div></div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">用车场景类型</div>'+donut([{pct:64.65,color:C.meal},{pct:23.87,color:C.orange},{pct:9.37,color:C.blue},{pct:1.52,color:C.teal},{pct:0.44,color:C.purple},{pct:0.16,color:C.train}],[{color:C.meal,label:'21:30以后市内用车(64.65%)'},{color:C.orange,label:'客满通宵班次上班用车(23.87%)'},{color:C.blue,label:'出差(9.37%)'},{color:C.teal,label:'市内因公出行(1.52%)'},{color:C.purple,label:'会议会展(0.44%)'},{color:C.train,label:'商务接待(0.16%)'}])+'</div>'
        +   '<div style="flex:1;min-width:360px"><div class="sec-title">用车场景消费情况 <span class="opt-tag">点击行跳转消费与节省明细</span></div>'+tableW(thead(['用车场景类型','用车消费金额','消费占比','差旅服务费','订单数量','行程均价'])
              + drillRow('21:30以后市内用车',12465,['21:30以后市内用车','438,867.37元','61.92%','0.00元','12,465','37.63元'])
              + drillRow('客满通宵班次上班用车',4600,['客满通宵班次上班用车','123,118.41元','17.37%','0.00元','4,600','27.47元'])
              + drillRow('出差',1807,['出差','121,054.83元','17.08%','0.00元','1,807','67.67元'])
              + drillRow('市内因公出行',294,['市内因公出行','14,392.61元','2.03%','0.00元','294','49.39元'])
              + drillRow('会议会展',84,['会议会展','7,638.42元','1.08%','0.00元','84','90.93元']))+moreBar(6,1)+'</div>'
        + '</div>'
        + overStandardTable('用车','312','3.0%','6,400.00元',6.5)
        + '<div class="sec-title mt">用车次数 / 行驶里程 / 行驶用时 TOP1 城市</div>'
        + infoCards([{title:'用车次数TOP1城市',rows:[{k:'用车城市',v:'成都'},{k:'出行次数',v:'17,585'}]},
            {title:'行驶里程TOP1城市',rows:[{k:'用车城市',v:'成都'},{k:'出行里程',v:'195,587.57km'}]},
            {title:'行驶用时TOP1城市',rows:[{k:'用车城市',v:'成都'},{k:'出行用时',v:'332,099分钟'}]}])
        + '<div class="sec-title mt">用车消费城市 TOP15</div>'
        + vbar([{label:'成都',val:593280.39,disp:'593,280'},{label:'北京',val:41181.8,disp:'41,182'},{label:'上海',val:25246.65,disp:'25,247'},{label:'武汉',val:11694.3,disp:'11,694'},{label:'深圳',val:9675.84,disp:'9,676'},{label:'广州',val:3286.58,disp:'3,287'},{label:'齐齐哈尔',val:2405.15,disp:'2,405'},{label:'澳门',val:1900,disp:'1,900'},{label:'天津',val:1722.54,disp:'1,723'},{label:'重庆',val:1629.89,disp:'1,630'},{label:'长春',val:1495.2,disp:'1,495'},{label:'哈尔滨',val:1356.38,disp:'1,356'},{label:'杭州',val:1211.17,disp:'1,211'},{label:'佛山',val:1077.49,disp:'1,077'},{label:'海口',val:946.79,disp:'947'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">用车行程里程城市 TOP15（km）</div>'
        + vbar([{label:'成都',val:195588,disp:'195,588'},{label:'北京',val:7751,disp:'7,751'},{label:'武汉',val:4705,disp:'4,705'},{label:'上海',val:3948,disp:'3,948'},{label:'深圳',val:2451,disp:'2,451'},{label:'广州',val:1058,disp:'1,058'},{label:'齐齐哈尔',val:957,disp:'957'},{label:'长春',val:570,disp:'570'},{label:'重庆',val:550,disp:'550'},{label:'天津',val:436,disp:'436'},{label:'哈尔滨',val:428,disp:'428'},{label:'无锡',val:297,disp:'297'},{label:'海口',val:272,disp:'272'},{label:'杭州',val:269,disp:'269'},{label:'南京',val:236,disp:'236'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">用车行驶时长城市 TOP15（min）</div>'
        + vbar([{label:'成都',val:332099,disp:'332,099'},{label:'北京',val:15881,disp:'15,881'},{label:'上海',val:9472,disp:'9,472'},{label:'武汉',val:6294,disp:'6,294'},{label:'深圳',val:4039,disp:'4,039'},{label:'广州',val:1451,disp:'1,451'},{label:'齐齐哈尔',val:1234,disp:'1,234'},{label:'重庆',val:775,disp:'775'},{label:'天津',val:774,disp:'774'},{label:'长春',val:725,disp:'725'},{label:'哈尔滨',val:660,disp:'660'},{label:'杭州',val:521,disp:'521'},{label:'南京',val:397,disp:'397'},{label:'无锡',val:386,disp:'386'},{label:'厦门',val:358,disp:'358'}],{color:C.blue,barw:24})
        + '<div class="sec-title mt">用车到达地 TOP15（用车消费金额）</div>'
        + vbar([{label:'成都市金牛区',val:56849.02,disp:'56,849'},{label:'成都市金堂县',val:15498.94,disp:'15,499'},{label:'成都市金牛区',val:12627.88,disp:'12,628'},{label:'成都市双流区',val:8704.21,disp:'8,704'},{label:'成都市新都区',val:6949.7,disp:'6,950'},{label:'成都市金牛区',val:6052.35,disp:'6,052'},{label:'成都市武侯区',val:5881.07,disp:'5,881'},{label:'成都市金牛区',val:5632.04,disp:'5,632'},{label:'成都市新都区',val:5434.82,disp:'5,435'},{label:'成都市金牛区',val:4886.52,disp:'4,887'},{label:'成都市温江区',val:4593.67,disp:'4,594'},{label:'成都市双流区',val:4350.14,disp:'4,350'},{label:'成都市郫都区',val:3984.88,disp:'3,985'},{label:'成都市新都区',val:3921.94,disp:'3,922'},{label:'成都市金牛区',val:3864.5,disp:'3,865'}],{color:C.blue,barw:24})
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">线级城市用车分布</div>'+vbar([{label:'新一线城市',val:613597.65,disp:'613,598'},{label:'一线城市',val:77884.58,disp:'77,885'},{label:'二线城市',val:6626.71,disp:'6,627'},{label:'null',val:3700,disp:'3,700'},{label:'三线城市',val:3611.31,disp:'3,611'},{label:'四线城市',val:2594.84,disp:'2,595'},{label:'五线城市',val:703.88,disp:'704'}],{color:C.blue,barw:26})+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">线级城市消费情况</div>'+tableW(thead(['城市线级类型','用车消费金额','用车消费占比','订单数量','行程均价/单','行程均价/km'])
              + trow(['新一线城市','613,597.65元','77.41%','16,540','37.10元','—'])
              + trow(['一线城市','77,884.58元','9.83%','2,108','36.95元','—'])
              + trow(['二线城市','6,626.71元','0.94%','148','44.78元','2.95元'])
              + trow(['三线城市','3,611.31元','0.51%','42','85.98元','3.15元'])
              + trow(['四线城市','2,594.84元','0.37%','55','49.02元','2.56元'])
              + trow(['五线城市','703.88元','0.10%','9','78.21元','4.49元']))+moreBar(7,1)+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">用车供应商消费 TOP10</div>'+vbar([{label:'滴滴出行',val:481416.5,disp:'481,417'},{label:'阳光出行',val:45520.68,disp:'45,521'},{label:'曹操出行',val:43399.01,disp:'43,399'},{label:'首汽约车',val:27946.2,disp:'27,946'},{label:'T3出行',val:27887.71,disp:'27,888'},{label:'神州专车',val:14528.86,disp:'14,529'},{label:'享道出行',val:11208.35,disp:'11,208'},{label:'如祺出行',val:8961.82,disp:'8,962'}],{color:C.blue,barw:24})+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">用车供应商消费情况</div>'+tableW(thead(['用车供应商名称','用车消费金额','用车消费占比','订单数量','行程均价','行程均价/km'])
              + trow(['滴滴出行','481,416.50元','67.93%','13,622','37.22元','3.42元'])
              + trow(['阳光出行','45,520.68元','6.42%','1,124','44.87元','2.67元'])
              + trow(['曹操出行','43,399.01元','6.12%','1,229','36.50元','2.38元'])
              + trow(['首汽约车','27,946.20元','3.94%','487','59.71元','4.17元'])
              + trow(['T3出行','27,887.71元','3.93%','791','37.13元','2.26元']))+moreBar(51,6)+'</div>'
        + '</div>'
        + reqbox([ R1(),
            {t:'<b>需求4</b>：「用车车型消费分布」按车型补齐<b>订单数、车型均价</b>（参照用车类型分布展示方式）— ✅本页已落地', id:'2503720', tag:'新增'},
            {t:'<b>需求7</b>：新增「超标情况」表（超标明细数/超标率/超标个人支付，可按企业配置）— ✅本页已落地', id:'2602770', tag:'新增'},
            {t:'<b>需求13</b>：因私出行（用车）已<b>迁出消费报告</b>，统一收口到独立「因私报告」，便于单独配置可见权限', id:'2502913', tag:'优化'},
            {t:'<b>需求11</b>：用车<b>时间段分布</b>柱子 / <b>用车场景消费情况</b>表行<b>点击跳转「消费与节省明细 · 用车」</b>并带入查询条件（用车场景类型 / 时间段 / 交易时间），明细页可逐笔查看并导出（受数据权限约束 + 量级控制）— ✅本页已落地', id:'2501799', tag:'新增'} ]);
    }},

    /* ---------- 消费与节省明细（按业务线分开；用于消费明细查看筛选 + 导出；数据源 *ConsumptionDetail，字段取全） ---------- */
    /* ---------- 对比报告（需求19：左图右表单页；helper = comparePageAll） ---------- */
    'cmp-all': { crumb:'对比报告_报告对比', render:function(){
      return comparePageAll()
        + reqbox([ R1(),
            {t:'<b>需求19</b>：对比从各报告抽出独立成「对比报告」单页，<b>左图右表</b>、一个维度切换联动 ① 消费对比 ② 节省金额 ③ 潜在节省 ④ 各业务线节省 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},

    'detail-air': { crumb:'消费与节省明细_机票', render:function(){
      var cols=['销售订单号','出票订单号','使用时间','交易完成时间','出行人','员工编号','预订人','所属公司','核算单元','成本中心','部门','因公/因私','国内/国际','机票子类型','订单类型','航司','航班号','出发城市','到达城市','舱等','航班起飞时间','提前预订天数','里程(km)','机票消费金额','成交净价','折扣','民航发展基金','燃油费','差旅服务费','改签手续费','退票手续费','是否协议机票','节省金额','超标支付金额','支付类型','商品四级分类'];
      var rows=[
        ['SO26031200181','OR26031200181','2026-03-12 08:20','2026-03-10 14:02','张磊','E001234','周斌','示例科技有限公司','华东核算单元','成本中心A','市场部','因公','国内','国内协议','出票','中国国航','CA1501','北京','上海','经济舱','2026-03-12 08:20','9','1080','1,480.00','1,326.00','0.78','50.00','60.00','30.00','0.00','0.00','是','120.00','0.00','月结','协议产品'],
        ['SO26032500233','OR26032500233','2026-03-25 19:05','2026-03-23 10:21','李强','E002871','郭红','示例科技有限公司','华南核算单元','成本中心B','销售部','因公','国内','国内非协议','改签','东方航空','MU5302','上海','广州','经济舱','2026-03-25 19:05','3','1200','980.00','880.00','0.85','50.00','40.00','30.00','50.00','0.00','否','0.00','60.00','现付','普通'],
        ['SO26041000455','OR26041000455','2026-04-10 13:00','2026-04-02 09:40','王敏','E003355','孙燕','示例制造集团','华北核算单元','成本中心C','研发部','因公','国际','国际协议','出票','中国国航','CA981','北京','纽约','公务舱','2026-04-10 13:00','21','11000','18,400.00','16,800.00','0.62','0.00','0.00','200.00','0.00','0.00','是','1,840.00','0.00','月结','协议产品'],
        ['SO26042200677','OR26042200677','2026-04-22 07:45','2026-04-21 22:10','刘洋','E004102','朱琳','示例制造集团','华北核算单元','成本中心C','行政部','因私','国内','国内非协议','出票','南方航空','CZ3104','广州','成都','经济舱','2026-04-22 07:45','1','1300','1,120.00','1,008.00','0.72','50.00','70.00','30.00','0.00','0.00','否','0.00','0.00','现付','官网']
      ];
      return jumpBanner('air')+'<div class="callout">📄 <b>消费与节省明细 · 机票</b>：用于<b>机票消费明细的查看筛选与导出</b>，数据来源 <b>AirTicketConsumptionDetail（机票消费明细表）</b>，按业务线分开。字段取全、枚举项均可筛选。</div>'
        + dFilters([
            {label:'因公/因私',opts:['全部','因公','因私']},
            {label:'国内/国际',opts:['全部','国内','国际']},
            {label:'机票子类型',opts:['全部','国内协议','国际协议','国内非协议','国际非协议']},
            {label:'订单类型',opts:['全部','出票','改签','退票','差额退款']},
            {label:'舱等类型',opts:['全部','经济舱','公务舱','头等舱']},
            {label:'是否超级经济舱',opts:['全部','是','否']},
            {label:'是否高等舱位',opts:['全部','是','否']},
            {label:'是否协议机票',opts:['全部','是','否']},
            {label:'是否协议航司',opts:['全部','是','否']},
            {label:'航司',opts:['全部','中国国航','东方航空','南方航空','海南航空','深圳航空','厦门航空','吉祥航空','春秋航空']},
            {label:'支付类型',opts:['全部','月结','预存','现付','未知']},
            {label:'商品四级分类',opts:['全部','普通','官网','公务员','协议产品']},
            {label:'是否存在退改',opts:['全部','是','否']},
            {label:'机票疑似异常',opts:['全部','无','退款至个人账户','存在未出行客票']},
            {label:'出发城市',type:'text',ph:'城市'},
            {label:'到达城市',type:'text',ph:'城市'},
            {label:'出行人',type:'text',ph:'姓名/员工编号'},
            {label:'订单号',type:'text',ph:'销售/出票订单号'},
            {label:'航班起飞时间',type:'date'},
            {label:'使用时间',type:'date'},
            {label:'交易完成时间',type:'date'} ])
        + '<div class="sec-title mt">机票消费明细 <span class="new-tag">新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">字段取全，表格可<b>左右滚动</b>查看；导出 / 下穿订单受<b>数据权限约束 + 量级控制</b>（遵循全局导出原则）。</div>'
        + tableW(thead(cols)+rows.map(function(r){return trow(r);}).join(''))
        + moreBar(862,173)
        + reqbox([ {t:'<b>新增</b>：独立「消费与节省明细」按业务线分开（机票/酒店/火车/用车），<b>字段取全 + 枚举全可筛选</b>，用于<b>查看筛选 + 导出</b>；机票数据源 <b>AirTicketConsumptionDetail</b> — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},
    'detail-hotel': { crumb:'消费与节省明细_酒店', render:function(){
      var cols=['销售订单号','出票订单号','入住时间','离店时间','交易完成时间','出行人','员工编号','预订人','所属公司','核算单元','成本中心','部门','因公/因私','国内/国际','酒店名称','酒店集团','所在城市','是否协议酒店','是否商务及以上房型','入住间夜','酒店消费金额','酒店房价','间夜均价','企业支付金额','超标个人支付','超标订单支付','节省金额','节省类型','是否混付'];
      var rows=[
        ['HO26031200181','OR26031200181','2026-03-12','2026-03-13','2026-03-13 12:00','张磊','E001234','周斌','示例科技有限公司','华东核算单元','成本中心A','市场部','因公','国内','全季(上海徐家汇店)','华住集团','上海','是','否','1','360.00','360.00','360.00','360.00','0.00','0.00','60.00','OTA节省','否'],
        ['HO26032500233','OR26032500233','2026-03-25','2026-03-27','2026-03-27 12:00','李强','E002871','郭红','示例科技有限公司','华南核算单元','成本中心B','销售部','因公','国内','成都宽窄巷子城际酒店','锦江集团','成都','是','否','2','1,180.00','1,180.00','590.00','1,180.00','0.00','0.00','90.00','集团协议节省','否'],
        ['HO26041000455','OR26041000455','2026-04-10','2026-04-12','2026-04-12 12:00','王敏','E003355','孙燕','示例制造集团','华北核算单元','成本中心C','研发部','因公','国内','北京诺富特酒店','雅高集团','北京','否','是','2','970.00','970.00','485.00','800.00','170.00','170.00','75.00','OTA节省','是'],
        ['HO26042200677','OR26042200677','2026-04-22','2026-04-24','2026-04-24 12:00','刘洋','E004102','朱琳','示例制造集团','华北核算单元','成本中心C','行政部','因私','国际','新加坡滨海湾金沙','金沙集团','新加坡','否','是','2','3,600.00','3,600.00','1,800.00','0.00','3,600.00','0.00','0.00','—','否']
      ];
      return jumpBanner('hotel')+'<div class="callout">📄 <b>消费与节省明细 · 酒店</b>：用于<b>酒店消费明细的查看筛选与导出</b>，数据来源 <b>HotelConsumptionDetail（酒店消费明细表）</b>，按业务线分开。字段取全、枚举项均可筛选。</div>'
        + dFilters([
            {label:'因公/因私',opts:['全部','因公','因私']},
            {label:'国内/国际',opts:['全部','国内','国际']},
            {label:'是否协议酒店',opts:['全部','是','否']},
            {label:'是否商务及以上房型',opts:['全部','是','否']},
            {label:'是否混付订单',opts:['全部','是','否']},
            {label:'预订多城市酒店',opts:['全部','是','否']},
            {label:'节省类型',opts:['全部','集团协议节省','单体协议节省','OTA节省','拼房节省']},
            {label:'酒店集团',opts:['全部','华住集团','锦江集团','雅高集团','首旅如家','洲际集团','万豪集团','金沙集团']},
            {label:'所在城市',type:'text',ph:'城市'},
            {label:'酒店名称',type:'text',ph:'酒店名称'},
            {label:'出行人',type:'text',ph:'姓名/员工编号'},
            {label:'订单号',type:'text',ph:'销售/出票订单号'},
            {label:'入住时间',type:'date'},
            {label:'交易完成时间',type:'date'} ])
        + '<div class="sec-title mt">酒店消费明细 <span class="new-tag">新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">字段取全，表格可<b>左右滚动</b>查看；导出 / 下穿订单受<b>数据权限约束 + 量级控制</b>（遵循全局导出原则）。</div>'
        + tableW(thead(cols)+rows.map(function(r){return trow(r);}).join(''))
        + moreBar(913,183)
        + reqbox([ {t:'<b>新增</b>：消费与节省明细 · 酒店，数据源 <b>HotelConsumptionDetail</b>，字段取全 + 枚举全可筛选，用于查看筛选 + 导出 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},
    'detail-train': { crumb:'消费与节省明细_火车票', render:function(){
      var cols=['销售订单号','出票订单号','使用时间','交易完成时间','出行人','员工编号','预订人','所属公司','核算单元','成本中心','部门','因公/因私','坐席类型','坐席分类','是否商务及以上坐席','出发城市','到达城市','火车票消费金额','票面价','超标订单支付','外部企业'];
      var rows=[
        ['TR26031200181','OR26031200181','2026-03-12 09:30','2026-03-12 10:35','张磊','E001234','周斌','示例科技有限公司','华东核算单元','成本中心A','市场部','因公','二等座','二等座','否','上海','杭州','73.00','73.00','0.00','—'],
        ['TR26032500233','OR26032500233','2026-03-25 18:00','2026-03-25 19:10','李强','E002871','郭红','示例科技有限公司','华南核算单元','成本中心B','销售部','因公','一等座','一等座','否','广州','深圳','99.50','99.50','0.00','—'],
        ['TR26041000455','OR26041000455','2026-04-10 14:20','2026-04-10 15:00','王敏','E003355','孙燕','示例制造集团','华北核算单元','成本中心C','研发部','因公','商务座','一等座','是','北京','天津','218.00','218.00','120.00','—'],
        ['TR26050500899','OR26050500899','2026-05-05 20:10','2026-05-05 21:30','陈静','E005233','胡军','示例物流有限公司','西南核算单元','成本中心D','供应链部','因公','二等座','二等座','否','成都','重庆','154.00','154.00','0.00','外部-示例供应商A']
      ];
      return jumpBanner('train')+'<div class="callout">📄 <b>消费与节省明细 · 火车票</b>：用于<b>火车票消费明细的查看筛选与导出</b>，数据来源 <b>TrainConsumptionDetail（火车消费明细表）</b>，按业务线分开。字段取全、枚举项均可筛选。</div>'
        + dFilters([
            {label:'因公/因私',opts:['全部','因公','因私']},
            {label:'坐席类型',opts:['全部','商务座','特等座','一等座','二等座','软卧','硬卧','无座','其他']},
            {label:'坐席分类',opts:['全部','一等座','二等座','硬卧','其他']},
            {label:'是否商务及以上坐席',opts:['全部','是','否']},
            {label:'出发城市',type:'text',ph:'城市'},
            {label:'到达城市',type:'text',ph:'城市'},
            {label:'出行人',type:'text',ph:'姓名/员工编号'},
            {label:'订单号',type:'text',ph:'销售/出票订单号'},
            {label:'使用时间',type:'date'},
            {label:'交易完成时间',type:'date'} ])
        + '<div class="sec-title mt">火车票消费明细 <span class="new-tag">新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">字段取全，表格可<b>左右滚动</b>查看；导出 / 下穿订单受<b>数据权限约束 + 量级控制</b>（遵循全局导出原则）。</div>'
        + tableW(thead(cols)+rows.map(function(r){return trow(r);}).join(''))
        + moreBar(204,41)
        + reqbox([ {t:'<b>新增</b>：消费与节省明细 · 火车票，数据源 <b>TrainConsumptionDetail</b>，字段取全 + 枚举全可筛选，用于查看筛选 + 导出 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},
    'detail-car': { crumb:'消费与节省明细_用车', render:function(){
      var cols=['销售订单号','出票订单号','使用时间','交易完成时间','出行人','员工编号','预订人','所属公司','核算单元','成本中心','部门','因公/因私','用车类型','用车车型','同城/跨城','是否商务及以上车型','用车消费金额','超标订单支付','是否有损取消','外部企业'];
      var rows=[
        ['CA26031200181','OR26031200181','2026-03-12 06:30','2026-03-12 07:10','张磊','E001234','周斌','示例科技有限公司','华东核算单元','成本中心A','市场部','因公','接送机','舒适','同城','否','58.00','0.00','否','—'],
        ['CA26032500233','OR26032500233','2026-03-25 21:15','2026-03-25 21:50','李强','E002871','吴刚','示例科技有限公司','华南核算单元','成本中心B','销售部','因公','实时','经济','同城','否','32.00','0.00','否','—'],
        ['CA26041000455','OR26041000455','2026-04-10 12:40','2026-04-10 14:00','王敏','E003355','孙燕','示例制造集团','华北核算单元','成本中心C','研发部','因公','预约','商务','跨城','是','320.00','80.00','否','—'],
        ['CA26042200677','OR26042200677','2026-04-22 08:05','2026-04-22 08:30','刘洋','E004102','朱琳','示例制造集团','华北核算单元','成本中心C','行政部','因私','接送站','经济','同城','否','26.00','0.00','是','外部-示例租赁B']
      ];
      return jumpBanner('car')+'<div class="callout">📄 <b>消费与节省明细 · 用车</b>：用于<b>用车消费明细的查看筛选与导出</b>，数据来源 <b>CarConsumptionDetail（用车消费明细表）</b>，按业务线分开。字段取全、枚举项均可筛选。</div>'
        + dFilters([
            {label:'因公/因私',opts:['全部','因公','因私']},
            {label:'用车类型',opts:['全部','接送站','接送机','实时','预约','包车日租','租车']},
            {label:'用车车型',opts:['全部','豪华','商务','舒适','经济']},
            {label:'同城/跨城',opts:['全部','同城','跨城']},
            {label:'是否商务及以上车型',opts:['全部','是','否']},
            {label:'是否有损取消',opts:['全部','是','否']},
            {label:'出行人',type:'text',ph:'姓名/员工编号'},
            {label:'订单号',type:'text',ph:'销售/出票订单号'},
            {label:'使用时间',type:'date'},
            {label:'交易完成时间',type:'date'} ])
        + '<div class="sec-title mt">用车消费明细 <span class="new-tag">新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">字段取全，表格可<b>左右滚动</b>查看；导出 / 下穿订单受<b>数据权限约束 + 量级控制</b>（遵循全局导出原则）。</div>'
        + tableW(thead(cols)+rows.map(function(r){return trow(r);}).join(''))
        + moreBar(168,34)
        + reqbox([ {t:'<b>新增</b>：消费与节省明细 · 用车，数据源 <b>CarConsumptionDetail</b>，字段取全 + 枚举全可筛选，用于查看筛选 + 导出 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},
    'priv-all': { crumb:'因私报告_因私出行', render:function(){
      var rows=[
        {n:'机票',  amt:'86,000元',  pct:'37.0%', yoy:8.2,  mom:-3.5, ppl:'42', prod:'58 张',   avg:'1,483元'},
        {n:'酒店',  amt:'124,000元', pct:'53.4%', yoy:15.4, mom:2.1,  ppl:'51', prod:'310 间夜', avg:'400元'},
        {n:'火车票',amt:'9,800元',   pct:'4.2%',  yoy:-6.0, mom:-1.2, ppl:'33', prod:'46 张',   avg:'213元'},
        {n:'用车',  amt:'12,400元',  pct:'5.3%',  yoy:11.0, mom:4.3,  ppl:'60', prod:'520 次',  avg:'23.8元'}
      ];
      return '<div class="callout danger">🔒 <b>因私报告</b>为消费者隐私数据专项报告：仅展示<b>聚合指标</b>，不可下钻、无组织/个人维度拆分、不提供明细导出。<b>整张报告可见性独立配置</b>（建议仅高管 / 合规角色可见），与各消费报告权限解耦——开通本报告即可见全部业务线因私聚合指标；不开通则各消费报告内均不再出现因私模块。</div>'
        + '<div class="sec-title mt">因私出行总览（全业务线汇总）</div>'
        + '<div class="kpi-grid">'
        +   '<div class="kpi"><div class="k">因私 · 总消费金额</div><div class="v">232,200元</div><div style="margin-top:8px;font-size:12px;color:#909399">同比 '+yoy(11.8)+' &nbsp;·&nbsp; 环比 '+yoy(0.8)+'</div></div>'
        +   '<div class="kpi"><div class="k">涉及业务线</div><div class="v">4 条</div><div style="margin-top:8px;font-size:12px;color:#c0c4cc">同比 — &nbsp;·&nbsp; 环比 —</div></div>'
        +   '<div class="kpi"><div class="k">因私 · 使用人数（去重）</div><div class="v">96 人</div><div style="margin-top:8px;font-size:12px;color:#909399">同比 '+yoy(6.5)+' &nbsp;·&nbsp; 环比 '+yoy(-2.0)+'</div></div>'
        +   '<div class="kpi"><div class="k">因私 · 订单/产品总数</div><div class="v">934</div><div style="margin-top:8px;font-size:12px;color:#909399">同比 '+yoy(9.1)+' &nbsp;·&nbsp; 环比 '+yoy(1.5)+'</div></div>'
        + '</div>'
        + '<div class="sec-title mt">分业务线因私明细（含同比 / 环比 <span class="new-tag">新增</span>）</div>'
        + '<div class="hint">同比＝本期 vs 上年同期（消费金额）；环比＝本期 vs 上一周期。口径同消费报告，仅做跨业务线汇总。</div>'
        + tableW(thead(['业务线','因私消费金额','消费占比','同比','环比','使用人数（人次）','产品/订单数','均价'])
            + rows.map(function(r){return trow([r.n,r.amt,r.pct,yoy(r.yoy),yoy(r.mom),r.ppl,r.prod,r.avg]);}).join('')
            + trow(['合计','232,200元','100%',yoy(11.8),yoy(0.8),'186 人次','934','—'], true))
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">因私消费金额（按业务线）</div>'
        +     vbar([{label:'酒店',val:124000,disp:'124,000'},{label:'机票',val:86000,disp:'86,000'},{label:'用车',val:12400,disp:'12,400'},{label:'火车票',val:9800,disp:'9,800'}],{color:C.blue,barw:48})+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">因私消费占比</div>'
        +     donut([{pct:53.4,color:C.blue},{pct:37.0,color:C.orange},{pct:5.3,color:C.purple},{pct:4.3,color:C.teal}],[{color:C.blue,label:'酒店(53.4%)'},{color:C.orange,label:'机票(37.0%)'},{color:C.purple,label:'用车(5.3%)'},{color:C.teal,label:'火车票(4.2%)'}])+'</div>'
        + '</div>'
        + '<div class="scene-note" style="margin-top:24px"><b>口径与权限说明：</b>「因私出行」指员工通过差旅平台预订、标记为<b>因私</b>的出行消费（如周末私人行程等）。该类数据属消费者个人隐私，原分散在各消费报告业务线区块中，现统一收口到本「因私报告」。<b>可见性按角色单独授权</b>，与消费报告解耦；指标口径与原消费报告一致，仅做跨业务线汇总，不新增下钻与明细。</div>'
        + reqbox([ R1(),
            {t:'<b>需求13</b>：因私出行从<b>各消费报告业务线迁出</b>，独立成「因私报告」（仅聚合指标 · 不可下钻 · 权限独立配置）— ✅本页已落地', id:'2502913', tag:'新增'},
            {t:'<b>需求18</b>：因私总览 KPI 与分业务线明细表增加<b>同比 / 环比</b>（口径同趋势表）— ✅本页已落地', id:'2502918', tag:'新增'},
            {t:'因私报告可见性独立开关（建议默认仅高管/合规可见，与消费报告权限解耦）', id:'2502914', tag:'新增'} ]);
    }},

    'comp-air': { crumb:'合规报告_机票', render:function(){
      return '<div class="pg-tabs"><span class="active">员工</span><span>成本中心</span><span>核算主体</span></div>'
        + '<div class="row">'
        +   '<div style="flex:1;min-width:280px">'+card('机票疑似退款至个人账户订单数(仅国内)', bigv('0')+subs(['订单总金额 <b>null</b>']))
        +     '<div style="margin-top:12px">'+card('机票-疑似退款至个人账户 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','退款至个人订单数','订单总金额'])+trow(['<span style="color:#c0c4cc">无符合条件的数据</span>','','',''])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('机票疑似退款至个人账户',['员工预订机票后通过航司直接退票/改签，款项可能直接退入员工个人账户。','<b>私退</b>：未经差旅壹号办理退票，票号状态更新为"退票"，但退款可能直退个人。','<b>私改</b>：未经差旅壹号办理改签，票号状态更新为"换开"，后续退票款项可能直退个人。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('机票疑似退款至个人 TOP10', '<div class="placeholder" style="padding:24px">⭐<br>图表无符合条件的数据</div>')+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px">'+card('未出行客票订单数', bigv('1')+subs(['订单总金额 <b>-70.00元</b>']))
        +     '<div style="margin-top:12px">'+card('机票-未出行客票 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','未出行机票张数','订单总金额'])+trow(['王敏','20160721222940752334','1','-70.00元'])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('未出行客票',['员工预订机票后，监测到机票未使用且未办理退款的情况。','<b>未出行客票</b>：未经差旅壹号办理退票，且票号状态仍为"未使用"，判断对应机票可能存在未出行且未办理退票。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('未出行客票 TOP10', vbar([{label:'王敏',val:1,disp:'1'}],{color:C.blue,barw:40}))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">机票疑似异常订单明细</div>'
        + tableW(thead(['销售订单号','交易完成时间','机票疑似异常场景','票号状态','消费者姓名','员工编号','所属公司','票号','航线','航司','起飞时间'])
            + trow(['260330073006666327','2026-3-30','存在未出行客票','OPEN_FOR_USE','王敏','20160721222940752334','四川示例企业集团有限公司','7812146323430','上海-北京','东航','2026-3-28 7:00']))
        + reqbox([ R1(),
            {t:'<b>需求7</b>：超标消费明细数/超标率/超标个人支付 已落到<b>消费报告四业务线</b>「超标情况」表（可按企业配置）', id:'2602770', tag:'新增'},
            {t:'合规报告 UI 优化（字段排序）', id:'2503284', tag:'优化'},
            {t:'同天订单检测未展示数据修复', id:'2501177', tag:'已发布'} ]);
    }},
    'comp-hotel': { crumb:'合规报告_酒店', render:function(){
      return '<div class="callout">免责声明：疑似酒店行程冲突、同天多入住结果由大数据分析及算法模型生成，不保证完整性、准确性。</div>'
        + '<div class="row">'
        +   '<div style="flex:1;min-width:280px">'+card('疑似酒店行程冲突-预估浪费间夜', bigv('18')+subs(['预估浪费金额 <b>12,230.50元</b>']))
        +     '<div style="margin-top:12px">'+card('预估浪费间夜 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','预估浪费间夜','预估浪费金额'])
              + trow(['王敏','20160721222940752334','9','3,858.00元'])
              + trow(['李强','20160615092159473114','3','5,637.00元'])
              + trow(['刘洋','20190218162611176186','3','1,326.00元'])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('疑似酒店行程冲突',['员工预订酒店后，在入离时间内存在其他城市的机票/火车/用车订单，判断为疑似酒店行程冲突。','<b>提前离店</b>：入离时间内有其他城市关联行程且未退酒店间夜。','<b>中途离开</b>：入住后存在其他城市关联行程且未退间夜。','<b>推迟入住</b>：到达酒店城市的行程晚于入住时间，且未退间夜。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('预估浪费间夜 TOP10', vbar([{label:'王敏',val:9},{label:'李强',val:3},{label:'刘洋',val:3},{label:'张磊',val:2},{label:'杨帆',val:1}],{color:C.blue,barw:34}))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">疑似酒店行程冲突异常订单明细</div>'
        + tableW(thead(['销售订单号','疑似异常场景','疑似异常原因','订单状态','预订人','入住人','是否拼房','关联行程单号','企业名称','所属部门'])
            + trow(['2601021011423935331','酒店行程冲突','提前离店','已完成','王敏','王敏','未拼房','260102103348666238','四川示例企业','国内营销中心/央客一部'])
            + trow(['2601151036016187303','酒店行程冲突','推迟入住','已完成','刘洋','刘洋','未拼房','260116195848639101','四川示例企业','总经办'])
            + trow(['2602111416176657771','酒店行程冲突','推迟入住','已完成','王敏','王敏','未拼房','260211151724557263','四川示例企业','国内营销中心/央客一部']))
        + moreBar(12,3)
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px">'+card('同天入住多酒店间夜数', bigv('37')+subs(['订单总金额 <b>17,549.00元</b>']))
        +     '<div style="margin-top:12px">'+card('酒店-同天入住多酒店 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','预订间夜数','订单总金额'])
              + trow(['王敏','20160721222940752334','17','7,628.00元'])
              + trow(['张磊','20200512192146904199','9','4,988.00元'])
              + trow(['陈静','20260423093146093545','3','1,013.00元'])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('同天入住多酒店',['员工预订酒店时，为同一入住人预订多酒店间夜，且预订间夜时间范围内同一天存在多个酒店订单，判断该订单未同天入住多酒店订单。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('同天入住多酒店 TOP10', vbar([{label:'王敏',val:17},{label:'张磊',val:9},{label:'陈静',val:3},{label:'李强',val:3},{label:'何勇',val:3},{label:'高翔',val:2}],{color:C.blue,barw:30}))+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px">'+card('超标订单预订间夜', bigv('13 间夜')+subs(['超标订单量 <b>9</b>','差标外企业支付金额 <b>0.00元</b>'])
              + '<div class="jump-tag js-jump" data-line="hotel" data-from="超标情况(合规·酒店)" data-conds="订单类型::出票(ProductSubTypeName=1)~~超标订单::是(IsReasonCodeOrder=1)~~超标金额::&gt;0~~交易时间::2026年1月01日 — 2026年6月08日">↳ 下穿消费与节省明细（带超标条件）</div>'
              + '<div class="sec-title mt">超标订单预订间夜 TOP10</div>'+vbar([{label:'林涛',val:7},{label:'罗霞',val:2},{label:'郑伟',val:1},{label:'王敏',val:1},{label:'梁静',val:1},{label:'谢峰',val:1}],{color:C.blue,barw:28}))+'</div>'
        +   '<div style="flex:1;min-width:300px">'+card('无申请单预订间夜', bigv('114 间夜')+subs(['无申请单预订间夜占比 <b>14.88%</b>','无申请单酒店消费金额 <b>145,201.85</b>'])
              + '<div class="sec-title mt">无申请单预订间夜 TOP10</div>'+vbar([{label:'李强',val:39},{label:'宋娟',val:34},{label:'刘洋',val:15},{label:'唐明',val:6},{label:'许波',val:6},{label:'韩冰',val:5},{label:'冯阳',val:5},{label:'高翔',val:2},{label:'邓超',val:2}],{color:C.blue,barw:26}))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">各组织酒店消费情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','所属部门','酒店消费金额','消费金额占比','入住间夜','间均价','酒店退订消费金额','退订间夜','高档酒店预订间夜'])
              + trow(['四川示例企业','总经办','144,867.85元','42.03%','130','1,456.19','-18,225.10元','18','75'])
              + trow(['四川示例企业','客户成功中心','33,566.33元','9.74%','87','485.16','-3,791.00元','10','63'])
              + trow(['四川示例企业','国内营销中心/央客一部','28,160.22元','8.17%','74','488.21','-4,550.00元','7','35'])),
            orgDist('核算主体',['核算主体','酒店消费金额','消费金额占比','入住间夜'],[344643.45,100,627],{dec:[2,2,0],suf:['元','%',''],tail:[{h:'间均价',val:'549.42'}]}),
            orgDist('成本中心',['成本中心','酒店消费金额','消费金额占比','入住间夜'],[344643.45,100,627],{dec:[2,2,0],suf:['元','%',''],tail:[{h:'间均价',val:'549.42'}]})
          ])
        + reqbox([ R1(),
            {t:'合规报告 UI 优化（字段排序 + <b>酒店筛选</b>）', id:'2503284', tag:'新增'},
            {t:'调整疑似酒店行程冲突检测判断逻辑', id:'2501892', tag:'已发布'} ]);
    }},
    'comp-train': { crumb:'合规报告_火车票', render:function(){
      return '<div class="pg-tabs"><span class="active">员工</span><span>成本中心</span><span>核算主体</span></div>'
        + '<div class="row">'
        +   '<div style="flex:1;min-width:300px">'+card('商务级坐席出票张数', bigv('7张')+subs(['商务级坐席出票占比 <b>1.97%</b>','商务级坐席出票金额 <b>10,369.00元</b>'])
              + '<div class="hint">注：商务级坐席包含"商务座、特等座、高级动卧、高级软卧"。</div>'
              + '<div class="sec-title mt">商务级坐席出票张数 TOP10</div>'+vbar([{label:'张磊',val:6},{label:'王敏',val:1},{label:'曹颖',val:0},{label:'陈静',val:0},{label:'彭勇',val:0},{label:'曾敏',val:0}],{color:C.blue,barw:26}))+'</div>'
        +   '<div style="flex:1;min-width:300px">'+card('火车票退改张数', bigv('71张')+subs(['退改率 <b>16.67%</b>','火车票退改费 <b>643.50元</b>'])
              + '<div class="sec-title mt">退改手续费 TOP10</div>'+vbar([{label:'田甜',val:198.5,disp:'198.50'},{label:'董丽',val:93.5,disp:'93.50'},{label:'袁刚',val:80.5,disp:'80.50'},{label:'潘婷',val:67.5,disp:'67.50'},{label:'于飞',val:64,disp:'64.00'},{label:'蒋敏',val:36,disp:'36.00'},{label:'蔡勇',val:27.5,disp:'27.50'},{label:'郑伟',val:21.5,disp:'21.50'},{label:'余静',val:20.5,disp:'20.50'},{label:'杜鹏',val:12.5,disp:'12.50'}],{color:C.blue,barw:24}))+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px">'+card('超标订单出票张数', bigv('9张')+subs(['超标订单出票消费金额 <b>5,987.01</b>','差标外企业支付金额 <b>3,384.00元</b>'])
              + '<div class="sec-title mt">超标订单出票张数 TOP10</div>'+vbar([{label:'张磊',val:4},{label:'郑伟',val:1},{label:'任倩',val:1},{label:'程磊',val:1},{label:'苏丽',val:1},{label:'卫强',val:1}],{color:C.blue,barw:28}))+'</div>'
        +   '<div style="flex:1;min-width:300px">'+card('无申请单出票张数', bigv('4张')+subs(['无申请单出票张数占比 <b>1.13%</b>','无申请单火车消费金额 <b>508</b>'])
              + '<div class="sec-title mt">无申请单出票 TOP10</div>'+vbar([{label:'李强',val:2},{label:'唐明',val:1},{label:'苏丽',val:1}],{color:C.blue,barw:34}))+'</div>'
        + '</div>'
        + reqbox([ R1() ]);
    }},
    'comp-car': { crumb:'合规报告_用车', render:function(){
      return '<div class="row">'
        +   '<div style="flex:1;min-width:280px">'+card('用车疑似异常订单量', bigv('97')+subs(['疑似异常订单支付金额 <b>4,359.32元</b>']))
        +     '<div style="margin-top:12px">'+card('疑似异常用车 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','疑似异常订单量','支付金额'])
              + trow(['吕娜','20230308123009041000','51','2,346.00元'])
              + trow(['丁勇','20210111091730098126','16','435.79元'])
              + trow(['李强','20160615092159473114','9','431.68元'])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('用车疑似异常订单',['目前仅针对实时用车订单，在实时用车时通过消费者自身定位与上车地点数据通过模型进行判断。','<b>发单位置异常</b>：下单人所处位置与订单上车位置偏差 ≥10公里。','<b>发单城市异常</b>：下单人所处位置与上车位置非同一城市。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('疑似异常用车 TOP10', vbar([{label:'吕娜',val:51},{label:'丁勇',val:16},{label:'李强',val:9},{label:'龚静',val:4},{label:'张磊',val:3},{label:'沈强',val:1},{label:'曹颖',val:1},{label:'郑伟',val:1},{label:'范涛',val:1},{label:'方敏',val:1}],{color:C.blue,barw:24}))+'</div>'
        + '</div>'
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:280px">'+card('总金额异常订单量', bigv('65')+subs(['总金额异常订单支付金额 <b>11,847.23元</b>']))
        +     '<div style="margin-top:12px">'+card('总金额异常订单 TOP3 消费者', tableW(thead(['消费者姓名','员工编号','总金额异常订单量','支付金额'])
              + trow(['李强','20160615092159473114','21','4,015.26元'])
              + trow(['张磊','20200512192146904199','12','2,235.57元'])
              + trow(['王敏','20160721222940752334','6','1,322.00元'])))+'</div></div>'
        +   '<div style="flex:1;min-width:300px">'+card('场景说明', scene('总金额异常订单',['订单存在预估价与实际支付车费（不含高速、路桥等附加费）偏差超过正常波动阈值，则标记为总金额异常订单。','<b>总金额异常订单</b>：当实际支付金额>100元，且实际支付车费与预估车费之间偏差率>20%。']))+'</div>'
        +   '<div style="flex:1;min-width:280px">'+card('总金额异常订单量 TOP10', vbar([{label:'李强',val:21},{label:'张磊',val:12},{label:'王敏',val:6},{label:'郑伟',val:5},{label:'石磊',val:4},{label:'姚伟',val:3},{label:'卢敏',val:2},{label:'钟强',val:1},{label:'汪磊',val:1},{label:'戴勇',val:1}],{color:C.blue,barw:24}))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">用车疑似异常订单明细</div>'
        + tableW(thead(['销售订单号','交易完成时间','用车疑似异常场景类型','预订人','消费者姓名','员工编号','所属公司','上车地址'])
            + trow(['2605131645441391033','2026-5-13','上车地址和乘客定位直线距离相差10km以上','李强','李强','20160615092159473114','四川示例企业','山东省威海市环翠区龙汇福邸西门'])
            + trow(['2603061831388181013','2026-3-06','上车地址和乘客定位直线距离相差10km以上','张磊','张磊','20200512192146904199','四川示例企业','北京市朝阳区日坛国际贸易中心'])
            + trow(['2605011241005511013','2026-5-01','上车地址和乘客定位直线距离相差10km以上','张磊','张磊','20200512192146904199','四川示例企业','北京市顺义区首都国际机场3号航站楼']))
        + moreBar(97,10)
        + reqbox([ R1(),
            {t:'用车疑似异常订单统计（发单位置/城市异常）', id:'—', tag:'优化'} ]);
    }},

    'save-all': { crumb:'节约报告_整体', render:function(){
      return '<div class="save-grid">'
        + card('机酒节省金额', bigv('32,762.91元')+subs(['机酒节省率 <b>4.48%</b>']))
        + card('机酒节省金额分布', donut([{pct:61.48,color:C.orange},{pct:38.52,color:C.blue}],[{color:C.blue,label:'机票(38.52%)'},{color:C.orange,label:'酒店(61.48%)'}]))
        + card('机酒潜在节省金额', bigv('40,655.9元')+subs(['机票潜在节省 <b>38,940元 (95.78%)</b>','酒店潜在节省 <b>1,715.90元 (4.22%)</b>']))
        + card('机票节省金额', bigv('12,620.81元')+subs(['机票节省率 <b>2.44%</b>']))
        + card('机票节省金额分布', donut([{pct:100,color:C.purple}],[{color:C.purple,label:'协议出票节省(100%)'}]))
        + card('机票潜在节省金额', bigv('38,940元')+subs(['超标潜在 <b>490元 (1.26%)</b>','退票潜在 <b>1,082元 (2.78%)</b>','改签潜在 <b>37,368元 (95.96%)</b>']))
        + card('酒店节省金额', bigv('20,142.1元')+subs(['酒店节省率 <b>9.35%</b>']))
        + card('酒店节省金额分布', donut([{pct:65.67,color:C.orange},{pct:30.31,color:C.blue},{pct:4.02,color:C.teal}],[{color:C.orange,label:'OTA节省(65.67%)'},{color:C.blue,label:'集团协议节省(30.31%)'},{color:C.teal,label:'拼房节省(4.02%)'}]))
        + card('酒店潜在节省金额', bigv('1,715.9元')+subs(['超标潜在 <b>1,559元 (90.86%)</b>','取消潜在 <b>156.90元 (9.14%)</b>']))
        + '</div>'
        + compareSection()
        + reqbox([ R1(),
            {t:'<b>节约金额按比价类型分类</b>展示（明细增节省来源字段）', id:'2603023', tag:'新增'},
            {t:'<b>节约金额导出明细</b>（按笔记录导出）', id:'2600525', tag:'新增'},
            {t:'新增<b>超标弹窗记录</b>、统计风控触发次数', id:'2602770', tag:'新增'} ]);
    }},

    'save-air': { crumb:'节约报告_机票', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return '<div class="hint">更多差旅报告数据说明，可点击查看：<a style="color:#1e96f2">点击查看</a></div>'
        + '<div class="save-grid">'
        + card('机票节省金额', bigv('12,620.81元')+subs(['SME共享节省 <b>12,620.81元</b>'])+'<div class="jump-tag js-jump" data-line="air" data-from="机票节省金额" data-conds="节省类型::全部~~交易时间::2026年1月01日 — 2026年6月08日">↳ 跳转消费与节省明细</div>')
        + card('对标票均节省', '<table class="tbl"><tr><th>对标类型</th><th>票均节省金额</th><th>票均节省率</th></tr><tr><td>贵司</td><td>2,240.53元</td><td>17.30%</td></tr><tr><td>商旅</td><td>121.21元</td><td>9.96%</td></tr></table>')
        + card('机票节省金额分布', donut([{pct:100,color:C.purple}],[{color:C.purple,label:'协议出票节省(100%)'}]))
        + '</div>'
        + '<div class="sec-title mt">机票节省趋势（机票节省率）</div>'
        + vbar([{label:'2026-1',val:9.81,disp:'9.81%'},{label:'2026-2',val:23.40,disp:'23.40%'},{label:'2026-3',val:31.34,disp:'31.34%'},{label:'2026-4',val:6.79,disp:'6.79%'},{label:'2026-5',val:7.81,disp:'7.81%'},{label:'2026-6',val:0,disp:'0.00%'}],{color:C.blue,unit:'%',barw:40})
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">机票潜在节省金额 38,940元 <span class="jump-tag js-jump" data-line="air" data-from="机票潜在节省金额" data-conds="潜在节省类型::全部~~交易时间::2026年1月01日 — 2026年6月08日">↳ 跳转消费与节省明细</span></div>'
        +     donut([{pct:95.96,color:C.blue},{pct:2.78,color:C.orange},{pct:1.26,color:C.purple}],[{color:C.blue,label:'机票改签(95.96%)'},{color:C.orange,label:'机票退票(2.78%)'},{color:C.purple,label:'机票超标订单支付(1.26%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">潜在节省明细 <span class="opt-tag">点击行跳转消费与节省明细</span></div>'+tableW(thead(['潜在节省类型','潜在节省金额','占比','票均潜在节省'])
              + drillRowSave('机票改签','air',34,['机票改签','37,368.00元','95.96%','1,099.06元'])
              + drillRowSave('机票退票','air',7,['机票退票','1,082.00元','2.78%','154.57元'])
              + drillRowSave('机票超标订单支付','air',157,['机票超标订单支付','490.00元','1.26%','3.12元']))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">机票潜在节省趋势</div>'
        + vbar([{label:'2026-1',val:28757,disp:'28,757'},{label:'2026-2',val:3133,disp:'3,133'},{label:'2026-3',val:2249,disp:'2,249'},{label:'2026-4',val:1537,disp:'1,537'},{label:'2026-5',val:3264,disp:'3,264'},{label:'2026-6',val:0,disp:'0'}],{color:C.blue,unit:'元',barw:40})
        + '<div class="sec-title mt">各组织机票节省情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','机票节省金额','机票节省金额占比','机票节省率','机票协议出票节省金额','机票协议退改节省金额','GP机票节省金额','机票差标管控节省金额'])
              + trow(['四川示例企业集团有限公司','12,620.81元','100%','22.49%','12,620.81元','0.00元','0.00元','0.00元'])),
            orgDist('核算主体',['核算主体','机票节省金额','机票节省金额占比','机票协议出票节省金额'],[12620.81,100,12620.81],{dec:[2,2,2],suf:['元','%','元'],tail:[{h:'机票节省率',val:'22.49%'}]}),
            orgDist('成本中心',['成本中心','机票节省金额','机票节省金额占比','机票协议出票节省金额'],[12620.81,100,12620.81],{dec:[2,2,2],suf:['元','%','元'],tail:[{h:'机票节省率',val:'22.49%'}]})
          ])
        + '<div class="sec-title mt">提前预订天数分布</div>'
        + '<div class="hint">合理安排贵司的机票提前预订天数，将为您带来节省约 <b>0</b> 元（仅计算国内经济舱）。</div>'
        + tableW(thead(['机票提前预订天数区间','出票张数','出票张数占比','成交净价','里程均价','票均折扣','票均折扣(国内_经济舱)'])
            + trow(['1-1','55','22.73%','59,692.00元','0.96','0.29','0.38'])
            + trow(['2-4','89','36.78%','128,693.00元','0.98','0.28','0.38'])
            + trow(['≥15','41','16.94%','224,359.00元','1.75','0.65','-'])
            + trow(['≥5','57','23.55%','129,620.00元','1.62','0.29','0.38']))
        + '<div class="sec-title mt">各组织机票潜在节省情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','潜在节省金额','潜在节省金额占比','超标订单潜在节省金额','退票潜在节省金额','改签潜在节省金额'])
              + trow(['四川示例企业集团有限公司','38,940.00元','100%','490.00元','1,082.00元','37,368.00元'])),
            orgDist('核算主体',['核算主体','潜在节省金额','潜在节省金额占比','超标订单潜在节省','退票潜在节省','改签潜在节省'],[38940,100,490,1082,37368],{dec:[0,2,0,0,0],suf:['元','%','元','元','元']}),
            orgDist('成本中心',['成本中心','潜在节省金额','潜在节省金额占比','超标订单潜在节省','退票潜在节省','改签潜在节省'],[38940,100,490,1082,37368],{dec:[0,2,0,0,0],suf:['元','%','元','元','元']})
          ])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">成交净价分布</div><div class="hint">成交净价高于1500元的出票占比高于商旅平均水平，请关注。</div>'
        +     lineChart(['0-300','300-600','600-900','900-1200','1200-1500','1500+'],[{name:'出票占比(贵司)',color:C.blue,vals:[0.82,10.25,11.48,9.02,11.07,57.38]},{name:'出票占比(商旅)',color:C.orange,vals:[21.63,29,19.47,11.07,17.26,17.26]}])+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">里程均价分布</div><div class="hint">里程均价高于1.25元的出票占比高于商旅平均水平，请关注。</div>'
        +     lineChart(['0-0.25','0.25-0.5','0.5-0.75','0.75-1.0','1.0-1.25','1.25-1.5','≥1.5'],[{name:'出票占比(贵司)',color:C.blue,vals:[2.53,16.88,13.08,16.88,21.1,10.97,18.57]},{name:'出票占比(商旅)',color:C.orange,vals:[2.53,29.24,30.99,16.88,8.78,5.26,6.93]}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">票均折扣分布</div><div class="hint">无折扣出票占比高于商旅平均水平，请关注。</div>'
        + lineChart(['0-0.09','0.1-0.19','0.2-0.29','0.3-0.39','0.4-0.49','0.5-0.59','0.6-0.69','0.7-0.79','0.8-0.89','0.9-0.99','1.0'],[{name:'出票占比(贵司)',color:C.blue,vals:[1.59,3.36,33.61,14.21,7.79,5.33,1.23,1.23,1.64,4.51,4.51]},{name:'出票占比(商旅)',color:C.orange,vals:[9.43,12.7,15.16,21.09,19.57,12.8,7.38,1.23,1.64,2.51,2.51]}])
        + '<div class="sec-title mt">机票节约明细（按笔） <span class="new-tag">需求3 新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">支持按笔查看 / 导出，并可<b>下穿消费报表</b>核对原始订单；权限与报告数据权限一致。</div>'
        + tableW(thead(['订单号','出行人','出行时间','航线','原价','成交价','节约金额','节约来源'])
            + trow(['2603150012345','张磊','2026-03-15','上海-北京','2,180.00','1,850.00','330.00','协议出票节省'])
            + trow(['2603280045612','李强','2026-03-28','成都-深圳','1,560.00','1,320.00','240.00','协议出票节省'])
            + trow(['2604120078934','王敏','2026-04-12','北京-广州','2,640.00','2,210.00','430.00','差标管控节省'])
            + trow(['2604250011267','刘洋','2026-04-25','上海-成都','1,980.00','1,690.00','290.00','协议出票节省'])
            + trow(['2605080045390','陈静','2026-05-08','深圳-上海','2,420.00','2,090.00','330.00','协议出票节省']))
        + moreBar(58,6)
        + compareSection('air')
        + reqbox([ R1(),
            {t:'<b>需求3</b>：节约金额<b>按笔导出明细</b>（订单号/出行人/出行时间/航线/原价/成交价/节约金额/节约来源），<b>潜在节省明细行点击下穿</b>底部穿透表，可导出并下穿消费报表 — ✅本页已落地', id:'2600525', tag:'新增'},
            {t:'<b>国际机票多供应商比价</b>节省金额纳入报告', id:'2503145', tag:'新增'} ]);
    }},

    'save-hotel': { crumb:'节约报告_酒店', render:function(){
      return '<div class="save-grid">'
        + card('酒店节省金额', bigv('20,142.10元')+subs(['酒店节省率 <b>9.35%</b>','全部酒店OTA节省 <b>18,753.10元</b>','差标节省金额 <b>24,258.00元</b>'])+'<div class="jump-tag js-jump" data-line="hotel" data-from="酒店节省金额" data-conds="节省类型::全部~~交易时间::2026年1月01日 — 2026年6月08日">↳ 跳转消费与节省明细</div>')
        + card('对标间均节省', '<table class="tbl"><tr><th>对标类型</th><th>间均节省金额</th><th>间均节省率</th></tr><tr><td>贵司</td><td>26.85元</td><td>6.57%</td></tr><tr><td>商旅</td><td>35.79元</td><td>12.10%</td></tr></table>')
        + card('酒店节省金额分布', donut([{pct:65.67,color:C.orange},{pct:30.31,color:C.blue},{pct:4.02,color:C.teal}],[{color:C.orange,label:'OTA节省(65.67%)'},{color:C.blue,label:'集团协议节省(30.31%)'},{color:C.teal,label:'拼房节省(4.02%)'}]))
        + '</div>'
        + '<div class="sec-title mt">酒店节省类型 <span class="opt-tag">点击行跳转消费与节省明细</span></div>'
        + tableW(thead(['节省类型','酒店节省金额','节省金额占比','间均节省'])
            + jrow('hotel','酒店节省类型',[['节省类型','OTA节省']],['OTA节省','13,228.10元','65.67%','32.82元'])
            + jrow('hotel','酒店节省类型',[['节省类型','拼房节省']],['拼房节省','809.00元','4.02%','19.26元'])
            + jrow('hotel','酒店节省类型',[['节省类型','集团协议节省']],['集团协议节省','6,105.00元','30.31%','47.33元']))
        + '<div class="sec-title mt">酒店节省趋势（标准节省率）</div>'
        + vbar([{label:'2026-1',val:6.28,disp:'6.28%'},{label:'2026-2',val:7.20,disp:'7.20%'},{label:'2026-3',val:16.75,disp:'16.75%'},{label:'2026-4',val:14.38,disp:'14.38%'},{label:'2026-5',val:14.14,disp:'14.14%'},{label:'2026-6',val:3.54,disp:'3.54%'}],{color:C.blue,unit:'%',barw:40})
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">酒店潜在节省金额 1,715.9元 <span class="jump-tag js-jump" data-line="hotel" data-from="酒店潜在节省金额" data-conds="潜在节省类型::全部~~交易时间::2026年1月01日 — 2026年6月08日">↳ 跳转消费与节省明细</span></div>'
        +     donut([{pct:90.86,color:C.blue},{pct:9.14,color:C.orange}],[{color:C.blue,label:'酒店超标订单支付(90.86%)'},{color:C.orange,label:'酒店取消(9.14%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">酒店潜在节省明细 <span class="opt-tag">点击行跳转消费与节省明细</span></div>'+tableW(thead(['潜在节省类型','潜在节省金额','潜在节省占比','间均潜在节省'])
              + drillRowSave('酒店超标订单支付','hotel',32,['酒店超标订单支付','1,559.00元','90.86%','48.72元'])
              + drillRowSave('酒店取消','hotel',69,['酒店取消','156.90元','9.14%','2.27元']))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">酒店潜在节省趋势</div>'
        + vbar([{label:'2026-1',val:0,disp:'0.00'},{label:'2026-2',val:401.90,disp:'401.90'},{label:'2026-3',val:0,disp:'0.00'},{label:'2026-4',val:750,disp:'750.00'},{label:'2026-5',val:564,disp:'564.00'},{label:'2026-6',val:0,disp:'0.00'}],{color:C.blue,unit:'元',barw:40})
        + '<div class="sec-title mt">各组织酒店节省情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','酒店节省金额','酒店节省金额占比','间均节省','集团协议节省金额','单体协议节省金额','OTA节省金额','拼房节省金额'])
              + trow(['四川示例企业集团有限公司','20,142.10元','100%','24.59元','6,105.00元','0.00元','13,228.10元','809.00元'])),
            orgDist('核算主体',['核算主体','酒店节省金额','酒店节省金额占比','集团协议节省金额','OTA节省金额','拼房节省金额'],[20142.10,100,6105,13228.10,809],{dec:[2,2,2,2,2],suf:['元','%','元','元','元'],tail:[{h:'间均节省',val:'24.59元'}]}),
            orgDist('成本中心',['成本中心','酒店节省金额','酒店节省金额占比','集团协议节省金额','OTA节省金额','拼房节省金额'],[20142.10,100,6105,13228.10,809],{dec:[2,2,2,2,2],suf:['元','%','元','元','元'],tail:[{h:'间均节省',val:'24.59元'}]})
          ])
        + '<div class="sec-title mt">各组织酒店潜在节省情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','酒店潜在节省金额','酒店潜在节省占比','酒店超标订单支付潜在节省金额','酒店取消潜在节省金额'])
              + trow(['四川示例企业集团有限公司','1,715.90元','100%','1,559.00元','156.90元'])),
            orgDist('核算主体',['核算主体','酒店潜在节省金额','酒店潜在节省占比','酒店超标订单支付潜在节省','酒店取消潜在节省'],[1715.90,100,1559,156.90],{dec:[2,2,2,2],suf:['元','%','元','元']}),
            orgDist('成本中心',['成本中心','酒店潜在节省金额','酒店潜在节省占比','酒店超标订单支付潜在节省','酒店取消潜在节省'],[1715.90,100,1559,156.90],{dec:[2,2,2,2],suf:['元','%','元','元']})
          ])
        + '<div class="row mt" style="margin-top:30px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">酒店星级分布</div>'
        +     gbar(['二星及以下','三星级','四星级','五星级'],{name:'贵司(入住间夜占比)',color:C.blue,vals:[26.33,30.67,33.05,9.94]},{name:'商旅(入住间夜占比)',color:C.orange,vals:[22.26,31,32,13]},{unit:'%'})+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">间夜均价趋势（贵司 / 商旅）</div>'
        +     lineChart(['0-100','100-200','200-300','300-400','400-500','500-600','700-800','1000-1500','2000以上'],[{name:'贵司',color:C.blue,vals:[10.32,15.07,14.58,28.73,15.55,5.23,0.28,2.06,5.09]},{name:'商旅',color:C.orange,vals:[1.64,27.24,23.52,15.55,4.33,0.28,1.10,0.07,0.07]}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">酒店节约明细（按笔） <span class="new-tag">需求3 新增</span> <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + '<div class="hint">支持按笔查看 / 导出，并可<b>下穿消费报表</b>核对原始订单；节约来源区分 OTA / 集团协议 / 拼房。</div>'
        + tableW(thead(['订单号','出行人','入住时间','酒店','原价','成交价','节约金额','节约来源'])
            + trow(['HO2603120011','张磊','2026-03-12','全季(上海徐家汇)','420.00','360.00','60.00','OTA节省'])
            + trow(['HO2603250023','李强','2026-03-25','成都宽窄巷子城际','680.00','590.00','90.00','集团协议节省'])
            + trow(['HO2604100045','王敏','2026-04-10','北京诺富特','560.00','485.00','75.00','OTA节省'])
            + trow(['HO2604220067','刘洋','2026-04-22','上海静安诺富特','720.00','640.00','80.00','拼房节省'])
            + trow(['HO2605050089','陈静','2026-05-05','深圳希尔顿','880.00','760.00','120.00','集团协议节省']))
        + moreBar(46,5)
        + compareSection('hotel')
        + reqbox([ R1(),
            {t:'<b>需求3</b>：酒店节约金额<b>按笔导出明细</b>（含节约来源），<b>潜在节省明细行点击下穿</b>底部穿透表，可导出并下穿消费报表 — ✅本页已落地', id:'2600525', tag:'新增'},
            {t:'修复酒店节省金额计算（补全 OTA + 单体协议节省）', id:'2500307', tag:'已发布'},
            {t:'<b>需求12②</b>（改）：取消报告内「会计/市场」双口径展示（对企业解释成本高）；改为<b>表单引擎·国内酒店 新增配置「差旅报告酒店节省类型」</b>——选「会计口径」按现状算；选「市场口径」再选会员类型（普通/白银/黄金…），由<b>酒店消费明细 + 基线表新增的分会员档节省字段</b>按配置灵活取数计算，报告只呈现最终节省金额', id:'2600698', tag:'调整'} ]);
    }},

    /* ---------- 需求20：服务商报告（新独立报告，分业务线，与其他报告一致） ---------- */
    'svc-all': { crumb:'服务商报告_整体', render:function(){
      return '<div class="row">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表1 · 服务商金额占比 <span class="new-tag">需求20 新增</span></div>'+donut([{pct:42.56,color:C.blue},{pct:26.73,color:C.orange},{pct:19.32,color:C.teal},{pct:11.39,color:C.purple}],[{color:C.blue,label:'差旅壹号(42.6%)'},{color:C.orange,label:'同程商旅(26.7%)'},{color:C.teal,label:'携程商旅(19.3%)'},{color:C.purple,label:'美团商旅(11.4%)'}])+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表2 · 服务商产品数占比</div>'+donut([{pct:44.35,color:C.blue},{pct:29.14,color:C.orange},{pct:18.21,color:C.teal},{pct:8.30,color:C.purple}],[{color:C.blue,label:'差旅壹号(44.4%)'},{color:C.orange,label:'同程商旅(29.1%)'},{color:C.teal,label:'携程商旅(18.2%)'},{color:C.purple,label:'美团商旅(8.3%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">图表3 · 各服务商金额趋势（万元） <span class="new-tag">需求20 新增</span></div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[78,65,84,79,73,73.8]},
            {name:'同程商旅',color:C.orange,vals:[49,42,53,50,46,44.4]},
            {name:'携程商旅',color:C.teal,vals:[36,30,38,35,33,33.5]},
            {name:'美团商旅',color:C.purple,vals:[21,18,22,20,19,21.2]}])
        + '<div class="sec-title mt">图表4 · 各服务商产品数趋势 <span class="new-tag">需求20 新增</span></div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[4500,3700,4900,4600,4200,4220]},
            {name:'同程商旅',color:C.orange,vals:[3000,2500,3300,3100,2862,2400]},
            {name:'携程商旅',color:C.teal,vals:[1850,1550,2000,1900,1700,1720]},
            {name:'美团商旅',color:C.purple,vals:[850,700,900,800,800,835]}])
        + '<div class="sec-title mt">服务商总览（各业务线金额 + 占比） <span class="new-tag">需求20 新增</span></div>'
        + svcTotalsTable()
        + reqbox([ {t:'<b>需求20</b>：整体页 — 图表1金额占比 / 图表2产品数占比 / 图表3金额&产品数趋势 / 服务商总览表（总额 + 各业务线 金额/占比/同比）— ✅本页已落地', id:'—', tag:'新增'},
            {t:'酒店/火车服务商字段<b>待补</b>，补齐后纳入汇总', id:'—', tag:'新增'} ]);
    }},
    'svc-air': { crumb:'服务商报告_机票', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return '<div class="row">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表1 · 机票服务商金额占比 <span class="new-tag">需求20 新增</span></div>'+donut([{pct:41.76,color:C.blue},{pct:25.76,color:C.orange},{pct:19.76,color:C.teal},{pct:12.72,color:C.purple}],[{color:C.blue,label:'差旅壹号(41.8%)'},{color:C.orange,label:'同程商旅(25.8%)'},{color:C.teal,label:'携程商旅(19.8%)'},{color:C.purple,label:'美团商旅(12.7%)'}])+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表2 · 机票服务商出票张数占比</div>'+donut([{pct:43.81,color:C.blue},{pct:27.36,color:C.orange},{pct:19.22,color:C.teal},{pct:9.61,color:C.purple}],[{color:C.blue,label:'差旅壹号(43.8%)'},{color:C.orange,label:'同程商旅(27.4%)'},{color:C.teal,label:'携程商旅(19.2%)'},{color:C.purple,label:'美团商旅(9.6%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">图表3 · 各服务商机票金额趋势（万元）</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[44,37,48,45,41,41.8]},
            {name:'同程商旅',color:C.orange,vals:[27,23,30,28,26,24.4]},
            {name:'携程商旅',color:C.teal,vals:[21,18,23,21,19,19.5]},
            {name:'美团商旅',color:C.purple,vals:[13,11,15,14,12,13.2]}])
        + '<div class="sec-title mt">图表4 · 各服务商出票张数趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[168,142,184,170,158,158]},
            {name:'同程商旅',color:C.orange,vals:[105,88,116,108,100,95]},
            {name:'携程商旅',color:C.teal,vals:[74,62,82,76,68,68]},
            {name:'美团商旅',color:C.purple,vals:[37,31,40,38,34,35]}])
        + '<div class="sec-title mt">机票服务商对比 <span class="new-tag">需求20 新增</span></div>'
        + '<table class="tbl"><tr><th>服务商</th><th>出票张数</th><th>订单金额</th><th>同比</th><th>退改率</th><th>平均折扣</th><th>客单价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>980</td><td>256.8万元</td><td>'+yoy(9.8)+'</td><td>6.2%</td><td>0.78</td><td>2,620元</td></tr>'
        +   '<tr><td>同程商旅</td><td>612</td><td>158.4万元</td><td>'+yoy(6.4)+'</td><td>5.1%</td><td>0.81</td><td>2,588元</td></tr>'
        +   '<tr><td>携程商旅</td><td>430</td><td>121.5万元</td><td>'+yoy(11.2)+'</td><td>4.3%</td><td>0.74</td><td>2,826元</td></tr>'
        +   '<tr><td>美团商旅</td><td>215</td><td>78.2万元</td><td>'+yoy(-2.1)+'</td><td>8.7%</td><td>0.92</td><td>3,637元</td></tr></table>'
        + '<div class="sec-title mt">各服务商 · 舱等对比（产品数 / 金额 / 均价） <span class="new-tag">需求20 新增</span></div>'
        + '<div style="overflow-x:auto"><table class="tbl">'
        +   '<tr><th rowspan="2">服务商</th><th colspan="3">经济舱</th><th colspan="3">超级经济舱</th><th colspan="3">公务舱</th><th colspan="3">头等舱</th></tr>'
        +   '<tr><th>产品数</th><th>金额</th><th>均价</th><th>产品数</th><th>金额</th><th>均价</th><th>产品数</th><th>金额</th><th>均价</th><th>产品数</th><th>金额</th><th>均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>720</td><td>122.4万</td><td>1,700元</td><td>90</td><td>32.4万</td><td>3,600元</td><td>150</td><td>87.0万</td><td>5,800元</td><td>20</td><td>18.4万</td><td>9,200元</td></tr>'
        +   '<tr><td>同程商旅</td><td>480</td><td>81.6万</td><td>1,700元</td><td>52</td><td>18.2万</td><td>3,500元</td><td>70</td><td>41.0万</td><td>5,850元</td><td>10</td><td>9.2万</td><td>9,200元</td></tr>'
        +   '<tr><td>携程商旅</td><td>320</td><td>54.4万</td><td>1,700元</td><td>60</td><td>21.0万</td><td>3,500元</td><td>45</td><td>25.2万</td><td>5,600元</td><td>5</td><td>4.4万</td><td>8,800元</td></tr>'
        +   '<tr><td>美团商旅</td><td>170</td><td>30.6万</td><td>1,800元</td><td>25</td><td>9.3万</td><td>3,700元</td><td>18</td><td>10.8万</td><td>6,000元</td><td>2</td><td>1.9万</td><td>9,500元</td></tr>'
        + '</table></div>'
        + reqbox([ {t:'<b>需求20</b>：机票服务商 — 金额/出票占比图 + 金额&出票趋势 + 服务商对比表 + <b>舱等子类型对比</b>（经济/超经/公务/头等）；字段 <b>TMCServicerName/ID</b> 已有 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},
    'svc-hotel': { crumb:'服务商报告_酒店', extraFilter: ssField('国内/国际',['全部','国内','仅国际'],''), render:function(){
      return '<div class="callout">说明：酒店现有 <b>HotelGroupName</b> 为「酒店集团」，服务商维度字段待接入；下方为目标版式（与机票一致），数据为示意。</div>'
        + '<div class="row">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表1 · 酒店服务商金额占比 <span class="new-tag">需求20 新增</span></div>'+donut([{pct:43.41,color:C.blue},{pct:27.32,color:C.orange},{pct:18.54,color:C.teal},{pct:10.73,color:C.purple}],[{color:C.blue,label:'差旅壹号(43.4%)'},{color:C.orange,label:'同程商旅(27.3%)'},{color:C.teal,label:'携程商旅(18.5%)'},{color:C.purple,label:'美团商旅(10.7%)'}])+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表2 · 酒店服务商间夜数占比</div>'+donut([{pct:44.04,color:C.blue},{pct:27.86,color:C.orange},{pct:18.42,color:C.teal},{pct:9.68,color:C.purple}],[{color:C.blue,label:'差旅壹号(44.0%)'},{color:C.orange,label:'同程商旅(27.9%)'},{color:C.teal,label:'携程商旅(18.4%)'},{color:C.purple,label:'美团商旅(9.7%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">图表3 · 各服务商酒店金额趋势（万元）</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[16,13,17,15,14,14]},
            {name:'同程商旅',color:C.orange,vals:[10,8,11,9,9,9]},
            {name:'携程商旅',color:C.teal,vals:[7,6,8,6,6,5]},
            {name:'美团商旅',color:C.purple,vals:[4,3,4,4,4,3]}])
        + '<div class="sec-title mt">图表4 · 各服务商间夜数趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[48,40,52,45,42,43]},
            {name:'同程商旅',color:C.orange,vals:[30,25,33,30,28,28]},
            {name:'携程商旅',color:C.teal,vals:[20,17,22,19,18,18]},
            {name:'美团商旅',color:C.purple,vals:[10,8,11,9,9,8]}])
        + '<div class="sec-title mt">酒店服务商对比 <span class="new-tag">需求20 新增</span></div>'
        + '<table class="tbl"><tr><th>服务商</th><th>间夜数</th><th>订单金额</th><th>同比</th><th>退订率</th><th>间夜均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>980</td><td>89.0万元</td><td>'+yoy(14.3)+'</td><td>5.5%</td><td>908元</td></tr>'
        +   '<tr><td>同程商旅</td><td>620</td><td>56.0万元</td><td>'+yoy(10.5)+'</td><td>6.1%</td><td>903元</td></tr>'
        +   '<tr><td>携程商旅</td><td>410</td><td>38.0万元</td><td>'+yoy(7.8)+'</td><td>4.8%</td><td>927元</td></tr>'
        +   '<tr><td>美团商旅</td><td>230</td><td>22.0万元</td><td>'+yoy(-1.5)+'</td><td>7.2%</td><td>957元</td></tr></table>'
        + '<div class="sec-title mt">各服务商 · 星级对比（间夜数 / 金额 / 均价） <span class="new-tag">需求20 新增</span></div>'
        + '<div style="overflow-x:auto"><table class="tbl">'
        +   '<tr><th rowspan="2">服务商</th><th colspan="3">二星/经济</th><th colspan="3">三星/舒适</th><th colspan="3">四星/高档</th><th colspan="3">五星/豪华</th></tr>'
        +   '<tr><th>间夜数</th><th>金额</th><th>均价</th><th>间夜数</th><th>金额</th><th>均价</th><th>间夜数</th><th>金额</th><th>均价</th><th>间夜数</th><th>金额</th><th>均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>200</td><td>8.0万</td><td>400元</td><td>350</td><td>24.0万</td><td>686元</td><td>380</td><td>45.0万</td><td>1,184元</td><td>50</td><td>12.0万</td><td>2,400元</td></tr>'
        +   '<tr><td>同程商旅</td><td>130</td><td>5.0万</td><td>385元</td><td>220</td><td>16.0万</td><td>727元</td><td>230</td><td>26.0万</td><td>1,130元</td><td>40</td><td>9.0万</td><td>2,250元</td></tr>'
        +   '<tr><td>携程商旅</td><td>90</td><td>3.5万</td><td>389元</td><td>150</td><td>9.5万</td><td>633元</td><td>145</td><td>19.0万</td><td>1,310元</td><td>25</td><td>6.0万</td><td>2,400元</td></tr>'
        +   '<tr><td>美团商旅</td><td>70</td><td>2.5万</td><td>357元</td><td>90</td><td>6.0万</td><td>667元</td><td>60</td><td>11.0万</td><td>1,833元</td><td>10</td><td>2.5万</td><td>2,500元</td></tr>'
        + '</table></div>'
        + reqbox([ {t:'<b>需求20</b>：酒店服务商 — 金额/间夜占比图 + 金额&间夜趋势 + 服务商对比表 + <b>星级子类型对比</b>（二/三/四/五星）；服务商维度字段<b>待接入</b>（HotelGroupName 非服务商）— ✅版式已落地', id:'—', tag:'新增'} ]);
    }},
    'svc-train': { crumb:'服务商报告_火车票', render:function(){
      return '<div class="callout">说明：火车服务商维度字段待确认；下方为目标版式（与机票一致），数据为示意。</div>'
        + '<div class="row">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表1 · 火车服务商金额占比 <span class="new-tag">需求20 新增</span></div>'+donut([{pct:42.86,color:C.blue},{pct:28.57,color:C.orange},{pct:17.86,color:C.teal},{pct:10.71,color:C.purple}],[{color:C.blue,label:'差旅壹号(42.9%)'},{color:C.orange,label:'同程商旅(28.6%)'},{color:C.teal,label:'携程商旅(17.9%)'},{color:C.purple,label:'美团商旅(10.7%)'}])+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表2 · 火车服务商出票张数占比</div>'+donut([{pct:43.61,color:C.blue},{pct:28.57,color:C.orange},{pct:18.05,color:C.teal},{pct:9.77,color:C.purple}],[{color:C.blue,label:'差旅壹号(43.6%)'},{color:C.orange,label:'同程商旅(28.6%)'},{color:C.teal,label:'携程商旅(18.0%)'},{color:C.purple,label:'美团商旅(9.8%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">图表3 · 各服务商火车金额趋势（万元）</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[2.1,1.8,2.3,2.0,1.9,1.9]},
            {name:'同程商旅',color:C.orange,vals:[1.4,1.2,1.5,1.3,1.3,1.3]},
            {name:'携程商旅',color:C.teal,vals:[0.9,0.8,1.0,0.8,0.8,0.7]},
            {name:'美团商旅',color:C.purple,vals:[0.5,0.45,0.55,0.5,0.5,0.5]}])
        + '<div class="sec-title mt">图表4 · 各服务商出票张数趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[180,150,190,170,160,160]},
            {name:'同程商旅',color:C.orange,vals:[110,90,120,108,100,95]},
            {name:'携程商旅',color:C.teal,vals:[70,60,80,70,65,65]},
            {name:'美团商旅',color:C.purple,vals:[40,35,42,38,35,35]}])
        + '<div class="sec-title mt">火车服务商对比 <span class="new-tag">需求20 新增</span></div>'
        + '<table class="tbl"><tr><th>服务商</th><th>出票张数</th><th>订单金额</th><th>同比</th><th>退改率</th><th>票均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>580</td><td>12.0万元</td><td>'+yoy(5.2)+'</td><td>16.7%</td><td>207元</td></tr>'
        +   '<tr><td>同程商旅</td><td>380</td><td>8.0万元</td><td>'+yoy(3.8)+'</td><td>15.2%</td><td>211元</td></tr>'
        +   '<tr><td>携程商旅</td><td>240</td><td>5.0万元</td><td>'+yoy(-6.0)+'</td><td>14.5%</td><td>208元</td></tr>'
        +   '<tr><td>美团商旅</td><td>145</td><td>3.0万元</td><td>'+yoy(2.4)+'</td><td>17.9%</td><td>207元</td></tr></table>'
        + '<div class="sec-title mt">各服务商 · 坐席对比（出票数 / 金额 / 均价） <span class="new-tag">需求20 新增</span></div>'
        + '<div style="overflow-x:auto"><table class="tbl">'
        +   '<tr><th rowspan="2">服务商</th><th colspan="3">一等座</th><th colspan="3">二等座</th><th colspan="3">其他</th></tr>'
        +   '<tr><th>出票数</th><th>金额</th><th>均价</th><th>出票数</th><th>金额</th><th>均价</th><th>出票数</th><th>金额</th><th>均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>30</td><td>1.0万</td><td>333元</td><td>480</td><td>9.5万</td><td>198元</td><td>70</td><td>1.5万</td><td>214元</td></tr>'
        +   '<tr><td>同程商旅</td><td>20</td><td>0.7万</td><td>350元</td><td>320</td><td>6.3万</td><td>197元</td><td>40</td><td>1.0万</td><td>250元</td></tr>'
        +   '<tr><td>携程商旅</td><td>12</td><td>0.4万</td><td>333元</td><td>200</td><td>4.0万</td><td>200元</td><td>28</td><td>0.6万</td><td>214元</td></tr>'
        +   '<tr><td>美团商旅</td><td>8</td><td>0.3万</td><td>375元</td><td>120</td><td>2.4万</td><td>200元</td><td>17</td><td>0.3万</td><td>176元</td></tr>'
        + '</table></div>'
        + reqbox([ {t:'<b>需求20</b>：火车服务商 — 金额/出票占比图 + 金额&出票趋势 + 服务商对比表 + <b>坐席子类型对比</b>（一等座/二等座/其他）；服务商维度字段<b>待确认</b> — ✅版式已落地', id:'—', tag:'新增'} ]);
    }},
    'svc-car': { crumb:'服务商报告_用车', render:function(){
      return '<div class="row">'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表1 · 用车服务商金额占比 <span class="new-tag">需求20 新增</span></div>'+donut([{pct:43.98,color:C.blue},{pct:28.70,color:C.orange},{pct:18.98,color:C.teal},{pct:8.33,color:C.purple}],[{color:C.blue,label:'差旅壹号(44.0%)'},{color:C.orange,label:'同程商旅(28.7%)'},{color:C.teal,label:'携程商旅(19.0%)'},{color:C.purple,label:'美团商旅(8.3%)'}])+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">图表2 · 用车服务商订单数占比</div>'+donut([{pct:44.44,color:C.blue},{pct:29.26,color:C.orange},{pct:18.15,color:C.teal},{pct:8.15,color:C.purple}],[{color:C.blue,label:'差旅壹号(44.4%)'},{color:C.orange,label:'同程商旅(29.3%)'},{color:C.teal,label:'携程商旅(18.1%)'},{color:C.purple,label:'美团商旅(8.1%)'}])+'</div>'
        + '</div>'
        + '<div class="sec-title mt">图表3 · 各服务商用车金额趋势（万元）</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[16,14,17,16,15,17]},
            {name:'同程商旅',color:C.orange,vals:[11,9,12,10,10,10]},
            {name:'携程商旅',color:C.teal,vals:[7,6,8,7,6,7]},
            {name:'美团商旅',color:C.purple,vals:[3,2.5,3.5,3,3,3]}])
        + '<div class="sec-title mt">图表4 · 各服务商订单数趋势</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[
            {name:'差旅壹号',color:C.blue,vals:[4200,3600,4400,4100,3900,3800]},
            {name:'同程商旅',color:C.orange,vals:[2800,2400,2900,2700,2600,2400]},
            {name:'携程商旅',color:C.teal,vals:[1750,1500,1800,1700,1600,1450]},
            {name:'美团商旅',color:C.purple,vals:[780,660,820,760,720,660]}])
        + '<div class="sec-title mt">用车服务商对比 <span class="new-tag">需求20 新增</span></div>'
        + '<table class="tbl"><tr><th>服务商</th><th>订单数</th><th>订单金额</th><th>同比</th><th>异常率</th><th>客单价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>24,000</td><td>95.0万元</td><td>'+yoy(12.5)+'</td><td>0.9%</td><td>39.6元</td></tr>'
        +   '<tr><td>同程商旅</td><td>15,800</td><td>62.0万元</td><td>'+yoy(8.3)+'</td><td>1.2%</td><td>39.2元</td></tr>'
        +   '<tr><td>携程商旅</td><td>9,800</td><td>41.0万元</td><td>'+yoy(15.2)+'</td><td>0.7%</td><td>41.8元</td></tr>'
        +   '<tr><td>美团商旅</td><td>4,400</td><td>18.0万元</td><td>'+yoy(-3.6)+'</td><td>1.5%</td><td>40.9元</td></tr></table>'
        + '<div class="sec-title mt">各服务商 · 车型对比（订单数 / 金额 / 均价） <span class="new-tag">需求20 新增</span></div>'
        + '<div style="overflow-x:auto"><table class="tbl">'
        +   '<tr><th rowspan="2">服务商</th><th colspan="3">经济型</th><th colspan="3">舒适型</th><th colspan="3">商务型</th><th colspan="3">豪华型</th></tr>'
        +   '<tr><th>订单数</th><th>金额</th><th>均价</th><th>订单数</th><th>金额</th><th>均价</th><th>订单数</th><th>金额</th><th>均价</th><th>订单数</th><th>金额</th><th>均价</th></tr>'
        +   '<tr><td>差旅壹号</td><td>13,200</td><td>45.0万</td><td>34元</td><td>9,100</td><td>38.0万</td><td>42元</td><td>1,500</td><td>9.0万</td><td>60元</td><td>200</td><td>3.0万</td><td>150元</td></tr>'
        +   '<tr><td>同程商旅</td><td>9,300</td><td>28.0万</td><td>30元</td><td>5,400</td><td>26.0万</td><td>48元</td><td>980</td><td>6.0万</td><td>61元</td><td>120</td><td>2.0万</td><td>167元</td></tr>'
        +   '<tr><td>携程商旅</td><td>5,800</td><td>18.5万</td><td>32元</td><td>3,400</td><td>16.5万</td><td>49元</td><td>520</td><td>4.0万</td><td>77元</td><td>80</td><td>2.0万</td><td>250元</td></tr>'
        +   '<tr><td>美团商旅</td><td>2,700</td><td>8.0万</td><td>30元</td><td>1,400</td><td>7.0万</td><td>50元</td><td>260</td><td>2.0万</td><td>77元</td><td>40</td><td>1.0万</td><td>250元</td></tr>'
        + '</table></div>'
        + reqbox([ {t:'<b>需求20</b>：用车服务商 — 金额/订单占比图 + 金额&订单趋势 + 服务商对比表 + <b>车型子类型对比</b>（经济/舒适/商务/豪华）；字段 <b>CarHailServiceProvider</b> 已有 — ✅本页已落地', id:'—', tag:'新增'} ]);
    }},

    /* ---------- 需求21：结算报告（新独立报告，依赖结算/财务/报销系统数据接入） ---------- */
    'set-reimburse': { crumb:'结算报告_报销看板', render:function(){
      return '<div class="callout">说明：结算报告依赖<b>结算 / 财务 / 报销系统</b>数据接入（需求21 · P0 · 待数据接入）；下方为目标版式，数据为示意。</div>'
        + kpis([{k:'已报销金额',v:'3,820,400元'},{k:'报销中金额',v:'268,900元'},{k:'未报销金额',v:'482,300元'},{k:'报销率',v:'83.4%'}])
        + '<div class="row mt" style="margin-top:20px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">报销状态分布（金额）</div>'+donut([{pct:83.4,color:C.teal},{pct:5.9,color:C.orange},{pct:10.7,color:C.blue}],[{color:C.teal,label:'已报销(83.4%)'},{color:C.orange,label:'报销中(5.9%)'},{color:C.blue,label:'未报销(10.7%)'}])+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">报销三态笔数</div>'+tableW(thead(['报销状态','金额','笔数','占比'])
              + trow(['已报销','3,820,400元','1,204','83.4%'])+trow(['报销中','268,900元','89','5.9%'])+trow(['未报销','482,300元','156','10.7%'])+trow(['合计','4,571,600元','1,449','100%'],true))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">报销趋势（按状态）</div>'
        + stackBars([
            {label:'2026-1',segs:[{v:62,color:C.teal},{v:4,color:C.orange},{v:6,color:C.blue}]},{label:'2026-2',segs:[{v:58,color:C.teal},{v:5,color:C.orange},{v:8,color:C.blue}]},
            {label:'2026-3',segs:[{v:71,color:C.teal},{v:4,color:C.orange},{v:9,color:C.blue}]},{label:'2026-4',segs:[{v:60,color:C.teal},{v:5,color:C.orange},{v:7,color:C.blue}]},
            {label:'2026-5',segs:[{v:55,color:C.teal},{v:4,color:C.orange},{v:10,color:C.blue}]},{label:'2026-6',segs:[{v:32,color:C.teal},{v:5,color:C.orange},{v:8,color:C.blue}]}
          ],90,'万元',[{color:C.blue,label:'未报销'},{color:C.orange,label:'报销中'},{color:C.teal,label:'已报销'}])
        + '<div class="sec-title mt">各组织报销情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','应报销金额','已报销','报销中','未报销','报销率'])
              + trow(['四川示例企业集团有限公司','4,571,600','3,820,400','268,900','482,300','83.4%'])),
            orgDist('核算主体',['核算主体','应报销金额','已报销','报销中','未报销'],[4571600,3820400,268900,482300],{dec:[0,0,0,0],tail:[{h:'报销率',val:'83.4%'}]}),
            orgDist('成本中心',['成本中心','应报销金额','已报销','报销中','未报销'],[4571600,3820400,268900,482300],{dec:[0,0,0,0],tail:[{h:'报销率',val:'83.4%'}]})
          ])
        + '<div class="sec-title mt">报销明细 <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + tableW(thead(['报销单号','出行人','部门','关联订单数','报销金额','状态','提交时间'])
            + trow(['BX2605120012','张磊','国内营销中心/央客一部','3','4,860.00','已报销','2026-05-12'])
            + trow(['BX2605150034','李强','总经办','2','2,310.00','报销中','2026-05-15'])
            + trow(['BX2605200056','王敏','国内营销中心/央客一部','5','7,920.00','未报销','2026-05-20'])
            + trow(['BX2605250078','刘洋','客户成功中心','1','1,180.00','已报销','2026-05-25'])
            + trow(['BX2606010090','陈静','采购部','4','5,640.00','报销中','2026-06-01']))
        + moreBar(1449,20)
        + reqbox([ {t:'<b>需求21</b>：结算报告 · 报销看板（未报销/报销中/已报销三态 + 状态分布 + 趋势 + 各组织 + 明细导出）；依赖结算/财务/报销系统数据接入 — ✅目标版式已落地', id:'—', tag:'新增'} ]);
    }},
    'set-graylist': { crumb:'结算报告_灰名单', render:function(){
      return '<div class="callout">说明：灰名单依赖结算/报销系统数据接入（需求21 · P0 · 待数据接入）；下方为目标版式，数据为示意。</div>'
        + kpis([{k:'灰名单人数',v:'23人'},{k:'涉及金额',v:'186,400元'},{k:'平均超期天数',v:'47天'},{k:'已限制下单',v:'8人'}])
        + '<div class="row mt" style="margin-top:20px">'
        +   '<div style="flex:1;min-width:320px">'+card('场景说明', scene('灰名单', ['员工<b>超期未报销 / 未还款</b>达到阈值（默认 ≥30 天 或 ≥3 笔），自动纳入灰名单。','灰名单人员可<b>限制下单</b>或进入观察名单，结清后自动移出。','支持按部门 / 核算主体下钻，导出明细。']))+'</div>'
        +   '<div style="flex:1;min-width:320px"><div class="sec-title">灰名单涉及金额 TOP10</div>'
        +     vbar([{label:'段丽',val:28600,disp:'28,600'},{label:'吴刚',val:22400,disp:'22,400'},{label:'江波',val:18900,disp:'18,900'},{label:'夏敏',val:16200,disp:'16,200'},{label:'韦刚',val:14800,disp:'14,800'},{label:'贺强',val:12300,disp:'12,300'},{label:'龙静',val:10900,disp:'10,900'},{label:'武刚',val:9600,disp:'9,600'},{label:'易娜',val:8400,disp:'8,400'},{label:'常勇',val:7200,disp:'7,200'}],{color:C.blue,barw:24})+'</div>'
        + '</div>'
        + '<div class="sec-title mt">灰名单明细 <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + tableW(thead(['姓名','工号','部门','灰名单原因','涉及金额','超期天数','状态'])
            + trow(['段丽','2018****001','国内营销中心/央客一部','超期未报销','28,600元','62','限制下单'])
            + trow(['吴刚','2019****045','总经办','未还款 3 笔','22,400元','51','限制下单'])
            + trow(['江波','2020****078','客户成功中心','超期未报销','18,900元','45','观察'])
            + trow(['夏敏','2017****112','采购部','未还款','16,200元','38','观察'])
            + trow(['韦刚','2021****156','国内营销中心/央客一部','超期未报销','14,800元','33','观察']))
        + moreBar(23,3)
        + reqbox([ {t:'<b>需求21</b>：结算报告 · 灰名单（超期未报销/未还款监控 + TOP + 明细 + 限制下单状态）；依赖结算/报销系统数据接入 — ✅目标版式已落地', id:'—', tag:'新增'} ]);
    }},
    'set-payback': { crumb:'结算报告_回款情况', render:function(){
      return '<div class="callout">说明：回款情况依赖结算/财务系统数据接入（需求21 · P0 · 待数据接入）；口径需与财务对齐；下方为目标版式，数据为示意。</div>'
        + kpis([{k:'应回款总额',v:'2,860,000元'},{k:'已回款',v:'2,418,000元'},{k:'未回款',v:'442,000元'},{k:'回款率',v:'84.5%'}])
        + '<div class="sec-title mt">回款趋势（应回款 / 已回款）（万元）</div>'
        + lineChart(['2026-1','2026-2','2026-3','2026-4','2026-5','2026-6'],[{name:'应回款',color:C.blue,vals:[48,52,46,50,44,46]},{name:'已回款',color:C.teal,vals:[42,46,40,44,38,40]}])
        + '<div class="row mt" style="margin-top:24px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">未回款账龄分布（万元）</div>'
        +     vbar([{label:'0-30天',val:21.5,disp:'21.5'},{label:'31-60天',val:12.8,disp:'12.8'},{label:'61-90天',val:6.4,disp:'6.4'},{label:'90天以上',val:3.5,disp:'3.5'}],{color:C.blue,unit:'万',barw:40})+'</div>'
        +   '<div style="flex:1;min-width:340px"><div class="sec-title">账龄明细</div>'+tableW(thead(['账龄区间','未回款金额','笔数','占未回款比'])
              + trow(['0-30天','215,000元','86','48.6%'])+trow(['31-60天','128,000元','52','29.0%'])+trow(['61-90天','64,000元','24','14.5%'])+trow(['90天以上','35,000元','12','7.9%'])+trow(['合计','442,000元','174','100%'],true))+'</div>'
        + '</div>'
        + '<div class="sec-title mt">各组织回款情况</div>'
        + dimTable(['公司','核算主体','成本中心'],[
            tableW(thead(['分析对象','应回款','已回款','未回款','回款率','超90天'])
              + trow(['四川示例企业集团有限公司','2,860,000','2,418,000','442,000','84.5%','35,000'])),
            orgDist('核算主体',['核算主体','应回款','已回款','未回款','超90天'],[2860000,2418000,442000,35000],{dec:[0,0,0,0],tail:[{h:'回款率',val:'84.5%'}]}),
            orgDist('成本中心',['成本中心','应回款','已回款','未回款','超90天'],[2860000,2418000,442000,35000],{dec:[0,0,0,0],tail:[{h:'回款率',val:'84.5%'}]})
          ])
        + reqbox([ {t:'<b>需求21</b>：结算报告 · 回款情况（应/已/未回款 + 回款率 + 趋势 + 账龄分布 + 各组织）；依赖结算/财务系统数据接入，口径与财务对齐 — ✅目标版式已落地', id:'—', tag:'新增'} ]);
    }},
    'set-unbilled': { crumb:'结算报告_未进账单', render:function(){
      return '<div class="callout">说明：未进账单依赖结算/财务系统数据接入（需求21 · P0 · 待数据接入）；下方为目标版式，数据为示意。</div>'
        + kpis([{k:'未进账单金额',v:'312,600元'},{k:'未进账单笔数',v:'218笔'},{k:'最长未进账',v:'34天'},{k:'占应进账比',v:'6.8%'}])
        + '<div class="row mt" style="margin-top:20px">'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">未进账单业务类型分布</div>'+donut([{pct:42.5,color:C.air},{pct:28.3,color:C.hotel},{pct:21.4,color:C.car},{pct:7.8,color:C.train}],[{color:C.air,label:'机票(42.5%)'},{color:C.hotel,label:'酒店(28.3%)'},{color:C.car,label:'用车(21.4%)'},{color:C.train,label:'火车(7.8%)'}])+'</div>'
        +   '<div style="flex:1;min-width:300px"><div class="sec-title">未进账单趋势（万元）</div>'+vbar([{label:'2026-1',val:8.2,disp:'8.2'},{label:'2026-2',val:5.6,disp:'5.6'},{label:'2026-3',val:7.1,disp:'7.1'},{label:'2026-4',val:4.9,disp:'4.9'},{label:'2026-5',val:3.8,disp:'3.8'},{label:'2026-6',val:1.7,disp:'1.7'}],{color:C.blue,unit:'万',barw:40})+'</div>'
        + '</div>'
        + '<div class="sec-title mt">未进账单明细 <button class="export-btn">⤓ 导出明细(.xlsx)</button></div>'
        + tableW(thead(['订单号','业务类型','消费金额','出行时间','未进账原因','已挂起天数'])
            + trow(['2605****327','机票','2,180元','2026-05-28','对账中','12'])
            + trow(['2605****415','酒店','880元','2026-05-30','缺发票','10'])
            + trow(['2606****089','用车','156元','2026-06-02','系统延迟','8'])
            + trow(['2606****123','火车','553元','2026-06-03','对账中','7'])
            + trow(['2606****256','机票','1,920元','2026-06-05','缺发票','5']))
        + moreBar(218,11)
        + reqbox([ {t:'<b>需求21</b>：结算报告 · 未进账单（金额/笔数 + 业务类型分布 + 趋势 + 明细+原因）；依赖结算/财务系统数据接入 — ✅目标版式已落地', id:'—', tag:'新增'} ]);
    }},

    /* ---------- 集团站 · 集采报告（差旅壹号品牌周期汇总） ---------- */
    'cj-month': { crumb:'集采报告_月报', render:function(){ return cjReport({
      period:'2026年5月', trend:{unit:'万元',labels:['2025-12','2026-1','2026-2','2026-3','2026-4','2026-5'],vals:[1.05,0.84,1.50,0.92,0.77,1.38]}, savingTrend:{unit:'元',labels:['2025-12','2026-1','2026-2','2026-3','2026-4','2026-5'],vals:[120,90,150,60,80,90]}, headline:'2026年5月集采超过 1.38 万元，节约超过 0.01 万元',
      bullets:['2026年5月差旅集采 <b>13,825.57元</b>，较去年同比 <span class="cj-up">增长 8.41%</span>',
        '2026年5月机票节省 <b>0.01万元</b>，酒店节省 <b>0.00万元</b>，合计节省 <b>0.01万元</b>',
        '2026年5月累计为贵司 <b>17人</b> 提供差旅服务，差旅服务费 <b>117.00元</b>'],
      rows:[{type:'机票',orders:32,amt:'13,518.00',pct:'97.78%',yoy:'<span class="cj-up">+6.00%</span>'},
        {type:'酒店',orders:1,amt:'36.00',pct:'0.26%',yoy:'-'},
        {type:'火车',orders:203,amt:'228.00',pct:'1.65%',yoy:'<span class="cj-up">+325,614%</span>'},
        {type:'用车',orders:24,amt:'43.57',pct:'0.32%',yoy:'-'},
        {type:'总体消费',orders:260,amt:'13,825.57',pct:'100.00%',yoy:'<span class="cj-up">+8.41%</span>'}],
      saving:[{type:'机票',amt:'90.00元'},{type:'酒店',amt:'0.00元'},{type:'总体节省',amt:'90.00元'}] }); }},
    'cj-quarter': { crumb:'集采报告_季报', render:function(){ return cjReport({
      period:'26年Q1', trend:{unit:'万元',labels:['2025-Q2','2025-Q3','2025-Q4','2026-Q1'],vals:[29.5,28.0,26.5,24.9]}, savingTrend:{unit:'万元',labels:['2025-Q2','2025-Q3','2025-Q4','2026-Q1'],vals:[2.10,1.95,1.80,2.08]}, headline:'2026年Q1集采超过 2.49 万元，节约超过 2.08 万元',
      bullets:['2026年Q1差旅集采 <b>24,904.39元</b>，较去年同比 <span class="cj-down">下降 -91.58%</span>',
        '2026年Q1机票节省 <b>2.08万元</b>，酒店节省 <b>0.00万元</b>，合计节省 <b>2.08万元</b>',
        '2026年Q1累计为贵司 <b>67人</b> 提供差旅服务，差旅服务费 <b>934.88元</b>'],
      rows:[{type:'机票',orders:667,amt:'24,633.03',pct:'98.91%',yoy:'<span class="cj-down">-91.67%</span>'},
        {type:'酒店',orders:1,amt:'0.00',pct:'0.00%',yoy:'-'},
        {type:'火车',orders:46,amt:'293.94',pct:'1.18%',yoy:'<span class="cj-up">+146.33%</span>'},
        {type:'用车',orders:58,amt:'-22.58',pct:'-0.09%',yoy:'-'},
        {type:'总体消费',orders:772,amt:'24,904.39',pct:'100.00%',yoy:'<span class="cj-down">-91.58%</span>'}],
      saving:[{type:'机票',amt:'20,813.62元'},{type:'总体节省',amt:'20,813.62元'}] }); }},
    'cj-year': { crumb:'集采报告_年报', render:function(){ return cjReport({
      period:'2025年', trend:{unit:'万元',labels:['2022','2023','2024','2025'],vals:[62.0,58.0,76.6,49.0]}, savingTrend:{unit:'万元',labels:['2022','2023','2024','2025'],vals:[22.0,28.0,35.0,33.12]}, headline:'2025年集采超过 49.01 万元，节约超过 33.12 万元',
      bullets:['2025年差旅集采 <b>490,131.26元</b>，较去年同比 <span class="cj-down">下降 -36.03%</span>',
        '2025年机票节省 <b>33.12万元</b>，酒店节省 <b>0.00万元</b>，合计节省 <b>33.12万元</b>',
        '2025年累计为贵司 <b>123人</b> 提供差旅服务，差旅服务费 <b>5,126.02元</b>'],
      rows:[{type:'机票',orders:'5,798',amt:'489,782.49',pct:'99.93%',yoy:'<span class="cj-down">-35.93%</span>'},
        {type:'酒店',orders:7,amt:'37.62',pct:'0.01%',yoy:'<span class="cj-down">-91.84%</span>'},
        {type:'火车',orders:239,amt:'157.09',pct:'0.03%',yoy:'<span class="cj-up">+23.21%</span>'},
        {type:'用车',orders:50,amt:'144.00',pct:'0.03%',yoy:'<span class="cj-up">+426.32%</span>'},
        {type:'增值/其他',orders:23,amt:'10.06',pct:'0.00%',yoy:'<span class="cj-down">-99.03%</span>'},
        {type:'总体消费',orders:'6,117',amt:'490,131.26',pct:'100.00%',yoy:'<span class="cj-down">-36.03%</span>'}],
      saving:[{type:'机票',amt:'331,175.63元'},{type:'总体节省',amt:'331,175.63元'}] }); }},
    'cj-optional': { crumb:'集采报告_可选月年报', render:function(){ return cjReport({
      period:'2026年5-5月', trend:{unit:'万元',labels:['2025-12','2026-1','2026-2','2026-3','2026-4','2026-5'],vals:[1.05,0.84,1.50,0.92,0.77,1.38]}, savingTrend:{unit:'元',labels:['2025-12','2026-1','2026-2','2026-3','2026-4','2026-5'],vals:[120,90,150,60,80,90]}, headline:'2026年5-5月集采超过 1.38 万元，节约超过 0.01 万元（区间可自定义）',
      bullets:['可选月份区间汇总（示例选 2026年5月 - 5月）；口径同月报，<b>起止月份可自定义</b>',
        '2026年5-5月差旅集采 <b>13,825.57元</b>，较去年同比 <span class="cj-up">增长 8.41%</span>',
        '累计为贵司 <b>17人</b> 提供差旅服务，差旅服务费 <b>117.00元</b>'],
      rows:[{type:'机票',orders:32,amt:'13,518.00',pct:'97.78%',yoy:'<span class="cj-up">+6.00%</span>'},
        {type:'酒店',orders:1,amt:'36.00',pct:'0.26%',yoy:'-'},
        {type:'火车',orders:203,amt:'228.00',pct:'1.65%',yoy:'<span class="cj-up">+325,614%</span>'},
        {type:'用车',orders:24,amt:'43.57',pct:'0.32%',yoy:'-'},
        {type:'总体消费',orders:260,amt:'13,825.57',pct:'100.00%',yoy:'<span class="cj-up">+8.41%</span>'}],
      saving:[{type:'机票',amt:'90.00元'},{type:'总体节省',amt:'90.00元'}] }); }},

    /* ---------- 企业站 · 集采报告（周期 × 资源页签） ---------- */
    'cje-month': { crumb:'集采报告_月报', render:function(){ return cjEnt('month', CJE_MONTH); } },
    'cje-quarter': { crumb:'集采报告_季报', render:function(){ return cjEnt('quarter', CJE_QUARTER); } },
    'cje-year': { crumb:'集采报告_年报', render:function(){ return cjEnt('year', CJE_YEAR); } },
    'cje-optional': { crumb:'集采报告_可选月年报', render:function(){ return cjEnt('optional', CJE_OPTIONAL); } }
  };

  /* ---------- 侧边栏菜单 ---------- */
  var MENU=[
    {t:'总览报告',open:true,items:[['整体总览','ov-all'],['机票总览','ov-air'],['酒店总览','ov-hotel'],['火车票总览','ov-train'],['用车总览','ov-car']]},
    {t:'资源报告',items:[['机票','res-air'],['酒店','res-hotel']]},
    {t:'消费报告',items:[['机票','con-air'],['酒店','con-hotel'],['火车票','con-train'],['用车','con-car']]},
    {t:'合规报告',items:[['机票','comp-air'],['酒店','comp-hotel'],['火车票','comp-train'],['用车','comp-car']]},
    {t:'节约报告',items:[['整体','save-all'],['机票','save-air'],['酒店','save-hotel']]},
    {t:'对比报告',items:[['报告对比','cmp-all']]},
    {t:'服务商报告',items:[['整体','svc-all'],['机票','svc-air'],['酒店','svc-hotel'],['火车票','svc-train'],['用车','svc-car']]},
    /* 结算报告（需求21）暂时下线，先不展示；页面代码保留，恢复时取消本行注释即可 */
    /* {t:'结算报告',items:[['报销看板','set-reimburse'],['灰名单','set-graylist'],['回款情况','set-payback'],['未进账单','set-unbilled']]}, */
    {t:'因私报告',items:[['因私出行','priv-all']]},
    {t:'消费与节省明细',items:[['机票','detail-air'],['酒店','detail-hotel'],['火车票','detail-train'],['用车','detail-car']]}
  ];
  var CJ_GROUP={t:'集采报告',items:[['月报','cj-month'],['季报','cj-quarter'],['年报','cj-year'],['可选月年报','cj-optional']]};
  var CJ_ENT={t:'集采报告',items:[['月报','cje-month'],['季报','cje-quarter'],['年报','cje-year'],['可选月年报','cje-optional']]};
  var MENU_ENT=MENU.concat([CJ_ENT]);
  var SITE='ent';
  var NAV={ ent:['首页','我的差旅','订单管理','商旅资源集采','差旅报告','管理中心','表单引擎'], grp:['商旅资源集采','差旅报告','结算管理','我的差旅','管理中心','下载管理','表单引擎'] };
  var ACCT={ ent:'示例企业集团有限公司 ∨', grp:'国内机票事业部 ∨' };
  function renderNav(){
    document.getElementById('navbar').innerHTML=NAV[SITE].map(function(t){return '<a href="#"'+(t==='差旅报告'?' class="active"':'')+'>'+t+'</a>';}).join('');
    document.getElementById('acctName').textContent=ACCT[SITE];
    document.getElementById('siteSwitch').textContent=(SITE==='ent'?'切换为集团站 ⇄':'切换为企业站 ⇄');
  }
  function setSite(s){ SITE=s; renderNav(); go(s==='grp'?'cj-month':'ov-all'); }

  /* ---------- 共享筛选栏（需求1 在此一处定义，全页生效） ---------- */
  var FILTER_DATA={
    '核算主体':['示例企业集团有限公司','成都核算中心','重庆核算中心','华东核算中心','华南核算中心','华北核算中心','华中核算中心','西南核算中心','西北核算中心','未分配'],
    '成本中心':['销售一部','销售二部','市场推广部','财务部','人力资源部','技术研发部','客户服务中心','行政管理部','采购部','未分配']
  };
  function filterBarHTML(){
    return ''
    + '<div class="filter-row">'
    +   '<div class="filter-item"><label>订单时间类型</label><div class="ctrl" style="min-width:110px">预订后 <span class="caret">∨</span></div></div>'
    +   '<div class="filter-item"><div class="ctrl date">2026年1月01日</div><span class="date-sep">→</span><div class="ctrl date">2026年6月08日</div></div>'
    +   '<div class="filter-item"><label>企业名称</label><div class="ctrl"><span class="ph">请选择企业名称</span><span class="caret">∨</span></div></div>'
    +   '<div class="filter-item"><label>部门</label><div class="ctrl"><span class="ph">请选择消费者所属部门名称</span><span class="caret">∨</span></div></div>'
    +   '<div class="ext-toggle"><span class="box"></span>外部企业</div>'
    +   '<button class="btn btn-reset">重置</button><button class="btn btn-query">查询</button>'
    + '</div>'
    + '<div class="filter-row">'
    +   msField('核算主体')+msField('成本中心')+'<span id="page-filters"></span>'
    + '</div>';
  }
  function msField(field){
    return '<div class="filter-item"><label>'+field+' <span class="new-tag">新增</span></label>'
      + '<div class="ms-wrap" data-field="'+field+'">'
      +   '<div class="ctrl is-new ms-toggle"><span class="ph ms-label">请选择'+field+'</span><span class="caret">∨</span></div>'
      +   '<div class="ms-panel"><input class="ms-search" placeholder="搜索'+field+'"><div class="ms-list"></div>'
      +     '<div class="ms-source">数据来源：消费报表/基线去重值 · 多选 · 无层级</div>'
      +     '<div class="ms-footer"><a class="ms-clear">清空</a><a class="ms-ok">确定</a></div></div>'
      + '</div></div>';
  }
  function bindMultiselect(wrap){
    var field=wrap.getAttribute('data-field');
    var list=wrap.querySelector('.ms-list'), label=wrap.querySelector('.ms-label'), search=wrap.querySelector('.ms-search');
    var selected={};
    function render(f){ list.innerHTML='';
      FILTER_DATA[field].filter(function(v){return !f||v.indexOf(f)>-1;}).forEach(function(v){
        var row=document.createElement('label'); row.className='ms-opt';
        row.innerHTML='<input type="checkbox"'+(selected[v]?' checked':'')+'><span>'+v+'</span>';
        row.querySelector('input').addEventListener('change',function(e){ if(e.target.checked)selected[v]=true; else delete selected[v]; });
        list.appendChild(row);
      });
    }
    function upd(){ var k=Object.keys(selected);
      if(!k.length){label.textContent='请选择'+field; label.classList.add('ph');}
      else if(k.length===1){label.textContent=k[0]; label.classList.remove('ph');}
      else {label.textContent='已选 '+k.length+' 项'; label.classList.remove('ph');}
    }
    wrap.querySelector('.ms-toggle').addEventListener('click',function(e){ e.stopPropagation();
      var open=wrap.classList.contains('open');
      document.querySelectorAll('.ms-wrap.open').forEach(function(w){w.classList.remove('open');});
      if(!open){render(''); search.value=''; wrap.classList.add('open'); search.focus();}
    });
    search.addEventListener('input',function(){render(search.value.trim());});
    search.addEventListener('click',function(e){e.stopPropagation();});
    wrap.querySelector('.ms-panel').addEventListener('click',function(e){e.stopPropagation();});
    wrap.querySelector('.ms-clear').addEventListener('click',function(){selected={}; render(search.value.trim()); upd();});
    wrap.querySelector('.ms-ok').addEventListener('click',function(){upd(); wrap.classList.remove('open');});
  }
  function bindSingle(wrap){
    var label=wrap.querySelector('.ss-label');
    wrap.querySelector('.ss-toggle').addEventListener('click',function(e){ e.stopPropagation();
      var open=wrap.classList.contains('open');
      document.querySelectorAll('.ms-wrap.open,.ss-wrap.open').forEach(function(w){w.classList.remove('open');});
      if(!open) wrap.classList.add('open');
    });
    wrap.querySelectorAll('.ss-opt').forEach(function(o){
      o.addEventListener('click',function(e){ e.stopPropagation();
        wrap.querySelectorAll('.ss-opt').forEach(function(x){x.classList.remove('sel');});
        o.classList.add('sel'); label.textContent=o.getAttribute('data-v'); wrap.classList.remove('open');
      });
    });
  }

  /* ---------- 渲染 ---------- */
  function renderSidebar(active){
    var box=document.getElementById('sidebar'); box.innerHTML='';
    (SITE==='grp'?MENU.concat([CJ_GROUP]):MENU_ENT).forEach(function(g){
      var hasActive=g.items.some(function(it){return it[1]===active;});
      var open=(g.open!==false)||hasActive;
      var grp=document.createElement('div'); grp.className='grp'+(open?'':' collapsed');
      var title=document.createElement('div'); title.className='grp-title';
      title.innerHTML=g.t+' <span class="arrow">'+(open?'∧':'∨')+'</span>';
      title.addEventListener('click',function(){ grp.classList.toggle('collapsed'); title.querySelector('.arrow').textContent=grp.classList.contains('collapsed')?'∨':'∧'; });
      grp.appendChild(title);
      g.items.forEach(function(it){
        var m=document.createElement('div'); m.className='mitem'+(it[1]===active?' active':'');
        m.textContent=it[0];
        m.addEventListener('click',function(){ go(it[1]); });
        grp.appendChild(m);
      });
      box.appendChild(grp);
    });
  }
  function go(id){
    var p=PAGES[id]; if(!p) return;
    document.getElementById('crumb').textContent=p.crumb;
    var _fb=document.getElementById('filterbar');
    if(id.indexOf('cje-')===0){ _fb.innerHTML=cjEntFilter(id.replace('cje-','')); }
    else if(id.indexOf('detail-')===0){ _fb.innerHTML=''; }
    else { if(!document.getElementById('page-filters')){ _fb.innerHTML=filterBarHTML(); _fb.querySelectorAll('.ms-wrap').forEach(bindMultiselect); } document.getElementById('page-filters').innerHTML = p.extraFilter || ''; }
    document.getElementById('content').innerHTML=p.render();
    document.querySelectorAll('#page-filters .ss-wrap, #content .ss-wrap').forEach(bindSingle);
    bindCompare(document.getElementById('content'));
    bindYoyTable(document.getElementById('content'));
    bindDimTable(document.getElementById('content'));
    bindOvToggle(document.getElementById('content'));
    bindBarTip(document.getElementById('content'));
    bindDonutTip(document.getElementById('content'));
    bindCarDrill(document.getElementById('content'));
    bindCjTabs(document.getElementById('content'));
    bindJump(document.getElementById('content'));
    DETAIL_JUMP=null;
    renderSidebar(id);
  }

  /* ---------- 初始化 ---------- */
  document.getElementById('filterbar').innerHTML=filterBarHTML();
  document.querySelectorAll('.ms-wrap').forEach(bindMultiselect);
  document.addEventListener('click',function(){ document.querySelectorAll('.ms-wrap.open,.ss-wrap.open').forEach(function(w){w.classList.remove('open');}); });
  renderNav();
  document.getElementById('siteSwitch').addEventListener('click',function(e){ e.stopPropagation(); setSite(SITE==='ent'?'grp':'ent'); });
  go('ov-all');
})();
